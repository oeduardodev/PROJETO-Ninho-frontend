import { Feather, Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/contexts/AuthContext";
import type { RootStackParamList } from "@/routes/types/navigation";
import { ApiError, getErrorMessage } from "@/services/api";
import {
  communityService,
  type CommunityComment,
  type CommunityPost,
  type FeedFilter,
} from "@/services/community";
import { palette, type AppTheme } from "@/theme";
import { useAppTheme } from "@/theme/ThemeProvider";

type Props =
  | NativeStackScreenProps<RootStackParamList, "Comunidade">
  | NativeStackScreenProps<RootStackParamList, "Home">;

const POST_TAGS = ["Desabafo", "Ansiedade", "Conquista", "Apoio"] as const;

export default function Comunidade(_props: Props) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { user, signOut } = useAuth();
  const [filter, setFilter] = useState<FeedFilter>("para");
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [feedError, setFeedError] = useState<string | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [postDraft, setPostDraft] = useState("");
  const [postTag, setPostTag] = useState<string>("Desabafo");
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);
  const [pendingWelcomes, setPendingWelcomes] = useState<Record<string, boolean>>({});
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const [comments, setComments] = useState<Record<string, CommunityComment[]>>({});
  const [commentCursors, setCommentCursors] = useState<Record<string, string | null>>({});
  const [commentLoading, setCommentLoading] = useState<Record<string, boolean>>({});
  const [commentSending, setCommentSending] = useState<Record<string, boolean>>({});
  const [commentErrors, setCommentErrors] = useState<Record<string, string | null>>({});
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const feedRequest = useRef(0);

  const showError = useCallback((error: unknown) => {
    if (error instanceof ApiError && error.status === 401) void signOut();
    return getErrorMessage(error);
  }, [signOut]);

  const loadFeed = useCallback(async (selectedFilter: FeedFilter, refresh = false) => {
    const requestId = ++feedRequest.current;
    if (refresh) {
      setRefreshing(true);
      setLoading(false);
    }
    else {
      setLoading(true);
      setPosts([]);
      setNextCursor(null);
    }
    setLoadingMore(false);
    setFeedError(null);
    try {
      const page = await communityService.listPosts(selectedFilter);
      if (requestId !== feedRequest.current) return;
      setPosts(page.items);
      setNextCursor(page.nextCursor);
    } catch (error) {
      if (requestId === feedRequest.current) setFeedError(showError(error));
    } finally {
      if (requestId === feedRequest.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [showError]);

  useEffect(() => {
    void loadFeed(filter);
    return () => {
      feedRequest.current += 1;
    };
  }, [filter, loadFeed]);

  const loadMorePosts = async () => {
    if (!nextCursor || loading || loadingMore) return;
    const requestId = feedRequest.current;
    setLoadingMore(true);
    try {
      const page = await communityService.listPosts(filter, nextCursor);
      if (requestId !== feedRequest.current) return;
      setPosts((current) => [
        ...current,
        ...page.items.filter((item) => !current.some((post) => post.id === item.id)),
      ]);
      setNextCursor(page.nextCursor);
      setFeedError(null);
    } catch (error) {
      if (requestId === feedRequest.current) setFeedError(showError(error));
    } finally {
      if (requestId === feedRequest.current) setLoadingMore(false);
    }
  };

  const addPost = async () => {
    const text = postDraft.trim();
    if (!text || posting) return;
    setPosting(true);
    setPostError(null);
    try {
      const post = await communityService.createPost(text, postTag);
      setPosts((current) => [post, ...current.filter((item) => item.id !== post.id)]);
      setPostDraft("");
      setPostTag("Desabafo");
      setComposerOpen(false);
      void loadFeed(filter, true);
    } catch (error) {
      setPostError(showError(error));
    } finally {
      setPosting(false);
    }
  };

  const changeWelcome = async (post: CommunityPost) => {
    if (pendingWelcomes[post.id]) return;
    setPendingWelcomes((current) => ({ ...current, [post.id]: true }));
    try {
      const result = await communityService.setWelcome(post.id, !post.welcomedByMe);
      setPosts((current) => current.map((item) =>
        item.id === post.id ? { ...item, ...result } : item,
      ));
    } catch (error) {
      setFeedError(showError(error));
    } finally {
      setPendingWelcomes((current) => ({ ...current, [post.id]: false }));
    }
  };

  const loadComments = async (postId: string, cursor?: string) => {
    if (commentLoading[postId]) return;
    setCommentLoading((current) => ({ ...current, [postId]: true }));
    setCommentErrors((current) => ({ ...current, [postId]: null }));
    try {
      const page = await communityService.listComments(postId, cursor);
      setComments((current) => ({
        ...current,
        [postId]: cursor
          ? [...(current[postId] ?? []), ...page.items.filter(
              (item) => !(current[postId] ?? []).some((comment) => comment.id === item.id),
            )]
          : page.items,
      }));
      setCommentCursors((current) => ({ ...current, [postId]: page.nextCursor }));
    } catch (error) {
      setCommentErrors((current) => ({ ...current, [postId]: showError(error) }));
    } finally {
      setCommentLoading((current) => ({ ...current, [postId]: false }));
    }
  };

  const toggleComments = (postId: string) => {
    const opening = !openComments[postId];
    setOpenComments((current) => ({ ...current, [postId]: opening }));
    if (opening && comments[postId] === undefined) void loadComments(postId);
  };

  const addComment = async (postId: string) => {
    const text = drafts[postId]?.trim();
    if (!text || commentSending[postId]) return;
    setCommentSending((current) => ({ ...current, [postId]: true }));
    setCommentErrors((current) => ({ ...current, [postId]: null }));
    try {
      const comment = await communityService.createComment(postId, text);
      setComments((current) => ({
        ...current,
        [postId]: [...(current[postId] ?? []), comment],
      }));
      setPosts((current) => current.map((post) =>
        post.id === postId ? { ...post, commentCount: post.commentCount + 1 } : post,
      ));
      setDrafts((current) => ({ ...current, [postId]: "" }));
    } catch (error) {
      setCommentErrors((current) => ({ ...current, [postId]: showError(error) }));
    } finally {
      setCommentSending((current) => ({ ...current, [postId]: false }));
    }
  };

  const removeComment = async (postId: string, commentId: string) => {
    try {
      await communityService.deleteComment(postId, commentId);
      setComments((current) => ({
        ...current,
        [postId]: (current[postId] ?? []).filter((comment) => comment.id !== commentId),
      }));
      setPosts((current) => current.map((post) =>
        post.id === postId ? { ...post, commentCount: Math.max(0, post.commentCount - 1) } : post,
      ));
    } catch (error) {
      setCommentErrors((current) => ({ ...current, [postId]: showError(error) }));
    }
  };

  const confirmRemoveComment = (postId: string, commentId: string) => {
    const message = "Este comentário será excluído.";
    if (Platform.OS === "web") {
      if (globalThis.confirm(message)) void removeComment(postId, commentId);
      return;
    }
    Alert.alert("Excluir comentário?", message, [
      { text: "Cancelar", style: "cancel" },
      { text: "Excluir", style: "destructive", onPress: () => void removeComment(postId, commentId) },
    ]);
  };

  const removePost = async (postId: string) => {
    try {
      await communityService.deletePost(postId);
      setPosts((current) => current.filter((post) => post.id !== postId));
      void loadFeed(filter, true);
    } catch (error) {
      setFeedError(showError(error));
    }
  };

  const confirmRemovePost = (postId: string) => {
    const message = "Esta publicação e seus comentários serão excluídos.";
    if (Platform.OS === "web") {
      if (globalThis.confirm(message)) void removePost(postId);
      return;
    }
    Alert.alert("Excluir publicação?", message, [
      { text: "Cancelar", style: "cancel" },
      { text: "Excluir", style: "destructive", onPress: () => void removePost(postId) },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Image
          source={require("../../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.headerTitle}>Comunidade</Text>
        <View style={styles.bellButton}>
          <Feather name="bell" size={22} color={theme.colors.text} />
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void loadFeed(filter, true)}
            tintColor={theme.colors.primary}
          />
        }
      >
        <View style={styles.heroRow}>
          <Text style={styles.heroText}>Você não precisa{"\n"}passar por isso só.</Text>
          <View style={styles.heroHeart}>
            <Ionicons
              name="heart-outline"
              size={32}
              color={theme.mode === "dark" ? palette.purple300 : "#C9BFE6"}
            />
          </View>
        </View>

        {composerOpen ? (
          <View style={styles.card}>
            <TextInput
              style={styles.postInput}
              value={postDraft}
              onChangeText={setPostDraft}
              placeholder="Como você está se sentindo hoje?"
              placeholderTextColor={theme.colors.textMuted}
              multiline
              maxLength={2000}
              accessibilityLabel="Texto da publicação"
            />
            <View style={styles.tagChoices}>
              {POST_TAGS.map((tag) => (
                <Pressable
                  key={tag}
                  onPress={() => setPostTag(tag)}
                  style={[styles.tagChoice, postTag === tag && styles.tagChoiceActive]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: postTag === tag }}
                >
                  <Text style={postTag === tag ? styles.tagChoiceTextActive : styles.tagChoiceText}>
                    {tag}
                  </Text>
                </Pressable>
              ))}
            </View>
            {postError && <Text style={styles.errorText}>{postError}</Text>}
            <View style={styles.composerActions}>
              <Pressable onPress={() => setComposerOpen(false)} disabled={posting}>
                <Text style={styles.linkText}>Cancelar</Text>
              </Pressable>
              <Pressable
                onPress={() => void addPost()}
                disabled={!postDraft.trim() || posting}
                style={[styles.primaryButton, (!postDraft.trim() || posting) && styles.sendButtonDisabled]}
                accessibilityRole="button"
              >
                <Text style={styles.primaryButtonText}>{posting ? "Publicando..." : "Publicar"}</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable
            style={styles.composer}
            onPress={() => setComposerOpen(true)}
            accessibilityRole="button"
          >
            <View style={styles.composerIconWrap}>
              <Text style={styles.composerEmoji}>☺</Text>
            </View>
            <Text style={styles.composerPlaceholder}>Como você está se sentindo hoje?</Text>
          </Pressable>
        )}

        <View style={styles.filters}>
          {(["para", "recentes"] as const).map((option) => (
            <Pressable
              key={option}
              onPress={() => setFilter(option)}
              style={[styles.pill, filter === option ? styles.pillActive : styles.pillInactive]}
              accessibilityRole="button"
              accessibilityState={{ selected: filter === option }}
            >
              <Text style={filter === option ? styles.pillActiveText : styles.pillInactiveText}>
                {option === "para" ? "Para você" : "Recentes"}
              </Text>
            </Pressable>
          ))}
        </View>

        {loading && <ActivityIndicator color={theme.colors.primary} />}
        {feedError && (
          <View style={styles.feedback}>
            <Text style={styles.errorText}>{feedError}</Text>
            <Pressable onPress={() => void loadFeed(filter)} accessibilityRole="button">
              <Text style={styles.linkText}>Tentar novamente</Text>
            </Pressable>
          </View>
        )}
        {!loading && !feedError && posts.length === 0 && (
          <Text style={styles.emptyText}>Ainda não há publicações. Compartilhe a primeira.</Text>
        )}

        {!loading && posts.map((post) => (
          <View key={post.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.avatar, { backgroundColor: post.author.avatarBg }]}>
                <Text style={styles.avatarEmoji}>{post.author.avatarEmoji}</Text>
              </View>
              <View style={styles.cardHeaderContent}>
                <View style={styles.nameRow}>
                  <View style={styles.authorName}>
                    <Text style={styles.name}>{post.author.name}</Text>
                    <Text style={styles.handle}>{post.author.handle}</Text>
                  </View>
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>{post.tag}</Text>
                  </View>
                  {post.author.id === user?.id && (
                    <Pressable
                      onPress={() => confirmRemovePost(post.id)}
                      accessibilityRole="button"
                      accessibilityLabel="Excluir publicação"
                      hitSlop={8}
                    >
                      <Feather name="trash-2" size={16} color={theme.colors.textMuted} />
                    </Pressable>
                  )}
                </View>
                <Text style={styles.postText}>{post.text}</Text>
              </View>
            </View>

            <View style={styles.cardFooter}>
              <Pressable
                style={styles.footerAction}
                onPress={() => void changeWelcome(post)}
                disabled={pendingWelcomes[post.id]}
                accessibilityRole="button"
                accessibilityLabel={post.welcomedByMe ? "Retirar acolhimento" : "Acolher publicação"}
                accessibilityState={{ selected: post.welcomedByMe }}
              >
                <Ionicons
                  name={post.welcomedByMe ? "heart" : "heart-outline"}
                  size={18}
                  color={palette.purple700}
                />
                <Text style={styles.footerActionText}>Acolher</Text>
                <Text style={styles.footerCount}>{post.welcomeCount}</Text>
              </Pressable>

              <View style={styles.footerDivider} />

              <Pressable
                style={styles.footerAction}
                onPress={() => toggleComments(post.id)}
                accessibilityRole="button"
                accessibilityLabel={`Comentar na publicação de ${post.author.name}`}
                accessibilityState={{ expanded: !!openComments[post.id] }}
              >
                <Ionicons name="chatbubble-outline" size={17} color={theme.colors.textMuted} />
                <Text style={styles.footerActionTextMuted}>Comentar</Text>
                <Text style={styles.footerCountMuted}>{post.commentCount}</Text>
              </Pressable>
            </View>

            {openComments[post.id] && (
              <View style={styles.commentsSection}>
                <Text style={styles.commentsTitle}>Comentários</Text>
                {commentLoading[post.id] && comments[post.id] === undefined && (
                  <ActivityIndicator color={theme.colors.primary} />
                )}
                {comments[post.id]?.length === 0 && (
                  <Text style={styles.emptyText}>Ainda não há comentários.</Text>
                )}
                {(comments[post.id] ?? []).map((comment) => (
                  <View key={comment.id} style={styles.comment}>
                    <View style={styles.commentHeader}>
                      <Text style={styles.commentAuthor}>{comment.author.name}</Text>
                      {comment.author.id === user?.id && (
                        <Pressable
                          onPress={() => confirmRemoveComment(post.id, comment.id)}
                          accessibilityRole="button"
                          accessibilityLabel="Excluir comentário"
                          hitSlop={8}
                        >
                          <Feather name="trash-2" size={14} color={theme.colors.textMuted} />
                        </Pressable>
                      )}
                    </View>
                    <Text style={styles.commentText}>{comment.text}</Text>
                  </View>
                ))}
                {commentCursors[post.id] && (
                  <Pressable
                    onPress={() => void loadComments(post.id, commentCursors[post.id] ?? undefined)}
                    disabled={commentLoading[post.id]}
                    accessibilityRole="button"
                  >
                    <Text style={styles.linkText}>
                      {commentLoading[post.id] ? "Carregando..." : "Ver mais comentários"}
                    </Text>
                  </Pressable>
                )}
                {commentErrors[post.id] && (
                  <View style={styles.feedback}>
                    <Text style={styles.errorText}>{commentErrors[post.id]}</Text>
                    {comments[post.id] === undefined && (
                      <Pressable onPress={() => void loadComments(post.id)}>
                        <Text style={styles.linkText}>Tentar novamente</Text>
                      </Pressable>
                    )}
                  </View>
                )}
                <View style={styles.commentComposer}>
                  <TextInput
                    style={styles.commentInput}
                    value={drafts[post.id] ?? ""}
                    onChangeText={(text) => setDrafts((current) => ({ ...current, [post.id]: text }))}
                    placeholder="Escreva um comentário..."
                    placeholderTextColor={theme.colors.textMuted}
                    multiline
                    maxLength={1000}
                    accessibilityLabel="Escreva um comentário"
                  />
                  <Pressable
                    style={[
                      styles.sendButton,
                      (!drafts[post.id]?.trim() || commentSending[post.id]) && styles.sendButtonDisabled,
                    ]}
                    onPress={() => void addComment(post.id)}
                    disabled={!drafts[post.id]?.trim() || commentSending[post.id]}
                    accessibilityRole="button"
                    accessibilityLabel="Enviar comentário"
                  >
                    <Ionicons name="send" size={17} color={theme.colors.textOnPrimary} />
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        ))}

        {!loading && nextCursor && (
          <Pressable
            onPress={() => void loadMorePosts()}
            disabled={loadingMore}
            style={styles.loadMoreButton}
            accessibilityRole="button"
          >
            <Text style={styles.linkText}>{loadingMore ? "Carregando..." : "Ver mais publicações"}</Text>
          </Pressable>
        )}
      </ScrollView>

      <View style={styles.bottomBar}>
        <View style={styles.bottomItemActive}>
          <Ionicons name="people" size={22} color={theme.colors.primary} />
          <Text style={styles.bottomLabelActive}>Comunidade</Text>
        </View>
        <View style={styles.bottomItem}>
          <Ionicons name="chatbubbles-outline" size={22} color={theme.colors.textMuted} />
          <Text style={styles.bottomLabel}>Conversas</Text>
        </View>
        <View style={styles.bottomItem}>
          <Feather name="life-buoy" size={22} color={theme.colors.textMuted} />
          <Text style={styles.bottomLabel}>Ajuda</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.colors.background,
    },
    logo: {
      width: 38,
      height: 38,
    },
    headerTitle: {
      fontFamily: theme.fonts.bodySemibold,
      fontSize: 17,
      lineHeight: 24,
      color: theme.mode === "dark" ? palette.purple100 : palette.purple900,
      letterSpacing: -0.2,
    },
    bellButton: {
      width: 36,
      height: 36,
      alignItems: "center",
      justifyContent: "center",
    },
    scroll: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.sm,
      paddingBottom: theme.spacing.xl,
      gap: theme.spacing.lg,
    },
    heroRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: theme.spacing.lg,
      paddingTop: theme.spacing.xs,
    },
    heroText: {
      flex: 1,
      fontFamily: theme.fonts.brandBold,
      fontSize: 26,
      lineHeight: 30,
      color: theme.mode === "dark" ? palette.purple100 : palette.purple900,
      letterSpacing: -0.5,
    },
    heroHeart: {
      paddingTop: theme.spacing.xs,
      opacity: 0.9,
    },
    composer: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.md,
      backgroundColor:
        theme.mode === "dark" ? theme.colors.surfaceMuted : palette.purple50,
      borderWidth: theme.borderWidths.hairline,
      borderColor:
        theme.mode === "dark" ? theme.colors.border : palette.purple100,
      borderRadius: theme.radii.lg,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
    },
    composerIconWrap: {
      width: 32,
      height: 32,
      borderRadius: theme.radii.full,
      backgroundColor: theme.colors.surface,
      borderWidth: theme.borderWidths.hairline,
      borderColor: theme.colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    composerEmoji: {
      fontSize: 18,
      color: theme.colors.textMuted,
    },
    composerPlaceholder: {
      flex: 1,
      fontFamily: theme.fonts.body,
      fontSize: 15,
      lineHeight: 20,
      color: theme.colors.textMuted,
    },
    postInput: {
      minHeight: 90,
      maxHeight: 220,
      color: theme.colors.text,
      fontFamily: theme.fonts.body,
      fontSize: 15,
      lineHeight: 21,
      textAlignVertical: "top",
    },
    tagChoices: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: theme.spacing.sm,
    },
    tagChoice: {
      borderWidth: theme.borderWidths.hairline,
      borderColor: theme.colors.border,
      borderRadius: theme.radii.full,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    tagChoiceActive: {
      borderColor: palette.purple700,
      backgroundColor: palette.purple700,
    },
    tagChoiceText: {
      fontFamily: theme.fonts.bodySemibold,
      fontSize: 12,
      color: theme.colors.textMuted,
    },
    tagChoiceTextActive: {
      fontFamily: theme.fonts.bodySemibold,
      fontSize: 12,
      color: palette.white,
    },
    composerActions: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: theme.spacing.lg,
    },
    primaryButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.radii.md,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
    },
    primaryButtonText: {
      color: theme.colors.textOnPrimary,
      fontFamily: theme.fonts.bodySemibold,
      fontSize: 14,
    },
    feedback: {
      gap: theme.spacing.sm,
    },
    errorText: {
      color: theme.colors.danger,
      fontFamily: theme.fonts.body,
      fontSize: 13,
    },
    linkText: {
      color: theme.colors.primary,
      fontFamily: theme.fonts.bodySemibold,
      fontSize: 14,
    },
    emptyText: {
      color: theme.colors.textMuted,
      fontFamily: theme.fonts.body,
      fontSize: 14,
      textAlign: "center",
    },
    filters: {
      flexDirection: "row",
      gap: theme.spacing.sm,
    },
    pill: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: 8,
      borderRadius: theme.radii.full,
      alignItems: "center",
      justifyContent: "center",
    },
    pillActive: {
      backgroundColor: palette.purple700,
      borderWidth: theme.borderWidths.hairline,
      borderColor: palette.purple700,
    },
    pillInactive: {
      backgroundColor: theme.colors.surface,
      borderWidth: theme.borderWidths.hairline,
      borderColor: theme.colors.border,
    },
    pillActiveText: {
      fontFamily: theme.fonts.bodySemibold,
      fontSize: 14,
      lineHeight: 18,
      color: palette.white,
    },
    pillInactiveText: {
      fontFamily: theme.fonts.body,
      fontSize: 14,
      lineHeight: 18,
      color: theme.colors.textMuted,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.lg,
      borderWidth: theme.borderWidths.hairline,
      borderColor: theme.colors.border,
      padding: theme.spacing.lg,
      gap: theme.spacing.md,
      ...theme.shadows.sm,
    },
    cardHeader: {
      flexDirection: "row",
      gap: theme.spacing.md,
      alignItems: "flex-start",
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: theme.radii.full,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      borderWidth: theme.borderWidths.hairline,
      borderColor: theme.colors.border,
    },
    avatarEmoji: {
      fontSize: 22,
    },
    cardHeaderContent: {
      flex: 1,
      gap: theme.spacing.sm,
    },
    nameRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: theme.spacing.sm,
    },
    authorName: {
      flex: 1,
    },
    name: {
      fontFamily: theme.fonts.bodyBold,
      fontSize: 15,
      lineHeight: 20,
      color: theme.colors.text,
    },
    handle: {
      fontFamily: theme.fonts.body,
      fontSize: 13,
      lineHeight: 16,
      color: theme.colors.textMuted,
      marginTop: 1,
    },
    tag: {
      backgroundColor:
        theme.mode === "dark" ? palette.purple900 : palette.purple50,
      borderRadius: theme.radii.full,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderWidth: theme.borderWidths.hairline,
      borderColor:
        theme.mode === "dark" ? palette.purple700 : palette.purple100,
    },
    tagText: {
      fontFamily: theme.fonts.bodySemibold,
      fontSize: 12,
      lineHeight: 14,
      color: theme.mode === "dark" ? palette.purple100 : palette.purple700,
    },
    postText: {
      fontFamily: theme.fonts.body,
      fontSize: 15,
      lineHeight: 21,
      color: theme.colors.text,
    },
    cardFooter: {
      flexDirection: "row",
      alignItems: "center",
      borderTopWidth: theme.borderWidths.hairline,
      borderTopColor: theme.colors.border,
      paddingTop: theme.spacing.sm,
      marginTop: theme.spacing.xs,
    },
    footerAction: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      paddingVertical: 2,
    },
    footerActionText: {
      fontFamily: theme.fonts.bodySemibold,
      fontSize: 13,
      color: palette.purple700,
    },
    footerCount: {
      fontFamily: theme.fonts.bodySemibold,
      fontSize: 13,
      color: palette.purple700,
      marginLeft: 2,
    },
    footerActionTextMuted: {
      fontFamily: theme.fonts.bodySemibold,
      fontSize: 13,
      color: theme.colors.textMuted,
    },
    footerCountMuted: {
      fontFamily: theme.fonts.body,
      fontSize: 13,
      color: theme.colors.textMuted,
      marginLeft: 2,
    },
    footerDivider: {
      width: theme.borderWidths.hairline,
      height: 18,
      backgroundColor: theme.colors.border,
      marginHorizontal: theme.spacing.sm,
    },
    commentsSection: {
      borderTopWidth: theme.borderWidths.hairline,
      borderTopColor: theme.colors.border,
      paddingTop: theme.spacing.md,
      gap: theme.spacing.md,
    },
    commentsTitle: {
      fontFamily: theme.fonts.bodyBold,
      fontSize: 14,
      color: theme.colors.text,
    },
    comment: {
      backgroundColor: theme.colors.surfaceMuted,
      borderRadius: theme.radii.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      gap: theme.spacing.xs,
    },
    commentAuthor: {
      fontFamily: theme.fonts.bodyBold,
      fontSize: 13,
      color: theme.colors.text,
    },
    commentHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    commentText: {
      fontFamily: theme.fonts.body,
      fontSize: 14,
      lineHeight: 19,
      color: theme.colors.text,
    },
    commentComposer: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: theme.spacing.sm,
    },
    commentInput: {
      flex: 1,
      minHeight: 40,
      maxHeight: 120,
      borderWidth: theme.borderWidths.hairline,
      borderColor: theme.colors.border,
      borderRadius: theme.radii.md,
      backgroundColor: theme.colors.surface,
      color: theme.colors.text,
      fontFamily: theme.fonts.body,
      fontSize: 14,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      textAlignVertical: "top",
    },
    sendButton: {
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: theme.radii.md,
      backgroundColor: theme.colors.primary,
    },
    sendButtonDisabled: {
      opacity: theme.opacity.disabled,
    },
    loadMoreButton: {
      alignItems: "center",
      paddingVertical: theme.spacing.md,
    },
    bottomBar: {
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
      paddingTop: theme.spacing.sm,
      paddingBottom: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      borderTopWidth: theme.borderWidths.hairline,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    bottomItem: {
      alignItems: "center",
      gap: 4,
      opacity: 0.9,
      minWidth: 72,
    },
    bottomItemActive: {
      alignItems: "center",
      gap: 4,
      minWidth: 72,
    },
    bottomLabel: {
      fontFamily: theme.fonts.body,
      fontSize: 12,
      lineHeight: 14,
      color: theme.colors.textMuted,
    },
    bottomLabelActive: {
      fontFamily: theme.fonts.bodySemibold,
      fontSize: 12,
      lineHeight: 14,
      color: theme.colors.primary,
    },
  });

