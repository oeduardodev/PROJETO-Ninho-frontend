# Ninho App

Aplicativo Expo/React Native conectado à API de autenticação do Ninho.

## Executar

1. Inicie o backend em `../backend` conforme o README dele.
2. Instale e execute o app:

```powershell
npm install
npm start
```

Em desenvolvimento, o app tenta descobrir automaticamente o IP do computador
usado pelo Expo. Se necessário, copie `.env.example` para `.env.local` e ajuste
`EXPO_PUBLIC_API_URL`:

```env
EXPO_PUBLIC_API_URL=http://192.168.0.10:3000/api/v1
```

Em celular físico, o aparelho e o computador precisam estar na mesma rede e a
porta `3000` deve estar liberada no firewall. No navegador e simulador iOS,
`http://localhost:3000/api/v1` normalmente é suficiente. No emulador Android,
use `http://10.0.2.2:3000/api/v1` se a descoberta automática não funcionar.

O login por e-mail, cadastro, restauração/renovação da sessão e logout estão
integrados. O login com Google ainda depende da configuração das credenciais
OAuth.
