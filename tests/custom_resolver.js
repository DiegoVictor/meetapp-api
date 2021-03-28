module.exports = (request, options) => {
  let mocked;

  ['^nodemailer$'].every(module => {
    if (request.search(new RegExp(module, 'gi')) > -1) {
      mocked = module.replace(/(\^|\$)/gi, '');
      console.log('mock', mocked);
      return false;
    }
    return true;
  });

  if (mocked) {
    return `${options.rootDir}/mocks/${mocked}.js`;
  }

  return options.defaultResolver(request, options);
};
