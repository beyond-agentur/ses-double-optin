import { URL } from "url";

export interface InterfaceDoubleOptInMessage {
    templateHtml: string;
    templateText: string;

    type: string;
    email: string;

    hostname: string,
    validationURL: URL;
}
