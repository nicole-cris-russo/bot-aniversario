# Discord Birthday Bot

## Overview
This is a Discord bot that helps manage birthday celebrations in Discord servers. The bot allows users to register their birthdays and automatically sends birthday messages with fun GIFs on their special day.

## Project Type
- **Language**: TypeScript
- **Runtime**: Node.js with ES Modules
- **Framework**: Discord.js v14
- **Database**: JSON file-based storage (local)

## Features
- Birthday registration and management
- Automatic birthday notifications with GIFs
- Configurable notification channel
- Slash commands for easy interaction
- Hourly birthday checking system

## Project Structure
```
bot-aniversario/
├── src/
│   ├── index.ts              # Main bot entry point
│   └── commands/             # All bot commands
│       ├── index.ts          # Command exports
│       ├── registerBirthday.ts
│       ├── updateBirthday.ts
│       ├── checkBirthday.ts
│       ├── setBirthdayChannel.ts
│       ├── getBirthdayChannel.ts
│       └── birthdayChecker.ts  # Automatic birthday checker
├── data/                     # Local JSON database files
│   ├── birthdays.json        # User birthday data
│   ├── notifications.json    # Notification tracking
│   └── config.json           # Bot configuration
├── package.json
└── tsconfig.json
```

## Available Commands
- `/registrar_aniversario` - Register your birthday
- `/atualizar_aniversario` - Update your birthday
- `/ver_aniversario` - Check your registered birthday
- `/canal_de_notificacoes` - Set the birthday notification channel (admin only)
- `/mostrar_canal_de_notificacoes` - View the configured notification channel

## Environment Setup
- **TOKEN**: Discord bot token (required)
- Configure via `.env` file in the project root

## Discord Bot Requirements
The bot requires the following intents to be enabled in the Discord Developer Portal:
- Server Members Intent
- Message Content Intent

## Running the Bot
Run the bot locally using:
```bash
npm run dev
```

## Recent Changes
- 2025-01-XX: Migração para armazenamento local
  - Migrado sistema de armazenamento do Replit Database para arquivos JSON locais
  - Removida dependência do @replit/database
  - Dados agora são armazenados na pasta `data/`
  - Sistema de migração automática de `data_/` para `data/` (se necessário)
  - Bot configurado para funcionar apenas localmente

## Database
O bot agora utiliza **arquivos JSON locais** na pasta `data/` para armazenar:
- Aniversários dos usuários (`birthdays.json`)
- Notificações enviadas (`notifications.json`)
- Configurações do bot (`config.json`)

A migração dos arquivos da pasta `data_/` para `data/` acontece automaticamente na primeira execução (se necessário).
