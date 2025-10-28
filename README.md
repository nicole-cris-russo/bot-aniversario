# Bot de Aniversário Discord

Um bot Discord que permite aos usuários registrar suas datas de aniversário e recebe mensagens automáticas de parabéns com GIFs de anime dançando!

## 🚀 Funcionalidades

- **Registro de Aniversário**: Comando `/registrar_aniversario` para registrar data de nascimento
- **Atualização de Dados**: Comando `/atualizar_aniversario` para modificar data registrada
- **Consulta de Dados**: Comando `/ver_aniversario` para verificar informações registradas
- **Configuração de Canal**: Comando `/setbirthdaychannel` para definir canal de notificações
- **Verificação de Canal**: Comando `/getbirthdaychannel` para ver canal configurado
- **Mensagens Automáticas**: Notificações automáticas no dia do aniversário
- **GIFs Aleatórios**: GIFs de anime dançando enviados junto com as mensagens
- **Mensagens Personalizadas**: Mensagens de parabéns aleatórias e personalizadas

## 📋 Pré-requisitos

- Node.js (versão 16 ou superior)
- npm ou yarn
- Bot Discord configurado no Discord Developer Portal

## 🛠️ Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd bot-aniversario
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
   - Copie `.env.example` para `.env`
   - Adicione seu token do bot Discord no arquivo `.env`

4. Compile o TypeScript:
```bash
npx tsc
```

5. Execute o bot:
```bash
npm run dev
```

## 🔧 Configuração do Bot Discord

1. Acesse o [Discord Developer Portal](https://discord.com/developers/applications)
2. Crie uma nova aplicação
3. Vá para a aba "Bot" e crie um bot
4. Copie o token e adicione no arquivo `.env`
5. Ative as seguintes intents:
   - Server Members Intent
   - Message Content Intent

## 📝 Comandos Disponíveis

### `/registrar_aniversario`
Registra sua data de aniversário no bot.

**Parâmetros:**
- `dia` (1-31): Dia do seu aniversário
- `mes` (1-12): Mês do seu aniversário  
- `ano` (1900-atual): Ano do seu nascimento

**Exemplo:**
```
/registrar_aniversario dia:15 mes:03 ano:1995
```

### `/atualizar_aniversario`
Atualiza sua data de aniversário registrada.

**Parâmetros:**
- `dia` (1-31): Novo dia do aniversário
- `mes` (1-12): Novo mês do aniversário
- `ano` (1900-atual): Novo ano de nascimento

### `/ver_aniversario`
Mostra suas informações de aniversário registradas.

### `/setbirthdaychannel`
Configura o canal onde as notificações de aniversário serão enviadas.

**Parâmetros:**
- `canal`: Canal de texto onde as notificações serão enviadas

**Permissões:** Apenas administradores podem usar este comando

**Exemplo:**
```
/setbirthdaychannel canal:#aniversarios
```

### `/getbirthdaychannel`
Mostra qual canal está configurado para receber notificações de aniversário.

## 🎉 Sistema de Notificações

O bot verifica automaticamente todos os dias se há usuários fazendo aniversário e envia:

- Mensagem de parabéns personalizada
- GIF aleatório de anime dançando
- Informações sobre idade e data
- Notificação **apenas no canal configurado** (não mais em todos os canais)

**⚠️ Importante:** Antes de usar o bot, configure um canal usando `/setbirthdaychannel` para que as notificações funcionem corretamente.

## 📁 Estrutura do Projeto

```
bot-aniversario/
├── commands/
│   ├── registerBirthday.ts    # Comando de registro
│   ├── updateBirthday.ts      # Comando de atualização
│   ├── checkBirthday.ts       # Comando de consulta
│   ├── setBirthdayChannel.ts  # Comando para configurar canal
│   ├── getBirthdayChannel.ts  # Comando para ver canal configurado
│   ├── birthdayChecker.ts     # Sistema de verificação automática
│   └── index.ts               # Exportações dos comandos
├── src/
│   └── index.ts               # Arquivo principal do bot
├── data/                      # Banco de dados JSON (criado automaticamente)
│   ├── birthdays.json         # Dados dos usuários
│   ├── notifications.json     # Controle de notificações
│   └── config.json            # Configuração do canal de aniversários
├── package.json
├── tsconfig.json
└── README.md
```

## 🔒 Banco de Dados

O bot utiliza arquivos JSON para armazenar dados:
- `birthdays.json`: Informações de aniversário dos usuários
- `notifications.json`: Controle de notificações enviadas
- `config.json`: Configuração do canal de aniversários

## 🎨 Personalização

Você pode personalizar:
- Mensagens de parabéns em `birthdayChecker.ts`
- GIFs de anime em `birthdayChecker.ts`
- Cores dos embeds nos comandos
- Frequência de verificação (padrão: 1 hora)

## 🐛 Solução de Problemas

### Bot não responde aos comandos
- Verifique se o token está correto no `.env`
- Confirme se as intents estão ativadas no Discord Developer Portal
- Verifique se o bot tem permissões no servidor

### Comandos slash não aparecem
- Aguarde alguns minutos para a sincronização
- Reinicie o bot
- Verifique se há erros no console

### Mensagens de aniversário não são enviadas
- **Configure um canal primeiro**: Use `/setbirthdaychannel` para definir onde as notificações devem ser enviadas
- Verifique se o bot tem permissão para enviar mensagens no canal configurado
- Confirme se a data está registrada corretamente
- Verifique os logs do console para erros
- Use `/getbirthdaychannel` para verificar qual canal está configurado

## 📄 Licença

Este projeto está sob a licença ISC.

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para:
- Reportar bugs
- Sugerir novas funcionalidades
- Enviar pull requests
- Melhorar a documentação

## 📞 Suporte

Se você encontrar problemas ou tiver dúvidas, abra uma issue no repositório.
