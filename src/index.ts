import 'dotenv/config';
import { Client, GatewayIntentBits, Collection, Events, REST, Routes } from 'discord.js';
import { 
    registerBirthdayData, 
    registerBirthdayExecute,
    updateBirthdayData,
    updateBirthdayExecute,
    checkBirthdayData,
    checkBirthdayExecute,
    checkListBirthdayData,
    checkListBirthdayExecute,
    listaComandosData,
    listaComandosExecute,
    setBirthdayChannelData,
    setBirthdayChannelExecute,
    getBirthdayChannelData,
    getBirthdayChannelExecute,
    BirthdayChecker
} from './commands/index';
import { migrateFromJSON } from './utils/database';

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ] 
});

// Interface para comandos
interface Command {
    data: any;
    execute: (interaction: any) => Promise<any>;
}

// Coleção de comandos
const commands = new Collection<string, Command>();

// Adicionar comandos à coleção
commands.set(registerBirthdayData.name, { data: registerBirthdayData, execute: registerBirthdayExecute });
commands.set(updateBirthdayData.name, { data: updateBirthdayData, execute: updateBirthdayExecute });
commands.set(checkBirthdayData.name, { data: checkBirthdayData, execute: checkBirthdayExecute });
commands.set(checkListBirthdayData.name, { data: checkListBirthdayData, execute: checkListBirthdayExecute });
commands.set(listaComandosData.name, { data: listaComandosData, execute: listaComandosExecute });
commands.set(setBirthdayChannelData.name, { data: setBirthdayChannelData, execute: setBirthdayChannelExecute });
commands.set(getBirthdayChannelData.name, { data: getBirthdayChannelData, execute: getBirthdayChannelExecute });

// Instância do verificador de aniversários
let birthdayChecker: BirthdayChecker;

client.once(Events.ClientReady, async () => {
    console.log(`✅ Logged in as ${client.user?.tag}`);
    
    // Migrar dados de data_/ para data/ (se necessário)
    try {
        await migrateFromJSON();
    } catch (error) {
        console.error('❌ Erro durante a migração:', error);
    }
    
    // Inicializar verificador de aniversários
    birthdayChecker = new BirthdayChecker(client);
    birthdayChecker.start();
    
    // Registrar comandos slash
    await registerSlashCommands();
});

// Evento para lidar com interações de comandos
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = commands.get(interaction.commandName);

    if (!command) {
        console.error(`Comando ${interaction.commandName} não encontrado.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(`Erro ao executar comando ${interaction.commandName}:`, error);
        
        const errorMessage = {
            content: '❌ Ocorreu um erro ao executar este comando!',
            ephemeral: true
        };

        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(errorMessage);
        } else {
            await interaction.reply(errorMessage);
        }
    }
});

// Função para registrar comandos slash
async function registerSlashCommands() {
    const rest = new REST().setToken(process.env.TOKEN!);
    
    try {
        console.log('🔄 Iniciando registro de comandos slash...');

        const commandData = Array.from(commands.values()).map((command: Command) => command.data.toJSON());

        // Registrar comandos globalmente
        await rest.put(
            Routes.applicationCommands(client.user!.id),
            { body: commandData }
        );

        console.log('✅ Comandos slash registrados com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao registrar comandos slash:', error);
    }
}

// Tratamento de erros não capturados
process.on('unhandledRejection', error => {
    console.error('Erro não tratado:', error);
});

process.on('uncaughtException', error => {
    console.error('Exceção não capturada:', error);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('🛑 Desligando bot...');
    if (birthdayChecker) {
        birthdayChecker.stop();
    }
    client.destroy();
    process.exit(0);
});

client.login(process.env.TOKEN);