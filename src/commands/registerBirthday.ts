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

// Mensagens aleatórias de aniversário
const BIRTHDAY_MESSAGES = [
    "🎉 Parabéns! Que este novo ano de vida seja repleto de alegrias e conquistas!",
    "🎂 Feliz aniversário! Que todos os seus sonhos se realizem!",
    "🎈 Muitos parabéns! Que a felicidade sempre esteja ao seu lado!",
    "🎊 Parabéns pelo seu dia especial! Que venham muitos anos de sucesso!",
    "🌟 Feliz aniversário! Que este novo ciclo seja abençoado!",
    "🎁 Parabéns! Que cada dia seja uma nova oportunidade de ser feliz!",
    "🎪 Muitos parabéns! Que a vida continue te surpreendendo positivamente!",
    "🎭 Feliz aniversário! Que seus dias sejam sempre especiais!",
    "🎨 Parabéns! Que a criatividade e alegria sempre te acompanhem!",
    "🎯 Muitos parabéns! Que todos os seus objetivos sejam alcançados!"
];

// GIFs aleatórios de anime dançando
const ANIME_DANCE_GIFS = [
    "https://media.giphy.com/media/26BRrSvJUunhzxY3K/giphy.gif",
    "https://media.giphy.com/media/3o7btPCcdNniyf0ArS/giphy.gif",
    "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif",
    "https://media.giphy.com/media/3o7TKSjRrfIPjeiVy/giphy.gif",
    "https://media.giphy.com/media/3o7TKF1QIy1T6T8E1O/giphy.gif",
    "https://media.giphy.com/media/26BRrSvJUunhzxY3K/giphy.gif",
    "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif",
    "https://media.giphy.com/media/3o7btPCcdNniyf0ArS/giphy.gif",
    "https://media.giphy.com/media/3o7TKSjRrfIPjeiVy/giphy.gif",
    "https://media.giphy.com/media/3o7TKF1QIy1T6T8E1O/giphy.gif"
];

export const data = new SlashCommandBuilder()
    .setName('registrar_aniversario')
    .setDescription('Registra sua data de aniversário no bot')
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

        // Verificar se usuário já está registrado
        const existingUser = birthdays.find(b => b.userId === userId);
        if (existingUser) {
            return await interaction.reply({
                content: '❌ Você já possui uma data de aniversário registrada! Use `/atualizar_aniversario` para alterar.',
                ephemeral: true
            });
        }

        // Adicionar novo usuário
        const newBirthday: UserBirthday = {
            userId,
            day,
            month,
            year,
            registeredAt: new Date().toISOString()
        };

        birthdays.push(newBirthday);

        // Salvar no banco de dados
        const dataDir = join(process.cwd(), 'data');
        if (!existsSync(dataDir)) {
            const { mkdirSync } = await import('fs');
            mkdirSync(dataDir, { recursive: true });
        }
        writeFileSync(BIRTHDAY_DB_PATH, JSON.stringify(birthdays, null, 2));

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
