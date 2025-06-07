const fs = require('fs');
const { createVoiceFiles } = require('../../utils/tts');

async function sendTTS(sock, chatId, text, quoted) {
  const files = await createVoiceFiles(text);
  for (const file of files) {
    await sock.sendMessage(
      chatId,
      { audio: { url: file }, mimetype: 'audio/mpeg', ptt: true },
      { quoted }
    );
    fs.unlinkSync(file);
  }
}

module.exports = { sendTTS };
