import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';

class SubscriptionMail {
  get key() {
    return 'SubscriptionMail';
  }

  async handle({ data }) {
    const { user, meetup } = data;
    await Mail.sendMail({
      to: `${user.name} <${user.email}>`,
      subject: 'Nova inscrição',
      template: 'subscription',
      context: {
        banner: meetup.banner.url,
        meetup: meetup.title,
        user: user.name,
        date: format(parseISO(meetup.date), "dd 'de' MMMM', às' H:mm'h'", {
          locale: pt,
        }),
      },
    });
  }
}

export default new SubscriptionMail();
