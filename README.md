# Mathcore_project
# Mathcore - Guia Completo de Configuração e Uso

Este guia fornece instruções detalhadas para configurar o ambiente, criar uma build com o **EAS (Expo Application Services)**, instalar o APK no celular e rodar o aplicativo.

---

## Passo 1: Configurar o Ambiente de Desenvolvimento

### 1. Instale os Pré-requisitos

Certifique-se de ter os seguintes softwares instalados no seu sistema:

- **Node.js** (versão LTS recomendada): [Download Node.js](https://nodejs.org)
- **npm** (vem junto com o Node.js)
- **Expo CLI**:

  Instale a Expo CLI globalmente com:

  ```bash
  npm install -g expo-cli
  ```

- **Git**: [Download Git](https://git-scm.com)
- **EAS CLI**:

  Instale a EAS CLI globalmente com:

  ```bash
  npm install -g eas-cli
  ```

- **Android Studio** (opcional, caso você queira usar um emulador Android)

---

## Passo 2: Clonar o Repositório

1. No terminal, clone o repositório e acesse o diretório do projeto:

   ```bash
   git clone https://github.com/seu-usuario/mathcore.git
   cd mathcore
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

---

## Passo 3: Configurar o Supabase

1. Abra o arquivo `lib/supabase.ts` e adicione suas credenciais do Supabase:

   ```typescript
   export const supabaseUrl = 'sua-supabase-url';
   export const supabaseAnonKey = 'sua-supabase-anon-key';
   ```

2. As credenciais podem ser obtidas no [painel do Supabase](https://supabase.com/dashboard).

⚠️ **Importante:** Não compartilhe estas chaves publicamente nem as inclua no repositório.

---

## Passo 4: Login no EAS

1. No terminal, faça login na sua conta Expo com o EAS:

   ```
   eas login
   ```

2. Siga as instruções para inserir seu e-mail e senha.

---

## Passo 5: Configurar o Profile de Desenvolvimento no EAS

1. No diretório do projeto, inicialize o EAS caso ainda não tenha feito isso:

   ```
   eas build:configure
   ```

   Isso criará um arquivo `eas.json` com as configurações padrão.

2. No arquivo `eas.json`, configure o profile de desenvolvimento. Um exemplo básico:

   ```json
   {
     "build": {
       "development": {
         "distribution": "internal",
         "android": {
           "buildType": "apk"
         }
       },
       "production": {
         "distribution": "store",
         "android": {
           "buildType": "app-bundle"
         }
       }
     }
   }
   ```

---

## Passo 6: Criar uma Build de Desenvolvimento

1. Inicie a criação de uma build de desenvolvimento:

   ```
   eas build --profile development --platform android
   ```

2. Aguarde o processo ser concluído. Após o término, você receberá um link para baixar o APK.

---

## Passo 7: Instalar o APK no Celular

1. Acesse o link da build no terminal ou no dashboard do Expo: [Expo Dashboard](https://expo.dev).
2. Baixe o APK para o seu celular.
3. No celular, habilite a instalação de apps de fontes desconhecidas (Configurações > Segurança).
4. Instale o APK no dispositivo.

---

## Passo 8: Rodar o Aplicativo no Celular

1. Certifique-se de que o servidor está rodando localmente. Inicie o servidor Expo:

   ```
   npm start -- --reset-cache
   ```

2. Conecte o celular e o computador à **mesma rede Wi-Fi**.
3. Abra o aplicativo instalado no celular e conecte ao servidor.

---

## Passo 9: Rodar no Navegador (Opcional)

1. Inicie o servidor Expo:

   ```
   npm start -- --reset-cache
   ```

2. No terminal, será exibido um link como:

   ```
   Web is waiting on http://localhost:8081
   ```

3. Acesse esse link no navegador
ou digite a tecla "W" no terminal .
---

## Passo 10: Debug e Problemas Comuns

- **Erro ao conectar ao servidor local:** Certifique-se de que o dispositivo e o computador estão na mesma rede Wi-Fi.
- **Resetar o cache:** Sempre use `npm start -- --reset-cache` para evitar conflitos de cache.
- **Se ainda tiver problemas ao abrir o app no celular, conecte um cabo usb entre o celular e o computador, habilite a "depuração por USB" e ative o modo desenvolvedor no dispositivo.
- **Observação, aparentemente não é possivel colocar arquivos no github que contenham "API Keys", o mesmo vale para arquivos ".env" pois ocorre um erro de segurança, então é necessario colocar depois que clonar a pasta, e retirar ao atualizar no repositório. 
---

## Links Úteis

- [Documentação do Expo](https://docs.expo.dev)
- [Configuração do Supabase](https://supabase.com/docs)
- [Expo EAS Build](https://expo.dev/eas)
- [Node.js](https://nodejs.org)

---
Alguma dúvida, além dos citados aqui, entre em contato comigo.
Whatsapp : 11 966203499; 
Gmail: christian.miranda.correia@gmail.com
Agora você está pronto para explorar e contribuir com o **Mathcore**! 

