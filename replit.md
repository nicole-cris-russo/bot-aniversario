# Discord Birthday Bot

## Overview
This is a Discord bot that helps manage birthday celebrations in Discord servers. The bot allows users to register their birthdays and automatically sends birthday messages with fun GIFs on their special day.

## Project Type
- **Language**: TypeScript
- **Runtime**: Node.js with ES Modules
- **Framework**: Discord.js v14
- **Database**: JSON file-based storage

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
├── data/                     # JSON database files
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
- `/setbirthdaychannel` - Set the birthday notification channel (admin only)
- `/getbirthdaychannel` - View the configured notification channel

## Environment Setup
- **TOKEN**: Discord bot token (required)
- Configured via Replit Secrets

## Discord Bot Requirements
The bot requires the following intents to be enabled in the Discord Developer Portal:
- Server Members Intent
- Message Content Intent

## Running the Bot
The bot runs automatically via the configured workflow using `npm run dev`.

## Recent Changes
- 2025-10-28: Initial setup in Replit environment
  - Installed @types/node for TypeScript support
  - Configured workflow for automatic bot startup
  - Set up Discord bot token via Replit Secrets
