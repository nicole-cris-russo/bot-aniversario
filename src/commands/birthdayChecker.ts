import { Client, EmbedBuilder } from 'discord.js';
import { getBirthdays, getNotifications, updateNotification, getConfig } from '../utils/database';

const BIRTHDAY_MESSAGES_WITH_GIFS = [
    {
        message: "🎪 Muitos parabéns! Você está oficialmente mais experiente em cometer os mesmos erros de sempre!",
        gif: "https://i.redd.it/54sr4nsssq371.gif"
    },
    {
        message: "🌟 Feliz aniversário! A vida te deu mais 365 dias pra continuar fingindo que sabe o que tá fazendo — sucesso!",
        gif: "https://i.pinimg.com/originals/35/1c/8a/351c8a0fbabdc2196e3e1542e5335c2f.gif"
    },
    {
        message: "🎭 Parabéns! Você tá tipo um jogo indie: caótico, cheio de charme e ninguém entende direito a história.",
        gif: "https://i.pinimg.com/1200x/f8/a4/92/f8a492643a7bcda08148faea327a063b.jpg"
    },
    {
        message: "🎂 Feliz aniversário! Hoje é o dia perfeito para refletir sobre todas as decisões questionáveis que te trouxeram até aqui!",
        gif: "https://pa1.aminoapps.com/5874/38ba8eb66e135aeb7136956a2ce5b0a0b83d30e8_hq.gif"
    },
    {
        message: "🎁 Feliz aniversário! Que seu dia tenha menos bugs e mais cutscenes agradáveis.",
        gif: "https://i.pinimg.com/originals/95/b6/e4/95b6e46cdf26dfb2e8b898f21d98f912.gif"
    },
    {
        message: "🍰 Feliz aniversário! Que seu bolo tenha mais camadas que uma missão do Elden Ring.",
        gif: "https://i.pinimg.com/originals/d5/43/e4/d543e4d6958a4c64eb45545de3c4ed6f.gif"
    },
    {
        message: "🎈 Muitos parabéns! Que você continue sendo a pessoa especial que é (mesmo que às vezes seja especial de um jeito diferente)!",
        gif: "https://www.picgifs.com/glitter-gifs/h/happy-birthday/picgifs-happy-birthday-418491.gif"
    },
];

export class BirthdayChecker {
    private client: Client;
    private checkInterval: NodeJS.Timeout | null = null;

    constructor(client: Client) {
        this.client = client;
    }

    public start() {
        // Verificar aniversários a cada hora
        this.checkInterval = setInterval(() => {
            this.checkBirthdays();
        }, 60 * 60 * 1000); // 1 hora

        // Verificar imediatamente ao iniciar
        this.checkBirthdays();
    }

