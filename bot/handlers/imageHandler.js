const fs = require('fs');
const { generateImage } = require('../../utils/image');

async function sendImage(sock, chatId, prompt, quoted) {
  try {
    const imgPath = await generateImage(prompt);
    await sock.sendMessage(chatId, { image: { url: imgPath } }, { quoted });
    fs.unlinkSync(imgPath);
  } catch (err) {
    console.error('[IMG]', err);
    await sock.sendMessage(chatId, { text: 'Image generation failed.' }, { quoted });
  }
}

module.exports = { sendImage };
