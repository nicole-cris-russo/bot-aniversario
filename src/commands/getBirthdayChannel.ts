import { SlashCommandBuilder } from 'discord.js';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const CONFIG_DB_PATH = join(process.cwd(), 'data', 'config.json');

interface BotConfig {
    birthdayChannelId: string | null;
    guildId: string | null;
}

export const data = new SlashCommandBuilder()
    .setName('getbirthdaychannel')
    .setDescription('Mostra qual canal está configurado para notificações de aniversário');

export async function execute(interaction: any) {
    try {
        // Carregar configuração
        let config: BotConfig = {
            birthdayChannelId: null,
            guildId: null
        };

        if (existsSync(CONFIG_DB_PATH)) {
            const data = readFileSync(CONFIG_DB_PATH, 'utf-8');
            config = JSON.parse(data);
        }

        if (!config.birthdayChannelId) {
            return await interaction.reply({
                content: '❌ Nenhum canal de aniversários foi configurado ainda!\nUse `/setbirthdaychannel` para configurar um canal.',
                ephemeral: true
            });
        }

        // Verificar se o canal ainda existe
        const channel = interaction.guild.channels.cache.get(config.birthdayChannelId);
        
        if (!channel) {
            return await interaction.reply({
                content: '❌ O canal configurado não existe mais ou foi deletado!\nUse `/setbirthdaychannel` para configurar um novo canal.',
                ephemeral: true
            });
        }

        await interaction.reply({
            content: `📢 **Canal de aniversários configurado:**\n${channel}\n\nAs notificações de aniversário serão enviadas neste canal.`,
            ephemeral: true
        });

    } catch (error) {
        console.error('Erro ao verificar canal de aniversários:', error);
        
        const errorMessage = {
            content: '❌ Ocorreu um erro ao verificar o canal de aniversários!',
            ephemeral: true
        };

        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(errorMessage);
        } else {
            await interaction.reply(errorMessage);
        }
    }
}
