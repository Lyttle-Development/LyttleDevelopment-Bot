import {dmEndpoint} from './dm.endpoint';
import {emailEndpoint} from './email.endpoint';

export function initEndpoints() {
    dmEndpoint()
    emailEndpoint()
}