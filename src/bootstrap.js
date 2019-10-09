const dotenv = require('dotenv');

dotenv.config({
  path: (env => {
    switch (env) {
      case 'test':
        return '.env.test';

      case 'production':
      case 'development':
      default:
        return '.env';
    }
  })(process.env.NODE_ENV),
});
