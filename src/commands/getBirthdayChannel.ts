import { SlashCommandBuilder } from 'discord.js';
import { getConfig } from '../utils/database';

export const data = new SlashCommandBuilder()
    .setName('mostrar_canal_de_notificacoes')
    .setDescription('Mostra qual canal está configurado para notificações de aniversário');

export async function execute(interaction: any) {
    try {
        // Carregar configuração
        const config = await getConfig();

        if (!config.birthdayChannelId) {
            return await interaction.reply({
                content: '❌ Nenhum canal de aniversários foi configurado ainda!\nUse `/canal_de_notificacoes` para configurar um canal.',
                ephemeral: true
            });
        }

        // Verificar se o canal ainda existe
        const channel = interaction.guild.channels.cache.get(config.birthdayChannelId);
        
        if (!channel) {
            return await interaction.reply({
                content: '❌ O canal configurado não existe mais ou foi deletado!\nUse `/canal_de_notificacoes` para configurar um novo canal.',
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
