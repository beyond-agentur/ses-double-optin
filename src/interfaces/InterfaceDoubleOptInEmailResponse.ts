import { MessageId } from "aws-sdk/clients/ses";
import { Token } from "../types";

export interface InterfaceDoubleOptInEmailResponse {
    /**
     * The unique message identifier returned from the SendEmail action.
     */
    messageId: MessageId;

    /**
     * DoubleOptIn Token
     */
    token: Token;
}
