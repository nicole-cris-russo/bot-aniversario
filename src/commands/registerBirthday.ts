import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { addBirthday, getBirthdayByUserId } from '../utils/database';

export const data = new SlashCommandBuilder()
    .setName('registrar_aniversario')
    .setDescription('Registra sua data de aniversário no bot')
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
        // Verificar se usuário já está registrado
        const existingUser = await getBirthdayByUserId(userId);
        if (existingUser) {
            return await interaction.reply({
                content: '❌ Você já possui uma data de aniversário registrada! Use `/atualizar_aniversario` para alterar.',
                ephemeral: true
            });
        }

        // Adicionar novo usuário
        const newBirthday = {
            userId,
            day,
            month,
            year,
            registeredAt: new Date().toISOString()
        };

        await addBirthday(newBirthday);

        // Criar embed de confirmação
        const embed = new EmbedBuilder()
            .setColor('#FF69B4')
            .setTitle('🎉 Aniversário Registrado!')
            .setDescription(`Seu aniversário foi registrado com sucesso!`)
            .addFields(
                { name: '📅 Data', value: `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`, inline: true },
                { name: '👤 Usuário', value: `<@${userId}>`, inline: true }
            )
            .setThumbnail(interaction.user.displayAvatarURL())
            .setTimestamp()
            .setFooter({ text: 'Bot de Aniversário' });

        // Selecionar mensagem e GIF aleatórios
        // const randomMessage = BIRTHDAY_MESSAGES[Math.floor(Math.random() * BIRTHDAY_MESSAGES.length)];
        // const randomGif = ANIME_DANCE_GIFS[Math.floor(Math.random() * ANIME_DANCE_GIFS.length)];

        // embed.setImage(randomGif);
        // embed.addFields({ name: '🎊 Mensagem Especial', value: randomMessage });

        await interaction.reply({ embeds: [embed] });

    } catch (error) {
        console.error('Erro ao registrar aniversário:', error);
        await interaction.reply({
            content: '❌ Ocorreu um erro ao registrar seu aniversário. Tente novamente mais tarde.',
            ephemeral: true
        });
    }
}
