import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { getBirthdayByUserId, updateBirthday } from '../utils/database';

export const data = new SlashCommandBuilder()
    .setName('atualizar_aniversario')
    .setDescription('Atualiza sua data de aniversário')
    .addStringOption(option =>
        option.setName('dia')
            .setDescription('Dia do seu aniversário (1-31)')
            .setRequired(true)
            .setMinLength(1)
            .setMaxLength(2)
    )
    .addStringOption(option =>
        option.setName('mes')
            .setDescription('Mês do seu aniversário (1-12)')
            .setRequired(true)
            .setMinLength(1)
            .setMaxLength(2)
    )
    .addIntegerOption(option =>
        option.setName('ano')
            .setDescription('Ano do seu nascimento (ex: 1990)')
            .setRequired(true)
            .setMinValue(1900)
            .setMaxValue(new Date().getFullYear())
    );

export async function execute(interaction: ChatInputCommandInteraction) {
    const dayStr = interaction.options.getString('dia')!;
    const monthStr = interaction.options.getString('mes')!;
    const year = interaction.options.getInteger('ano')!;
    const userId = interaction.user.id;

    // Validar se dia e mês são números válidos
    const day = parseInt(dayStr);
    const month = parseInt(monthStr);

    if (isNaN(day) || isNaN(month)) {
        return await interaction.reply({
            content: '❌ Dia e mês devem ser números válidos!',
            ephemeral: true
        });
    }

    // Validar faixas de valores
    if (day < 1 || day > 31) {
        return await interaction.reply({
            content: '❌ Dia deve estar entre 1 e 31!',
            ephemeral: true
        });
    }

    if (month < 1 || month > 12) {
        return await interaction.reply({
            content: '❌ Mês deve estar entre 1 e 12!',
            ephemeral: true
        });
    }

    // Validar data
    const date = new Date(year, month - 1, day);
    if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
        return await interaction.reply({
            content: '❌ Data inválida! Por favor, verifique se o dia, mês e ano estão corretos.',
            ephemeral: true
        });
    }

    // Verificar se a data não é no futuro
    const today = new Date();
    if (date > today) {
        return await interaction.reply({
            content: '❌ A data de aniversário não pode ser no futuro!',
            ephemeral: true
        });
    }

    try {
        // Verificar se usuário está registrado
        const existingUser = await getBirthdayByUserId(userId);
        if (!existingUser) {
            return await interaction.reply({
                content: '❌ Você não possui uma data de aniversário registrada! Use `/registrar_aniversario` primeiro.',
                ephemeral: true
            });
        }

        // Atualizar data do usuário
        await updateBirthday(userId, {
            day,
            month,
            year
        });

        // Criar embed de confirmação
        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('✅ Aniversário Atualizado!')
            .setDescription(`Sua data de aniversário foi atualizada com sucesso!`)
            .addFields(
                { name: '📅 Nova Data', value: `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`, inline: true },
                { name: '👤 Usuário', value: `<@${userId}>`, inline: true }
            )
            .setThumbnail(interaction.user.displayAvatarURL())
            .setTimestamp()
            .setFooter({ text: 'Bot de Aniversário' });

        await interaction.reply({ embeds: [embed] });

    } catch (error) {
        console.error('Erro ao atualizar aniversário:', error);
        await interaction.reply({
            content: '❌ Ocorreu um erro ao atualizar seu aniversário. Tente novamente mais tarde.',
            ephemeral: true
        });
    }
}
