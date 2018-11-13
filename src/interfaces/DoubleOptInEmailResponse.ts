import { MessageId } from 'aws-sdk/clients/ses';
import { Token } from '../types';

export interface DoubleOptInEmailResponse {
    /**
     * DoubleOptIn Token
     */
    token: Token;

    /**
     * The unique message identifier returned from the SendEmail action.
     */
    messageId: MessageId;
}
