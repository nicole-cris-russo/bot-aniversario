import { BirthdayNotification, BotConfig, UserBirthday } from "@/types";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

// Caminho para a pasta de dados
const DATA_DIR = join(process.cwd(), "data");
const BIRTHDAY_DB_PATH = join(DATA_DIR, "birthdays.json");
const NOTIFICATION_DB_PATH = join(DATA_DIR, "notifications.json");
const CONFIG_DB_PATH = join(DATA_DIR, "config.json");

// Garantir que a pasta data existe
function ensureDataDir() {
    if (!existsSync(DATA_DIR)) {
        mkdirSync(DATA_DIR, { recursive: true });
    }
}

// Funções auxiliares para ler/escrever JSON
function readJSON<T>(path: string, defaultValue: T): T {
    ensureDataDir();
    if (!existsSync(path)) {
        writeFileSync(path, JSON.stringify(defaultValue, null, 2), "utf-8");
        return defaultValue;
    }
    try {
        const data = readFileSync(path, "utf-8");
        return JSON.parse(data);
    } catch (error) {
        console.error(`Erro ao ler ${path}:`, error);
        return defaultValue;
    }
}

function writeJSON<T>(path: string, data: T): void {
    ensureDataDir();
    writeFileSync(path, JSON.stringify(data, null, 2), "utf-8");
}

// Funções para aniversários
export async function getBirthdays(): Promise<UserBirthday[]> {
    return readJSON<UserBirthday[]>(BIRTHDAY_DB_PATH, []);
}

export async function saveBirthdays(birthdays: UserBirthday[]): Promise<void> {
    writeJSON(BIRTHDAY_DB_PATH, birthdays);
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
    return readJSON<BirthdayNotification[]>(NOTIFICATION_DB_PATH, []);
}

export async function saveNotifications(
    notifications: BirthdayNotification[],
): Promise<void> {
    writeJSON(NOTIFICATION_DB_PATH, notifications);
}

export async function updateNotification(
    userId: string,
    lastNotified: string,
    messageIndex?: number,
): Promise<void> {
    const notifications = await getNotifications();
    const existing = notifications.find((n) => n.userId === userId);

    if (existing) {
        existing.lastNotified = lastNotified;
        if (messageIndex !== undefined) {
            if (!existing.messageIndices) {
                existing.messageIndices = [];
            }
            existing.messageIndices.push(messageIndex);
        }
    } else {
        const newNotification: BirthdayNotification = {
            userId,
            lastNotified,
            messageIndices: messageIndex !== undefined ? [messageIndex] : [],
        };
        notifications.push(newNotification);
    }

    await saveNotifications(notifications);
}

// Funções para configuração
export async function getConfig(): Promise<BotConfig> {
    return readJSON<BotConfig>(CONFIG_DB_PATH, {
        birthdayChannelId: null,
        guildId: null,
    });
}

export async function saveConfig(config: BotConfig): Promise<void> {
    writeJSON(CONFIG_DB_PATH, config);
}

// Função para migrar dados de data_/ para data/ (se necessário)
export async function migrateFromJSON(): Promise<void> {
    try {
        ensureDataDir();
        
        // Verificar se já existem dados na pasta data/
        const existingBirthdays = await getBirthdays();
        const existingConfig = await getConfig();

        if (existingBirthdays.length > 0 || existingConfig.birthdayChannelId) {
            console.log("ℹ️ Dados já existem na pasta data/. Pulando migração.");
            return;
        }

        // Caminhos dos arquivos antigos em data_/
        const { join: pathJoin } = await import("path");
        const OLD_BIRTHDAY_DB_PATH = pathJoin(process.cwd(), "data_", "birthdays.json");
        const OLD_NOTIFICATION_DB_PATH = pathJoin(process.cwd(), "data_", "notifications.json");
        const OLD_CONFIG_DB_PATH = pathJoin(process.cwd(), "data_", "config.json");

        console.log("🔄 Verificando migração de dados de data_/ para data/...");

        // Migrar aniversários
        if (existsSync(OLD_BIRTHDAY_DB_PATH)) {
            const birthdaysData = readFileSync(OLD_BIRTHDAY_DB_PATH, "utf-8");
            const birthdays: UserBirthday[] = JSON.parse(birthdaysData);
            if (birthdays.length > 0) {
                await saveBirthdays(birthdays);
                console.log(`✅ Migrados ${birthdays.length} aniversários de data_/ para data/`);
            }
        }

        // Migrar notificações
        if (existsSync(OLD_NOTIFICATION_DB_PATH)) {
            const notificationsData = readFileSync(OLD_NOTIFICATION_DB_PATH, "utf-8");
            const notifications: BirthdayNotification[] = JSON.parse(notificationsData);
            if (notifications.length > 0) {
                await saveNotifications(notifications);
                console.log(`✅ Migradas ${notifications.length} notificações de data_/ para data/`);
            }
        }

        // Migrar configuração
        if (existsSync(OLD_CONFIG_DB_PATH)) {
            const configData = readFileSync(OLD_CONFIG_DB_PATH, "utf-8");
            const config: BotConfig = JSON.parse(configData);
            if (config.birthdayChannelId || config.guildId) {
                await saveConfig(config);
                console.log("✅ Migrada configuração de data_/ para data/");
            }
        }

        console.log("✅ Migração concluída com sucesso!");
    } catch (error) {
        console.error("❌ Erro durante a migração:", error);
        // Não lançar erro, apenas logar - o bot pode continuar funcionando
    }
}
