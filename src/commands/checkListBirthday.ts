import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { getBirthdays } from '../utils/database';

export const data = new SlashCommandBuilder()
    .setName('ver_lista_de_aniversarios')
    .setDescription('Verifica a lista de aniversários registrados');

export async function execute(interaction: ChatInputCommandInteraction) {
    try {
        // Buscar todos os aniversários
        const birthdays = await getBirthdays();
        
        if (birthdays.length === 0) {
            return await interaction.reply({
                content: '❌ Não há aniversários registrados! Use `/registrar_aniversario` para registrar.',
                ephemeral: true
            });
        }

        // Ordenar por mês e dia
        const sortedBirthdays = [...birthdays].sort((a, b) => {
            if (a.month !== b.month) {
                return a.month - b.month;
            }
            return a.day - b.day;
        });

        const today = new Date();
        const birthdayList: string[] = [];

        // Processar cada aniversário
        for (const birthday of sortedBirthdays) {
            try {
                // Buscar usuário do Discord
                const user = await interaction.client.users.fetch(birthday.userId);
                const userName = user.username;

                // Calcular idade
                const birthDate = new Date(birthday.year, birthday.month - 1, birthday.day);
                let age = today.getFullYear() - birthDate.getFullYear();
                const monthDiff = today.getMonth() - birthDate.getMonth();
                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                }

                // Calcular próximo aniversário
                const nextBirthday = new Date(today.getFullYear(), birthday.month - 1, birthday.day);
                if (nextBirthday < today) {
                    nextBirthday.setFullYear(today.getFullYear() + 1);
                }
                const daysUntilBirthday = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

                // Formatar data
                const dateStr = `${birthday.day.toString().padStart(2, '0')}/${birthday.month.toString().padStart(2, '0')}/${birthday.year}`;
                
                // Adicionar à lista
                const isToday = today.getMonth() === birthday.month - 1 && today.getDate() === birthday.day;
                const emoji = isToday ? '🎉' : '🎂';
                birthdayList.push(
                    `${emoji} **${userName}**\n` +
                    `   📅 ${dateStr} | ${age} anos | ${daysUntilBirthday === 0 ? 'Hoje!' : `${daysUntilBirthday} dias`}`
                );
            } catch (error) {
                // Se não conseguir buscar o usuário, usar o ID
                const dateStr = `${birthday.day.toString().padStart(2, '0')}/${birthday.month.toString().padStart(2, '0')}/${birthday.year}`;
                birthdayList.push(`🎂 **Usuário ${birthday.userId}**\n   📅 ${dateStr}`);
            }
        }

        // Dividir em campos se necessário (limite de 1024 caracteres por field)
        const fields: Array<{ name: string; value: string; inline: boolean }> = [];
        let currentField = '';
        let fieldIndex = 1;

        for (const entry of birthdayList) {
            if (currentField.length + entry.length + 2 > 1024) {
                fields.push({
                    name: fieldIndex === 1 ? '📋 Aniversariantes' : `📋 Aniversariantes (continuação)`,
                    value: currentField.trim(),
                    inline: false
                });
                currentField = entry + '\n';
                fieldIndex++;
            } else {
                currentField += entry + '\n';
            }
        }

        if (currentField.trim()) {
            fields.push({
                name: fieldIndex === 1 ? '📋 Aniversariantes' : `📋 Aniversariantes (continuação)`,
                value: currentField.trim(),
                inline: false
            });
        }

        // Criar embed
        const embed = new EmbedBuilder()
            .setColor('#FFD700')
            .setTitle('🎂 Lista de Aniversários')
            .setDescription(`Total de aniversariantes registrados: **${birthdays.length}**`)
            .addFields(fields)
            .setTimestamp()
            .setFooter({ text: 'Bot de Aniversário' });

        await interaction.reply({ embeds: [embed] });

    } catch (error) {
        console.error('Erro ao verificar lista de aniversários:', error);
        await interaction.reply({
            content: '❌ Ocorreu um erro ao verificar a lista de aniversários. Tente novamente mais tarde.',
            ephemeral: true
        });
    }
}
