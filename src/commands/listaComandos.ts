import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('lista_comandos')
    .setDescription('Exibe uma lista de todos os comandos disponíveis do bot');

export async function execute(interaction: ChatInputCommandInteraction) {
    try {
        const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle('📋 Lista de Comandos')
            .setDescription('Aqui estão todos os comandos disponíveis do Bot de Aniversário:')
            .addFields(
                {
                    name: '🎂 Comandos de Aniversário',
                    value: 
                        '`/registrar_aniversario` - Registra sua data de aniversário no bot\n' +
                        '`/atualizar_aniversario` - Atualiza sua data de aniversário\n' +
                        '`/ver_aniversario` - Verifica sua data de aniversário registrada\n' +
                        '`/ver_lista_de_aniversarios` - Verifica a lista de aniversários registrados',
                    inline: false
                },
                {
                    name: '⚙️ Comandos de Configuração',
                    value:
                        '`/configurar_canal_de_notificacoes` - Configura o canal onde as notificações de aniversário serão enviadas\n' +
                        '`/mostrar_canal_de_notificacoes` - Mostra qual canal está configurado para notificações de aniversário',
                    inline: false
                },
                {
                    name: 'ℹ️ Informações',
                    value:
                        '`/lista_comandos` - Exibe esta lista de comandos',
                    inline: false
                }
            )
            .setTimestamp()
            .setFooter({ text: 'Bot de Aniversário' });

        await interaction.reply({ embeds: [embed] });

    } catch (error) {
        console.error('Erro ao exibir lista de comandos:', error);
        await interaction.reply({
            content: '❌ Ocorreu um erro ao exibir a lista de comandos. Tente novamente mais tarde.',
            ephemeral: true
        });
    }
}

