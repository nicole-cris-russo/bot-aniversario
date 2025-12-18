import { Client, EmbedBuilder } from 'discord.js';
import { getBirthdays, getNotifications, updateNotification, getConfig } from '../utils/database';

const BIRTHDAY_MESSAGES_WITH_GIFS = [
    {
        message: "🎉 Parabéns! Você sobreviveu mais um ano... mas lembre-se: the cake is a lie! 🍰",
        gif: "https://media.tenor.com/BK9yDFxI2vgAAAAM/aperture-science-portal.gif"
    },
    {
        message: "🎂 Feliz aniversário! Você escolheu a pílula vermelha e agora está mais um ano na Matrix! 🔴",
        gif: "https://i.pinimg.com/originals/8f/79/01/8f7901e35f159be3521b1a4a04912628.gif"
    },
    {
        message: "🎊 Subiu de nível! Mas o custo de mana pra levantar da cama aumentou.",
        gif: "https://i.pinimg.com/originals/d0/3d/69/d03d69dbafb4dc8d13d082b327c2bcd5.gif"
    },
    {
        message: "🌟 Feliz aniversário! A vida te deu mais 365 dias pra continuar fingindo que sabe o que tá fazendo — sucesso!",
        gif: "https://i.pinimg.com/originals/35/1c/8a/351c8a0fbabdc2196e3e1542e5335c2f.gif"
    },
    {
        message: "🎁 Feliz aniversário! Que seu dia tenha menos bugs e mais cutscenes agradáveis.",
        gif: "https://i.pinimg.com/originals/95/b6/e4/95b6e46cdf26dfb2e8b898f21d98f912.gif"
    },
    {
        message: "🎪 Parabéns! Envelhecer é tipo atualizar o sistema: promete melhorias, mas deixa tudo mais lento.",
        gif: "https://i.pinimg.com/originals/da/36/63/da3663c176a175053a93bee0a91553e1.gif"
    },
    {
        message: "🎈 Muitos parabéns! Você está oficialmente mais velho e mais sábio (ou pelo menos mais velho)!",
        gif: "https://media.tenor.com/tPWIqdustusAAAAM/rei-dancing.gif"
    },
    {
        message: "🎭 Parabéns! Você tá tipo um jogo indie: caótico, cheio de charme e ninguém entende direito a história.",
        gif: "https://i.pinimg.com/1200x/f8/a4/92/f8a492643a7bcda08148faea327a063b.jpg"
    },
    {
        message: "🍰 Feliz aniversário! Que seu bolo tenha mais camadas que uma missão do Elden Ring.",
        gif: "https://i.pinimg.com/originals/d5/43/e4/d543e4d6958a4c64eb45545de3c4ed6f.gif"
    },
    {
        message: "🎊 Parabéns! Você está um ano mais próximo de poder reclamar do 'jovem de hoje em dia'!",
        gif: "https://media0.giphy.com/media/oz03Vg3TapuUqtiJos/giphy.gif"
    },
    {
        message: "🎈 Muitos parabéns! Que você continue sendo a pessoa especial que é (mesmo que às vezes seja especial de um jeito diferente)!",
        gif: "https://www.picgifs.com/glitter-gifs/h/happy-birthday/picgifs-happy-birthday-418491.gif"
    },
    {
        message: "🎂 Feliz aniversário! Hoje é o dia perfeito para refletir sobre todas as decisões questionáveis que te trouxeram até aqui!",
        gif: "https://pa1.aminoapps.com/5874/38ba8eb66e135aeb7136956a2ce5b0a0b83d30e8_hq.gif"
    },
    {
        message: "🎉 Parabéns! Você ganhou o direito de usar a frase 'na minha época' com mais propriedade!",
        gif: "https://greeting-cards.yolasite.com/resources/900956t6ykasplyr.gif"
    },
    {
        message: "🎪 Muitos parabéns! Você está oficialmente mais experiente em cometer os mesmos erros de sempre!",
        gif: "https://i.redd.it/54sr4nsssq371.gif"
    },
    {
        message: "🎯 Muitos parabéns! Você sobreviveu mais um ano sem ser cancelado nas redes sociais!",
        gif: "https://i.pinimg.com/originals/4c/29/28/4c2928220ad9965425bfa8edbb63ea91.gif"
    }
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

                // Enviar mensagem de aniversário
                await this.sendBirthdayMessage(birthday);

                // Atualizar registro de notificação
                await updateNotification(birthday.userId, todayString);
            }

        } catch (error) {
            console.error('Erro ao verificar aniversários:', error);
        }
    }

    private async sendBirthdayMessage(birthday: any) {
        try {
            // Carregar configuração do canal
            const config = await getConfig();

            // Verificar se há canal configurado
            if (!config.birthdayChannelId || !config.guildId) {
                console.log('Nenhum canal de aniversários configurado. Use /configurar_canal_de_notificacoes para configurar.');
                return;
            }

            // Buscar o servidor e canal configurados
            const guild = this.client.guilds.cache.get(config.guildId);
            if (!guild) {
                console.log('Servidor configurado não encontrado.');
                return;
            }

            const channel = guild.channels.cache.get(config.birthdayChannelId);
            if (!channel || channel.type !== 0) {
                console.log('Canal de aniversários configurado não encontrado ou não é um canal de texto.');
                return;
            }

            // Verificar permissões
            const botMember = guild.members.me;
            if (!botMember) {
                console.log('Bot não é membro do servidor configurado.');
                return;
            }
            
            const channelPermissions = channel.permissionsFor(botMember);
            if (!channelPermissions?.has('SendMessages')) {
                console.log('Bot não tem permissão para enviar mensagens no canal configurado.');
                return;
            }

            // Calcular idade
            const today = new Date();
            const birthDate = new Date(birthday.year, birthday.month - 1, birthday.day);
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }

            // Selecionar mensagem e GIF aleatórios (agora combinados)
            const randomBirthday = BIRTHDAY_MESSAGES_WITH_GIFS[Math.floor(Math.random() * BIRTHDAY_MESSAGES_WITH_GIFS.length)];
            const randomMessage = randomBirthday.message;
            const randomGif = randomBirthday.gif;

            // Criar embed de aniversário
            const embed = new EmbedBuilder()
                .setColor('#FF69B4')
                .setTitle('🎉 FELIZ ANIVERSÁRIO! 🎉')
                .setDescription(`**${randomMessage}**`)
                .addFields(
                    { name: '🎂 Aniversariante', value: `<@${birthday.userId}>`, inline: true },
                    { name: '🎊 Idade', value: `${age} anos`, inline: true },
                    { name: '📅 Data', value: `${birthday.day.toString().padStart(2, '0')}/${birthday.month.toString().padStart(2, '0')}`, inline: true }
                )
                .setImage(randomGif)
                .setTimestamp()
                .setFooter({ text: 'Bot de Aniversário - Parabéns!' });

            // Enviar mensagem no canal configurado
            await channel.send({ embeds: [embed] });
            console.log(`Mensagem de aniversário enviada para ${channel.name} no servidor ${guild.name}`);

        } catch (error) {
            console.error('Erro ao enviar mensagem de aniversário:', error);
        }
    }
}
