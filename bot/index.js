const baileys = require('baileys');
const { useMultiFileAuthState } = baileys;
const { handleGPT } = require('./handlers/gptHandler');
require('dotenv').config();

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('baileys_auth');
    const sock = baileys.default({
        printQRInTerminal: true,
        auth: state,
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const body = msg.message.conversation ||
            msg.message.extendedTextMessage?.text || '';

        if (body.startsWith('!gpt')) {
            const prompt = body.replace('!gpt', '').trim();
            const response = await handleGPT(prompt);
            await sock.sendMessage(msg.key.remoteJid, { text: response }, { quoted: msg });
        }
    });
}

startBot();

