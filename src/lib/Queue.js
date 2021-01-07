import Bee from 'bee-queue';

import SubscriptionMail from '../app/jobs/SubscriptionMail';
import redis from '../config/redis';

const jobs = [SubscriptionMail];

class Queue {
  constructor() {
    this.queues = {};
    this.init();
  }

  init() {
    jobs.forEach(({ key, handle }) => {
      switch (process.env.NODE_ENV) {
        case 'test':
          break;

        default:
          this.queues[key] = {
            bee: new Bee(key, {
              redis,
            }),
            handle,
          };
          break;
      }
    });
  }

  add(queue, job) {
    switch (process.env.NODE_ENV) {
      case 'test':
        return true;

      default:
        return this.queues[queue].bee.createJob(job).save();
    }
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

export default new Queue();
