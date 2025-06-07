async function handleReaction(sock, reaction) {
  const { key, reaction: react } = reaction;
  if (!key || !react) return;
  if (key.participant !== sock.user.id) return;
  const jid = key.remoteJid;
  const emoji = react.text;
  let text;
  if (emoji === '❤' || emoji === '❤️') text = 'Aww thanks for the love ❤️';
  else if (emoji === '😆' || emoji === '😂') text = 'Glad that hit home 😁';
  if (text) {
    await sock.sendMessage(jid, { text });
  }
}

module.exports = { handleReaction };
