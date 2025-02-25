import type { Request, Response } from 'express';

// Webhook endpoint for dynamic actions
import {app, bot} from '../main';
import {authorised, unAuthorised} from '../utils/authorised';
import * as process from 'node:process';

const uptimePushStatuses: Record<string, string> = {
    "UPTIME_STATUS_SE004NLAM_STORAGE": process.env.UPTIME_STATUS_SE004NLAM_STORAGE,
    "UPTIME_STATUS_SE004NLAM_CPU": process.env.UPTIME_STATUS_SE004NLAM_CPU,
    "UPTIME_STATUS_SE004NLAM_MEMORY": process.env.UPTIME_STATUS_SE004NLAM_MEMORY,
    "UPTIME_STATUS_SE002DEFF": process.env.UPTIME_STATUS_SE002DEFF,
    "UPTIME_STATUS_SE003FRGL": process.env.UPTIME_STATUS_SE003FRGL,
    "UPTIME_STATUS_SE005CABH": process.env.UPTIME_STATUS_SE005CABH,
}

const uptimeStatuses: Record<string, boolean> = {
    [uptimePushStatuses['UPTIME_STATUS_SE004NLAM_STORAGE']]: true,
    [uptimePushStatuses['UPTIME_STATUS_SE004NLAM_CPU']]: true,
    [uptimePushStatuses['UPTIME_STATUS_SE004NLAM_MEMORY']]: true,
    [uptimePushStatuses['UPTIME_STATUS_SE002DEFF']]: true,
    [uptimePushStatuses['UPTIME_STATUS_SE003FRGL']]: true,
    [uptimePushStatuses['UPTIME_STATUS_SE005CABH']]: true,
};

const emailSubjects: Record<string, [boolean, string]> = {
    'DigitalOcean monitoring triggered: Disk Utilization is running high  - db-postgresql-ams3-se0001': [false, uptimePushStatuses['UPTIME_STATUS_SE004NLAM_STORAGE']],
    'DigitalOcean monitoring resolved: Disk Utilization is running high  - db-postgresql-ams3-se0001': [true, uptimePushStatuses['UPTIME_STATUS_SE004NLAM_STORAGE']],
    'DigitalOcean monitoring triggered: CPU is running high  - db-postgresql-ams3-se0001': [false, uptimePushStatuses['UPTIME_STATUS_SE004NLAM_CPU']],
    'DigitalOcean monitoring resolved: CPU is running high  - db-postgresql-ams3-se0001': [true, uptimePushStatuses['UPTIME_STATUS_SE004NLAM_CPU']],
    'DigitalOcean monitoring triggered: Memory Utilization is running high  - db-postgresql-ams3-se0001': [false, uptimePushStatuses['UPTIME_STATUS_SE004NLAM_MEMORY']],
    'DigitalOcean monitoring resolved: Memory Utilization is running high  - db-postgresql-ams3-se0001': [true, uptimePushStatuses['UPTIME_STATUS_SE004NLAM_MEMORY']],
    'Anti-DDoS protection enabled for IP address 162.19.154.8': [false, uptimePushStatuses['UPTIME_STATUS_SE002DEFF']],
    'AntiDDoS protection on 162.19.154.8: situation back to normal': [true, uptimePushStatuses['UPTIME_STATUS_SE002DEFF']],
    'Anti-DDoS protection enabled for IP address 91.134.89.133': [false, uptimePushStatuses['UPTIME_STATUS_SE003FRGL']],
    'AntiDDoS protection on 91.134.89.133: situation back to normal': [true, uptimePushStatuses['UPTIME_STATUS_SE003FRGL']],
    'Anti-DDoS protection enabled for IP address 148.113.191.169': [false, uptimePushStatuses['UPTIME_STATUS_SE005CABH']],
    'AntiDDoS protection on 148.113.191.169: situation back to normal': [true, uptimePushStatuses['UPTIME_STATUS_SE005CABH']],
}

export function emailEndpoint() {
    setInterval(() => {
        // Push latest status to uptime service
        console.log('Pushing latest status to uptime service...');
        for (const [id, status] of Object.entries(uptimeStatuses)) {
            console.log(`Pushing status for ${id}: ${status}`);
            void fetch(`${process.env.UPTIME_URL}/api/push/${id}?status=${status ? "up" : 'down'}&msg=${status ? 'OK' : 'NOK'}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
        }
        console.log('Pushed latest status to uptime service.');
    }, 1000 * 10); // Every 10 seconds
    app.post('/email', async (req: Request, res: Response) => {
        const token = (req.headers.authorization ?? req.query.token) as string;
        if (!authorised(token)) return unAuthorised(res);

        try {
            // Get its data first item in the array and its subject
            const data = req.body.data[0];
            const subject = data.subject;
            const selectedSubjectKey = Object.keys(emailSubjects).find((key) => key.includes(subject) || subject.includes(key)) ?? null;
            if (!selectedSubjectKey) {
                console.error('No subject found for email:', subject);
                res.status(400).send('No subject found for email.');
                return;
            }
            const selectedSubject = emailSubjects[selectedSubjectKey] ?? [null, null];
            const id = selectedSubject[1];
            const status = selectedSubject[0]; // true for resolved, false for triggered

            if (id && status !== null && typeof id === 'string' && typeof status === 'boolean') {
                uptimeStatuses[id] = status;
            }

            // Stringify the body
            const body = JSON.stringify(req.body, null, 2);
            console.log(`Received email: ${body}`);
            res.status(201).send('Email received.');
        } catch (error) {
            console.error('Error sending DM:', error);
            res.status(500).send('An error occurred while sending the DM.');
        }
    });
}