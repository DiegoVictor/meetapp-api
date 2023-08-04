import { faker } from '@faker-js/faker';
import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';

import factory from '../utils/factory';
import SubscriptionMail from '../../src/app/jobs/SubscriptionMail';
import { sendMail } from '../../mocks/nodemailer';

describe('SubscriptionMail', () => {
  it('should be able to send the email', async () => {
    const { email, name } = await factory.attrs('User');
    const meetup = {
      banner: {
        url: faker.image.url(),
      },
      date: faker.date.future().toISOString(),
      title: faker.lorem.words(),
    };

    const subscriptionMail = new SubscriptionMail();
    await subscriptionMail.handle({
      data: {
        meetup,
        user: {
          email,
          name,
        },
      },
    });

    expect(sendMail).toHaveBeenCalledWith({
      from: 'MeetApp <noreply@meetapp.com>',
      to: `${name} <${email}>`,
      subject: 'Nova inscrição',
      template: 'subscription',
      context: {
        banner: meetup.banner.url,
        date: format(parseISO(meetup.date), "dd 'de' MMMM', às' H:mm'h'", {
          locale: pt,
        }),
        meetup: meetup.title,
        user: name,
      },
    });
  });
});
