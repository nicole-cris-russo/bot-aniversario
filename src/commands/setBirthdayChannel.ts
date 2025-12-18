import { SlashCommandBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';
import { getConfig, saveConfig } from '../utils/database';

export const data = new SlashCommandBuilder()
    .setName('canal_de_notificacoes')
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
        const config = await getConfig();

        // Atualizar configuração
        const updatedConfig = {
            ...config,
            birthdayChannelId: channel.id,
            guildId: interaction.guild.id
        };

        // Salvar configuração
        await saveConfig(updatedConfig);

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
