const { create } = require('@open-wa/wa-automate');
require('dotenv').config();

function start(client) {
    client.onMessage(async message => {
        if (message.body && message.body.startsWith('@zaphar')) {
            await client.sendText(message.from, '👋 Hey! Zaphar is online and ready.');
        }
    });
}

create({ headless: false }).then(start);

