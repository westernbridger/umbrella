function detectLanguage(text = '') {
  if (/[\u00BF\u00A1\u00F1]/i.test(text) || /\b(?:que|porque|hola)\b/i.test(text)) {
    return 'es';
  }
  if (/[\u00E0\u00E2\u00E7\u00E8\u00EA\u00EB\u00EE\u00EF\u00F4\u00FB]/i.test(text) || /\b(?:bonjour|merci)\b/i.test(text)) {
    return 'fr';
  }
  return 'en';
}

module.exports = { detectLanguage };
