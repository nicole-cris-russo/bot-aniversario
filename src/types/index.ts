export interface UserBirthday {
    userId: string;
    day: number;
    month: number;
    year: number;
    registeredAt: string;
}

export interface BirthdayNotification {
    userId: string;
    lastNotified: string;
}

export interface BotConfig {
    birthdayChannelId: string | null;
    guildId: string | null;
}