import * as format from 'string-template';
import { sign } from 'jsonwebtoken';
import { URL } from 'url';
import { SesEmail } from './SesEmail';
import { EmailAddress, EmailContent, Token } from './types';

export class DoubleOptInEmail
{
    private from: EmailAddress = { name: '', address: '' };
    private to: EmailAddress = { name: '', address: '' };

    private subject: string = 'Verify your npm email address';

    private body: EmailContent = {
        html: '', text: 'Hi ${name}!\n' +
            '\n' +
            'Welcome to our service! To verify your email so that you can publish packages, click the following link:\n' +
            '\n' +
            '${validationURL}\n' +
            '\n' +
            'Thanks for joining.\n' +
            '\n' +
            'Kind regards!'
    };

    constructor( private privateKey: string, private validationURL: URL )
    {
    }

    public setTo( address: string, name: string ): void
    {
        if ( name ) {
            this.to.name = name;
            this.to.address = address;
        } else {
            this.to.address = name;
        }
    }

    public setFrom( address: string, name: string ): void
    {
        if ( name ) {
            this.from.name = name;
            this.from.address = address;
        } else {
            this.from.address = name;
        }
    }

    public setSubject( subject: string ): void
    {
        this.subject = subject;
    }

    public setBodyTemplate( html: string, text: string ): void
    {
        if ( text ) {
            this.body.text = text;
            this.body.html = html;
        } else {
            this.body.html = html;
        }
    }

    private generateToken(): Token
    {
        const token: Token = sign( {
            from: this.getAddress( this.from ),
            to:   this.getAddress( this.to )
        }, this.privateKey );

        return token;
    }

    private getAddress( email: EmailAddress ): string
    {
        let address: string = email.address;

        if ( email.name != '' ) {
            address = `${email.name} <${email.address}>`;
        }

        return address;
    }

    send(): Promise<any>
    {
        const promise = new Promise( ( resolve, reject ) => {
            const sesMail = new SesEmail( this.getAddress( this.from ), this.getAddress( this.to ) );
            const token = this.generateToken();

            sesMail.setSubject( this.subject );

            if ( this.body.html != '' ) {
                sesMail.setHtml( format( this.body.html, {
                    name:          this.to.name,
                    email:         this.to.address,
                    validationURL: `${this.validationURL}?token=${encodeURI( token )}`,
                } ) );
            }

            sesMail.setText( format( this.body.text, {
                name:          this.to.name,
                email:         this.to.address,
                validationURL: `${this.validationURL}?token=${encodeURI( token )}`,
            } ) );

            sesMail.send().then( ( response ) => {
                resolve( {
                    token:     token,
                    messageId: response.MessageId
                } );
            } ).catch( error => {
                reject( error );
            } );
        } );

        return promise;
    }

}
