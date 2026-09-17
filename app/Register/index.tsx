import { AntDesign } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useMemo, useState } from "react";
import { Alert, Image, Text, TextInput, View } from "react-native";

import { Button } from "@/components";
import { useAuth } from "@/contexts/AuthContext";
import type { RootStackParamList } from "@/routes/types/navigation";
import { getErrorMessage } from "@/services/api";
import { useAppTheme } from "@/theme/ThemeProvider";

import { createStyles } from "./styles";

type Props = NativeStackScreenProps<RootStackParamList, "Register">;

export default function Register({ navigation }: Props) {
  const theme = useAppTheme();
  const { signUp } = useAuth();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  async function handleRegister() {
    if (
      !email.trim() ||
      !password.trim() ||
      !phone.trim() ||
      !passwordConfirm.trim()
    ) {
      Alert.alert("Erro", "Preencha todos os campos.");
      return;
    }

    if (password !== passwordConfirm) {
      Alert.alert("Erro", "As senhas não coincidem.");
      return;
    }

    try {
      setLoading(true);
      await signUp({
        email: email.trim(),
        phone: phone.trim(),
        password,
        passwordConfirmation: passwordConfirm,
      });
    } catch (error) {
      Alert.alert("Erro", getErrorMessage(error));
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
          placeholder="Telefone"
          placeholderTextColor={theme.colors.textMuted}
          keyboardType="phone-pad"
          autoCapitalize="none"
          value={phone}
          onChangeText={setPhone}
        />
        <TextInput
          style={styles.input}
          placeholder="Senha"
          placeholderTextColor={theme.colors.textMuted}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TextInput
          style={styles.input}
          placeholder="Confirmar Senha"
          placeholderTextColor={theme.colors.textMuted}
          secureTextEntry
          value={passwordConfirm}
          onChangeText={setPasswordConfirm}
        />
        <Button
          label="Cadastrar"
          onPress={handleRegister}
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
          label="Cadastrar com Google"
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
          Já tem uma conta?
          <Text
            accessibilityRole="link"
            onPress={() => navigation.navigate("Login")}
            style={styles.spanPressable}
          >
            {" Entrar "}
          </Text>
        </Text>
      </View>
    </View>
  );
}
