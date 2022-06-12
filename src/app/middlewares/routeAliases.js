export default (req, _, next) => {
  const { originalUrl } = req;
  const hostUrl = `${process.env.APP_URL}:${process.env.APP_PORT}`;

  req.hostUrl = hostUrl;
  req.currentUrl = `${hostUrl + originalUrl.split('?').shift()}`;

  next();
};
