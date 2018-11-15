import { Config } from "aws-sdk";
import { Secret, sign, verify } from "jsonwebtoken";
import format = require("string-template");
import { URL } from "url";
import { InterfaceEmailAddress } from "./interfaces/InterfaceEmailAddress";
import { InterfaceEmailContent } from "./interfaces/InterfaceEmailContent";
import { SesEmail } from "./SesEmail";
import { Token } from "./types";

export class DoubleOptInEmail {
    private from: InterfaceEmailAddress = { name: "", address: "" };
    private to: InterfaceEmailAddress = { name: "", address: "" };

    private subject: string = "Verify your email address";

    private body: InterfaceEmailContent = {
        html: "",
        text: "Hi {name}!\n" +
                  "\n" +
                  "Welcome to our service! To verify your email so that you can publish packages," +
                  "click the following link:\n" +
                  "\n" +
                  "{validationURL}\n" +
                  "\n" +
                  "Thanks for joining.\n" +
                  "\n" +
                  "Kind regards!",
    };

    constructor( private config: Config, private privateKey: Secret, private publicKey: string | Buffer, private validationURL: URL ) {
    }

    public setTo( address: string, name: string ): void {
        if ( name ) {
            this.to.name = name;
            this.to.address = address;
        } else {
            this.to.address = name;
        }
    }

    public setFrom( address: string, name: string ): void {
        if ( name ) {
            this.from.name = name;
            this.from.address = address;
        } else {
            this.from.address = name;
        }
    }

    public setSubject( subject: string ): void {
        this.subject = subject;
    }

    public setBodyTemplate( html: string, text: string ): void {
        if ( text ) {
            this.body.text = text;
            this.body.html = html;
        } else {
            this.body.html = html;
        }
    }

    public send(): Promise<any> {
        const promise = new Promise( ( resolve, reject ) => {
            const sesMail = new SesEmail( this.config, this.getAddress( this.from ), this.getAddress( this.to ) );
            const token = this.generateToken();

            sesMail.setSubject( this.subject );

            if ( this.body.html !== "" ) {
                sesMail.setHtml( format( this.body.html, {
                    email:         this.to.address,
                    name:          this.to.name,
                    validationURL: `${this.validationURL}?token=${encodeURI( token )}`,
                } ) );
            }

            sesMail.setText( format( this.body.text, {
                email:         this.to.address,
                name:          this.to.name,
                validationURL: `${this.validationURL}?token=${encodeURI( token )}`,
            } ) );

            sesMail.send().then( ( response ) => {
                resolve( {
                    messageId: response.MessageId,
                    token,
                } );
            } ).catch( ( error ) => {
                reject( error );
            } );
        } );

        return promise;
    }

    public validateToken( token: Token ): boolean {
        try {
            verify( token, this.publicKey );
            return true;
        } catch ( e ) {
            throw e;
        }
    }

    private generateToken(): Token {
        const token: Token = sign( {
            from: this.getAddress( this.from ),
            to:   this.getAddress( this.to ),
        }, this.privateKey );

        return token;
    }

    private getAddress( email: InterfaceEmailAddress ): string {
        let address: string = email.address;

        if ( email.name !== "" ) {
            address = `${email.name} <${email.address}>`;
        }

        return address;
    }
}
