import 'dotenv/config';
import Queue from './lib/Queue';

const queue = new Queue();

queue.process();
