export default (req, _, next) => {
  const { protocol, hostname, originalUrl } = req;
  const hostUrl = `${protocol}://${hostname}:${process.env.APP_PORT}`;

  req.hostUrl = hostUrl;
  req.currentUrl = `${hostUrl + originalUrl.split('?').shift()}`;

  next();
};
