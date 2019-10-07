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
    const view_path = resolve(__dirname, '..', 'app', 'views', 'emails');
    this.transporter.use(
      'compile',
      nodemailerhbs({
        extName: '.hbs',
        viewEngine: exphbs.create({
          defaultLayout: 'default',
          extname: '.hbs',
          layoutsDir: resolve(view_path, 'layouts'),
          partialsDir: resolve(view_path, 'partials'),
        }),
        viewPath: view_path,
      })
    );
  }

  sendMail(message) {
    return this.transporter.sendMail({ ...mail.default, ...message });
  }
}

export default new Mail();
