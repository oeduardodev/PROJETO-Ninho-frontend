import { AntDesign } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { Alert, Image, Text, TextInput, View } from "react-native";

import { Button } from "@/components";
import { useAppTheme } from "@/theme/ThemeProvider";

import { createStyles } from "./styles";

export default function Login() {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Erro", "Preencha todos os campos.");
      return;
    }

    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      Alert.alert("Sucesso", "Login realizado!");
    } catch {
      Alert.alert("Erro", "Não foi possível realizar o login.");
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleLogin() {
    Alert.alert("Google", "Login com Google em desenvolvimento.");
  }

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/elementuilogin-2.png")}
        style={styles.elementTop}
      />
      <Image
        source={require("../../assets/images/elementuilogin.png")}
        style={styles.elementDown}
      />

      <View style={styles.content}>
        <Image
          source={require("../../assets/images/logo.png")}
          style={styles.logo}
        />
        <Text style={styles.title}>Ninho</Text>
        <Text style={styles.subTitle}>Um espaço seguro para você.</Text>

        <TextInput
          style={styles.input}
          placeholder="E-mail"
          placeholderTextColor={theme.colors.textMuted}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Senha"
          placeholderTextColor={theme.colors.textMuted}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Button
          label="Entrar"
          onPress={handleLogin}
          loading={loading}
          fullWidth
          style={styles.primaryButton}
        />

        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>ou continue com</Text>
          <View style={styles.dividerLine} />
        </View>

        <Button
          label="Entrar com Google"
          onPress={handleGoogleLogin}
          variant="outline"
          fullWidth
          leftIcon={
            <AntDesign
              name="google"
              size={26}
              color={theme.colors.primaryPressed}
            />
          }
        />
        <Text style={styles.registerText}>
          Ainda não tem uma conta?
          <Text style={styles.spanPressable}> Clique aqui </Text>
        </Text>
      </View>
    </View>
  );
}
