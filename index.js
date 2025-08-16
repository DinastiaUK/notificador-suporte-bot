// 1. Importar as bibliotecas
require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

// 2. Suas informações (LEMBRE-SE DE COLOCAR AS SUAS AQUI)
const BOT_TOKEN = process.env.BOT_TOKEN;
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;
const VOICE_CHANNEL_ID = '1311437368519295116';

// IDs dos cargos por prioridade
const ROLE_VIP_ID = '1327661820546383954';
const ROLE_BLACK_ID = '1327664677127323780';

// Mapa para guardar os timers
const userTimers = new Map();

// 3. Configurar as permissões do bot
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

// 4. Evento de "pronto"
client.on('ready', () => {
  console.log(`Bot está online como ${client.user.tag}!`);
});

// 5. O EVENTO PRINCIPAL
client.on('voiceStateUpdate', (oldState, newState) => {
  // Ignora se a ação foi de outro bot
  if (newState.member.user.bot) return;

  const userJoined = newState.channelId === VOICE_CHANNEL_ID && oldState.channelId !== VOICE_CHANNEL_ID;
  const userLeft = oldState.channelId !== VOICE_CHANNEL_ID && oldState.channelId === VOICE_CHANNEL_ID;

  // LÓGICA DE ENTRADA
  if (userJoined) {
    console.log(`${newState.member.user.username} entrou. Iniciando timer de 1 minuto...`);
    
    const timer = setTimeout(() => {
      // --- LÓGICA DA NOTIFICAÇÃO COMEÇA AQUI ---
      const member = newState.member;
      console.log(`-> Timer de ${member.user.username} concluído. Verificando cargos e enviando notificação.`);
      
      // LÓGICA DE PRIORIDADE DE CARGOS
      let priorityRole = 'Reinado'; // Valor padrão
      if (member.roles.cache.has(ROLE_VIP_ID)) {
        priorityRole = 'VIP';
      } else if (member.roles.cache.has(ROLE_BLACK_ID)) {
        priorityRole = 'Black';
      }
      
      // Tenta enviar a notificação para o n8n
      try {
        const userInfo = {
        displayName: member.displayName,      // O nome de exibição (ex: LeonardoFreire)
        username: member.user.username,       // O nome de usuário único (ex: .leonardofreire)
        userId: member.id,
        joinedAt: new Date().toISOString(),
        priority: priorityRole
      };

        axios.post(N8N_WEBHOOK_URL, userInfo);
        console.log(`--> Notificação enviada. Prioridade: ${priorityRole}`);
      } catch (error) {
        console.error('--> Erro ao enviar notificação:', error.message);
      }
      
      userTimers.delete(member.id);
    }, 60000);

    userTimers.set(newState.member.id, timer);
  }

  // LÓGICA DE SAÍDA
  if (userLeft) {
    if (userTimers.has(oldState.member.id)) {
      console.log(`${oldState.member.user.username} saiu antes de 1 minuto. Notificação cancelada.`);
      clearTimeout(userTimers.get(oldState.member.id));
      userTimers.delete(oldState.member.id);
    }
  }
});

// 6. Login do bot
client.login(BOT_TOKEN);