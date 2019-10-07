export default {
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  default: {
    from: 'MeetApp <noreply@meetapp.com>',
  },
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: false,
};
