import { Config } from "aws-sdk";
import { SES } from "aws-sdk/clients/all";
import { SendEmailRequest } from "aws-sdk/clients/ses";
import { AWSError } from "aws-sdk/lib/error";
import { PromiseResult } from "aws-sdk/lib/request";

export class SesEmail {
    private params: SendEmailRequest = {
        Destination: {
            ToAddresses: [],
        },

        Message: {
            Subject: {
                Charset: "UTF-8",
                Data:    "",
            },

            Body: {},
        },

        Source: "",
    };

    constructor( private config: Config, private from: string, private to: string ) {
        this.params.Source = from;

        if ( to !== "" && this.params.Destination.ToAddresses ) {
            this.params.Destination.ToAddresses.push( to );
        }
    }

    public setSubject( subject: string ): void {
        this.params.Message.Subject.Data = subject;
    }

    public setHtml( content: string, charset: string = "UTF-8" ): void {
        this.params.Message.Body.Html = {
            Charset: charset,
            Data:    content,
        };
    }

    public setText( content: string, charset: string = "UTF-8" ): void {
        this.params.Message.Body.Text = {
            Charset: charset,
            Data:    content,
        };
    }

    public send(): Promise<PromiseResult<SES.SendEmailResponse, AWSError>> {
        return new SES( this.config ).sendEmail( this.params ).promise();
    }
}
