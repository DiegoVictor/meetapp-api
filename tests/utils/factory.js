import { factory } from 'factory-girl';
import { faker } from '@faker-js/faker';

import File from '../../src/app/models/File';
import Meetup from '../../src/app/models/Meetup';
import User from '../../src/app/models/User';
import Subscription from '../../src/app/models/Subscription';

factory.define('File', File, {
  name: faker.image.image,
  path: faker.datatype.uuid,
});

factory.define('Meetup', Meetup, {
  banner_id: null,
  date: faker.date.future,
  description: () => faker.lorem.paragraphs(1).slice(0, 254),
  localization: faker.address.streetAddress,
  title: faker.lorem.words,
});

factory.define('Subscription', Subscription, {
  meetup_id: null,
  user_id: null,
});

factory.define('User', User, {
  email: faker.internet.email,
  name: faker.name.findName,
  password: faker.internet.password,
});

export default factory;
