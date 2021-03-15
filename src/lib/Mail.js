import { resolve } from 'path';
import exphbs from 'express-handlebars';
import Nodemailer from 'nodemailer';
import nodemailerhbs from 'nodemailer-express-handlebars';

import mail from '../config/mail';

class Mail {
  constructor() {
    const { auth, host, port, secure } = mail;
    this.transporter = Nodemailer.createTransport({ auth, host, port, secure });
    this.templates();
  }

  templates() {
    const viewPath = resolve(__dirname, '..', 'app', 'views', 'emails');

    this.transporter.use(
      'compile',
      nodemailerhbs({
        extName: '.hbs',
        viewEngine: exphbs.create({
          defaultLayout: 'default',
          extname: '.hbs',
          layoutsDir: resolve(viewPath, 'layouts'),
          partialsDir: resolve(viewPath, 'partials'),
        }),
        viewPath,
      })
    );
  }

  sendMail(message) {
    return this.transporter.sendMail({ ...mail.recipient, ...message });
  }
}

export default Mail;
