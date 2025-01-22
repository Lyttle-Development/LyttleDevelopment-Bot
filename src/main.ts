import { Client, GatewayIntentBits } from 'discord.js';
import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import {initEndpoints} from './endpoints';

dotenv.config();

export const bot = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages, GatewayIntentBits.MessageContent] });
export const app = express();
export const port = 3000;

app.use(bodyParser.json());

// Discord bot login
bot.once('ready', () => {
    console.log('Bot is online!');
});

bot.login(process.env.DISCORD_TOKEN);

initEndpoints()

// Start the express server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
