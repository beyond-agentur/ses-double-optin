import { URL } from 'url';

export interface DoubleOptInMessage
{
    templateHtml: string;
    templateText: string;

    type: string;
    email: string;

    hostname: string,
    validationURL: URL;
}