    public stop() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
    }

    private async checkBirthdays() {
        try {
            const today = new Date();
            const currentDay = today.getDate();
            const currentMonth = today.getMonth() + 1; // getMonth() retorna 0-11

            // Carregar banco de dados de aniversários
            const birthdays = await getBirthdays();

            // Carregar banco de dados de notificações
            const notifications = await getNotifications();

            // Encontrar usuários com aniversário hoje
            const todayBirthdays = birthdays.filter(birthday => 
                birthday.day === currentDay && birthday.month === currentMonth
            );

            for (const birthday of todayBirthdays) {
                // Verificar se já foi notificado hoje
                const lastNotification = notifications.find(n => n.userId === birthday.userId);
                const todayString = today.toDateString();
                
                if (lastNotification && lastNotification.lastNotified === todayString) {
                    continue; // Já foi notificado hoje
                }

                // Enviar mensagem de aniversário e obter o índice da mensagem escolhida
                const messageIndex = await this.sendBirthdayMessage(birthday);

                // Atualizar registro de notificação com o índice da mensagem
                if (messageIndex !== null) {
                    await updateNotification(birthday.userId, todayString, messageIndex);
                } else {
                    await updateNotification(birthday.userId, todayString);
                }
            }

        } catch (error) {
            console.error('Erro ao verificar aniversários:', error);
        }
    }

    /**
     * Seleciona uma mensagem aleatória que ainda não foi enviada para o usuário.
     * Se todas já foram enviadas, escolhe uma que foi enviada menos vezes.
     * @param userId ID do usuário
     * @returns Índice da mensagem selecionada
     */
    private selectRandomMessage(userId: string, notifications: any[]): number {
        const userNotification = notifications.find(n => n.userId === userId);
        const sentIndices = userNotification?.messageIndices || [];

        // Contar quantas vezes cada mensagem foi enviada
        const messageCounts: { [key: number]: number } = {};
        sentIndices.forEach((index: number) => {
            messageCounts[index] = (messageCounts[index] || 0) + 1;
        });

        // Encontrar mensagens que ainda não foram enviadas
        const unsentIndices: number[] = [];
        for (let i = 0; i < BIRTHDAY_MESSAGES_WITH_GIFS.length; i++) {
            if (!messageCounts[i] || messageCounts[i] === 0) {
                unsentIndices.push(i);
            }
        }

        // Se há mensagens não enviadas, escolher uma aleatoriamente
        if (unsentIndices.length > 0) {
            const randomIndex = Math.floor(Math.random() * unsentIndices.length);
            return unsentIndices[randomIndex];
        }

        // Se todas já foram enviadas, encontrar a que foi enviada menos vezes
        let minCount = Infinity;
        let leastUsedIndices: number[] = [];

        for (let i = 0; i < BIRTHDAY_MESSAGES_WITH_GIFS.length; i++) {
            const count = messageCounts[i] || 0;
            if (count < minCount) {
                minCount = count;
                leastUsedIndices = [i];
            } else if (count === minCount) {
                leastUsedIndices.push(i);
            }
        }

        // Escolher aleatoriamente entre as menos usadas
        const randomIndex = Math.floor(Math.random() * leastUsedIndices.length);
        return leastUsedIndices[randomIndex];
    }

    private async sendBirthdayMessage(birthday: any): Promise<number | null> {
        try {
            // Carregar configuração do canal
            const config = await getConfig();

            // Verificar se há canal configurado
            if (!config.birthdayChannelId || !config.guildId) {
                console.log('Nenhum canal de aniversários configurado. Use /configurar_canal_de_notificacoes para configurar.');
                return null;
            }

            // Buscar o servidor e canal configurados
            const guild = this.client.guilds.cache.get(config.guildId);
            if (!guild) {
                console.log('Servidor configurado não encontrado.');
                return null;
            }

            const channel = guild.channels.cache.get(config.birthdayChannelId);
            if (!channel || channel.type !== 0) {
                console.log('Canal de aniversários configurado não encontrado ou não é um canal de texto.');
                return null;
            }

            // Verificar permissões
            const botMember = guild.members.me;
            if (!botMember) {
                console.log('Bot não é membro do servidor configurado.');
                return null;
            }
            
            const channelPermissions = channel.permissionsFor(botMember);
            if (!channelPermissions?.has('SendMessages')) {
                console.log('Bot não tem permissão para enviar mensagens no canal configurado.');
                return null;
            }

            // Carregar notificações para selecionar mensagem não repetida
            const notifications = await getNotifications();
            const selectedMessageIndex = this.selectRandomMessage(birthday.userId, notifications);

            // Selecionar mensagem e GIF aleatoriamente (sem repetir)
            const selectedBirthday = BIRTHDAY_MESSAGES_WITH_GIFS[selectedMessageIndex];
            const randomMessage = selectedBirthday.message;
            const randomGif = selectedBirthday.gif;

            // Calcular idade
            const today = new Date();
            const birthDate = new Date(birthday.year, birthday.month - 1, birthday.day);
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }

            // Buscar informações do usuário
            let userName = `ID: ${birthday.userId}`;
            try {
                const user = await this.client.users.fetch(birthday.userId);
                userName = user.displayName || user.username;
            } catch (error) {
                console.log(`Não foi possível buscar o usuário ${birthday.userId}`);
            }

            // Criar embed de aniversário
            const embed = new EmbedBuilder()
                .setColor('#FF69B4')
                .setTitle(`🎉 HOJE É O DIA DO SEU ANIVERSÁRIO ${userName}! 🎉`)
                .setDescription(`**${randomMessage}**`)
                .addFields(
                    // { name: `👤 Dados do Personagem:`, value: '\u200b', inline: false },
                    { name: `⭐ Nickname:`, value:`${userName}`, inline: true },
                    { name: `🆙 Subiu para o nível:`, value: `${age}`, inline: true },
                    { name: `📜 Foi criado em:`, value: `${birthday.day.toString().padStart(2, '0')}/${birthday.month.toString().padStart(2, '0')}/${birthday.year}`, inline: true }
                )
                .setImage(randomGif)
                .setTimestamp()
                .setFooter({ text: `Aviso: Não esqueça de parabenizar o amiguinho!` });

            // Enviar mensagem no canal configurado
            await channel.send({ content: '@everyone', embeds: [embed] });
            console.log(`Mensagem de aniversário enviada para ${channel.name} no servidor ${guild.name}`);

            return selectedMessageIndex;

        } catch (error) {
            console.error('Erro ao enviar mensagem de aniversário:', error);
            return null;
        }
    }
}
