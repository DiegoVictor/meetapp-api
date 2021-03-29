export const use = jest.fn();

export const sendMail = jest.fn(() => {
  return true;
});

export default {
  createTransport: () => ({
    use,
    sendMail,
  }),
};
