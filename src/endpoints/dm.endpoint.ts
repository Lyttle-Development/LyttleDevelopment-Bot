import type {Request, Response} from 'express';

// Webhook endpoint for dynamic actions
import {app, bot} from '../main';
import {authorised, unAuthorised} from '../utils/authorised';
import {addToQueue} from '../utils/queue';
import {EmbedBuilder} from 'discord.js';

export function dmEndpoint() {
    app.post('/dm/:userId', async (req: Request, res: Response) => {
        const userId = req.params.userId;
        const content = req.body.content;
        const token = req.headers.authorization as string;

        // Create embed with the timestamp
        const timestamp = Date.now();
        // format date as = yyyy-mm-dd hh:mm:ss
        const dateStr = new Date(timestamp).toISOString().replace('T', ' at ').replace(/\.\d+Z/, '');
        const embed = new EmbedBuilder()
            .setDescription(`Message received: ${dateStr}`);


        if (!authorised(token)) return unAuthorised(res);

        try {
            const user = await bot.users.fetch(userId); // Fetch the user by their ID
            if (user) {
                // Send the message as a DM to the user
                addToQueue(
                    async () => {
                        await user.send({content, embeds: [embed]});
                    }
                );
                res.status(200).send('Message sent to queue successfully!');
            } else {
                res.status(404).send('User not found.');
            }
        } catch (error) {
            console.error('Error sending DM:', error);
            res.status(500).send('An error occurred while trying to send the DM.');
        }
    });
}