import type { Request, Response } from 'express';

// Webhook endpoint for dynamic actions
import {app, bot} from '../main';

export function dmEndpoint() {
    app.post('/dm/:userId', async (req: Request, res: Response) => {
        const userId = req.params.userId;
        const content = req.body.content;

        try {
            const user = await bot.users.fetch(userId); // Fetch the user by their ID
            if (user) {
                // Send the message as a DM to the user
                await user.send(content);
                res.status(200).send('Message sent successfully!');
            } else {
                res.status(404).send('User not found.');
            }
        } catch (error) {
            console.error('Error sending DM:', error);
            res.status(500).send('An error occurred while sending the DM.');
        }
    });
}