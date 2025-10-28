import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

interface UserBirthday {
    userId: string;
    day: number;
    month: number;
    year: number;
    registeredAt: string;
}

const BIRTHDAY_DB_PATH = join(process.cwd(), 'data', 'birthdays.json');

export const data = new SlashCommandBuilder()
    .setName('atualizar_aniversario')
    .setDescription('Atualiza sua data de aniversário')
    .addIntegerOption(option =>
        option.setName('dia')
            .setDescription('Dia do seu aniversário (01-31)')
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(31)
    )
    .addIntegerOption(option =>
        option.setName('mes')
            .setDescription('Mês do seu aniversário (01-12)')
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(12)
    )
    .addIntegerOption(option =>
        option.setName('ano')
            .setDescription('Ano do seu nascimento (ex: 1990)')
            .setRequired(true)
            .setMinValue(1900)
            .setMaxValue(new Date().getFullYear())
    );

export async function execute(interaction: ChatInputCommandInteraction) {
    const day = interaction.options.getInteger('dia')!;
    const month = interaction.options.getInteger('mes')!;
    const year = interaction.options.getInteger('ano')!;
    const userId = interaction.user.id;

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
        // Carregar banco de dados existente
        let birthdays: UserBirthday[] = [];
        if (existsSync(BIRTHDAY_DB_PATH)) {
            const data = readFileSync(BIRTHDAY_DB_PATH, 'utf-8');
            birthdays = JSON.parse(data);
        }

        // Verificar se usuário está registrado
        const userIndex = birthdays.findIndex(b => b.userId === userId);
        if (userIndex === -1) {
            return await interaction.reply({
                content: '❌ Você não possui uma data de aniversário registrada! Use `/registrar_aniversario` primeiro.',
                ephemeral: true
            });
        }

        // Atualizar data do usuário
        birthdays[userIndex] = {
            ...birthdays[userIndex],
            day,
            month,
            year
        };

        // Salvar no banco de dados
        writeFileSync(BIRTHDAY_DB_PATH, JSON.stringify(birthdays, null, 2));

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
