import { SlashCommandBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';
import { readFileSync, existsSync, writeFileSync } from 'fs';
import { join } from 'path';

const CONFIG_DB_PATH = join(process.cwd(), 'data', 'config.json');

interface BotConfig {
    birthdayChannelId: string | null;
    guildId: string | null;
}

export const data = new SlashCommandBuilder()
    .setName('setbirthdaychannel')
    .setDescription('Configura o canal onde as notificações de aniversário serão enviadas')
    .addChannelOption(option =>
        option
            .setName('canal')
            .setDescription('Canal onde as notificações de aniversário serão enviadas')
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction: any) {
    try {
        const channel = interaction.options.getChannel('canal');
        
        if (!channel) {
            return await interaction.reply({
                content: '❌ Canal não encontrado!',
                ephemeral: true
            });
        }

        // Verificar se o bot tem permissão para enviar mensagens no canal
        const botMember = interaction.guild.members.me;
        const channelPermissions = channel.permissionsFor(botMember);
        
        if (!channelPermissions?.has('SendMessages')) {
            return await interaction.reply({
                content: '❌ Eu não tenho permissão para enviar mensagens neste canal!',
                ephemeral: true
            });
        }

        // Carregar configuração atual
        let config: BotConfig = {
            birthdayChannelId: null,
            guildId: null
        };

        if (existsSync(CONFIG_DB_PATH)) {
            const data = readFileSync(CONFIG_DB_PATH, 'utf-8');
            config = JSON.parse(data);
        }

        // Atualizar configuração
        config.birthdayChannelId = channel.id;
        config.guildId = interaction.guild.id;

        // Salvar configuração
        const dataDir = join(process.cwd(), 'data');
        if (!existsSync(dataDir)) {
            const { mkdirSync } = await import('fs');
            mkdirSync(dataDir, { recursive: true });
        }
        
        writeFileSync(CONFIG_DB_PATH, JSON.stringify(config, null, 2));

        await interaction.reply({
            content: `✅ Canal de aniversários configurado com sucesso!\n📢 As notificações de aniversário serão enviadas em: ${channel}`,
            ephemeral: true
        });

    } catch (error) {
        console.error('Erro ao configurar canal de aniversários:', error);
        
        const errorMessage = {
            content: '❌ Ocorreu um erro ao configurar o canal de aniversários!',
            ephemeral: true
        };

        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(errorMessage);
        } else {
            await interaction.reply(errorMessage);
        }
    }
}
