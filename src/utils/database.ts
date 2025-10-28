import Database from "@replit/database";

const db = new Database();

// Interfaces
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

// Chaves do banco de dados
const KEYS = {
    BIRTHDAYS: "birthdays",
    NOTIFICATIONS: "notifications",
    CONFIG: "config",
} as const;

// Funções para aniversários
export async function getBirthdays(): Promise<UserBirthday[]> {
    const result = await db.get(KEYS.BIRTHDAYS);
    if (!result) return [];
    return Array.isArray(result) ? result : [];
}

export async function saveBirthdays(birthdays: UserBirthday[]): Promise<void> {
    await db.set(KEYS.BIRTHDAYS, birthdays);
}

export async function addBirthday(birthday: UserBirthday): Promise<void> {
    const birthdays = await getBirthdays();
    birthdays.push(birthday);
    await saveBirthdays(birthdays);
}

export async function updateBirthday(
    userId: string,
    updatedBirthday: Partial<UserBirthday>,
): Promise<void> {
    const birthdays = await getBirthdays();
    const index = birthdays.findIndex((b) => b.userId === userId);
    if (index !== -1) {
        birthdays[index] = { ...birthdays[index], ...updatedBirthday };
        await saveBirthdays(birthdays);
    }
}

export async function removeBirthday(userId: string): Promise<void> {
    const birthdays = await getBirthdays();
    const filtered = birthdays.filter((b) => b.userId !== userId);
    await saveBirthdays(filtered);
}

export async function getBirthdayByUserId(
    userId: string,
): Promise<UserBirthday | null> {
    const birthdays = await getBirthdays();
    return birthdays.find((b) => b.userId === userId) || null;
}

// Funções para notificações
export async function getNotifications(): Promise<BirthdayNotification[]> {
    const result = await db.get(KEYS.NOTIFICATIONS);
    if (!result) return [];
    return Array.isArray(result) ? result : [];
}

export async function saveNotifications(
    notifications: BirthdayNotification[],
): Promise<void> {
    await db.set(KEYS.NOTIFICATIONS, notifications);
}

export async function updateNotification(
    userId: string,
    lastNotified: string,
): Promise<void> {
    const notifications = await getNotifications();
    const existing = notifications.find((n) => n.userId === userId);

    if (existing) {
        existing.lastNotified = lastNotified;
    } else {
        notifications.push({ userId, lastNotified });
    }

    await saveNotifications(notifications);
}

// Funções para configuração
export async function getConfig(): Promise<BotConfig> {
    const result = await db.get(KEYS.CONFIG);
    return (
        result || {
            birthdayChannelId: null,
            guildId: null,
        }
    );
}

export async function saveConfig(config: BotConfig): Promise<void> {
    await db.set(KEYS.CONFIG, config);
}

// Função para migrar dados do JSON para o Replit Database
export async function migrateFromJSON(): Promise<void> {
    try {
        console.log(
            "🔄 Iniciando migração de dados do JSON para o Replit Database...",
        );

        // Verificar se já existem dados no banco
        const existingBirthdays = await getBirthdays();
        const existingConfig = await getConfig();

        if (existingBirthdays.length > 0 || existingConfig.birthdayChannelId) {
            console.log("ℹ️ Dados já existem no banco. Pulando migração.");
            return;
        }

        // Importar fs dinamicamente para ESM
        const { readFileSync, existsSync } = await import("fs");
        const { join } = await import("path");

        const BIRTHDAY_DB_PATH = join(process.cwd(), "data", "birthdays.json");
        const NOTIFICATION_DB_PATH = join(
            process.cwd(),
            "data",
            "notifications.json",
        );
        const CONFIG_DB_PATH = join(process.cwd(), "data", "config.json");

        // Migrar aniversários
        if (existsSync(BIRTHDAY_DB_PATH)) {
            const birthdaysData = readFileSync(BIRTHDAY_DB_PATH, "utf-8");
            const birthdays: UserBirthday[] = JSON.parse(birthdaysData);
            await saveBirthdays(birthdays);
            console.log(`✅ Migrados ${birthdays.length} aniversários`);
        }

        // Migrar notificações
        if (existsSync(NOTIFICATION_DB_PATH)) {
            const notificationsData = readFileSync(
                NOTIFICATION_DB_PATH,
                "utf-8",
            );
            const notifications: BirthdayNotification[] =
                JSON.parse(notificationsData);
            await saveNotifications(notifications);
            console.log(`✅ Migradas ${notifications.length} notificações`);
        }

        // Migrar configuração
        if (existsSync(CONFIG_DB_PATH)) {
            const configData = readFileSync(CONFIG_DB_PATH, "utf-8");
            const config: BotConfig = JSON.parse(configData);
            await saveConfig(config);
            console.log("✅ Migrada configuração");
        }

        console.log("✅ Migração concluída com sucesso!");
    } catch (error) {
        console.error("❌ Erro durante a migração:", error);
        throw error;
    }
}