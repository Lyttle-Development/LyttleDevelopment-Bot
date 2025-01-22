import type {Response} from 'express';

export function authorised(token: string) {
    if (token !== "Bearer " + process.env.AUTHORIZATION_TOKEN) {
        console.error('Unauthorised request.');
        return false;
    }

    return true;
}

export function unAuthorised(res: Response) {
    res.status(401).send('Unauthorised request.');
}