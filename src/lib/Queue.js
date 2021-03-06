import Bee from 'bee-queue';
// eslint-disable-next-line import/no-extraneous-dependencies
import { createClient } from 'redis-mock';

import SubscriptionMail from '../app/jobs/SubscriptionMail';

const jobs = [new SubscriptionMail()];

class Queue {
  constructor() {
    this.queues = {};
    this.init();
  }

  init() {
    jobs.forEach(({ key, handle }) => {
      this.queues[key] = {
        bee: new Bee(key, {
          redis:
            process.env.NODE_ENV === 'test'
              ? createClient()
              : {
                  host: process.env.REDIS_HOST,
                  port: process.env.REDIS_PORT,
                },
        }),
        handle,
      };
    });
  }

  add(queue, job) {
    this.queues[queue].bee.createJob(job).save();
  }

  process() {
    jobs.forEach(job => {
      const { bee, handle } = this.queues[job.key];
      bee.on('failed', this.handleFailure).process(handle);
    });
  }

  handleFailure(job, err) {
    console.log(`Queue ${job.queue.name}: FAILED`, err);
  }
}

export default Queue;
