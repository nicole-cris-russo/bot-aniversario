import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { getBirthdayByUserId } from '../utils/database';

export const data = new SlashCommandBuilder()
    .setName('ver_aniversario')
    .setDescription('Verifica sua data de aniversário registrada');

export async function execute(interaction: ChatInputCommandInteraction) {
    const userId = interaction.user.id;

    try {
        // Procurar usuário
        const userBirthday = await getBirthdayByUserId(userId);
        if (!userBirthday) {
            return await interaction.reply({
                content: '❌ Você não possui uma data de aniversário registrada! Use `/registrar_aniversario` para registrar.',
                ephemeral: true
            });
        }

        // Calcular idade
        const today = new Date();
        const birthDate = new Date(userBirthday.year, userBirthday.month - 1, userBirthday.day);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        // Calcular próximo aniversário
        const nextBirthday = new Date(today.getFullYear(), userBirthday.month - 1, userBirthday.day);
        if (nextBirthday < today) {
            nextBirthday.setFullYear(today.getFullYear() + 1);
        }
        const daysUntilBirthday = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        // Criar embed
        const embed = new EmbedBuilder()
            .setColor('#FFD700')
            .setTitle('🎂 Sua Data de Aniversário')
            .setDescription(`Aqui estão as informações sobre seu aniversário registrado!`)
            .addFields(
                { name: '📅 Data de Nascimento', value: `${userBirthday.day.toString().padStart(2, '0')}/${userBirthday.month.toString().padStart(2, '0')}/${userBirthday.year}`, inline: true },
                { name: '🎂 Idade Atual', value: `${age} anos`, inline: true },
                { name: '📆 Próximo Aniversário', value: `${daysUntilBirthday} dias`, inline: true },
                { name: '📝 Registrado em', value: new Date(userBirthday.registeredAt).toLocaleDateString('pt-BR'), inline: true }
            )
            .setThumbnail(interaction.user.displayAvatarURL())
            .setTimestamp()
            .setFooter({ text: 'Bot de Aniversário' });

        await interaction.reply({ embeds: [embed] });

    } catch (error) {
        console.error('Erro ao verificar aniversário:', error);
        await interaction.reply({
            content: '❌ Ocorreu um erro ao verificar seu aniversário. Tente novamente mais tarde.',
            ephemeral: true
        });
    }
}
