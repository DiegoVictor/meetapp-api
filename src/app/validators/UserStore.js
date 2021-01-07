import { celebrate, Segments, Joi } from 'celebrate';

export default celebrate({
  [Segments.BODY]: {
    email: Joi.string()
      .email()
      .required(),
    name: Joi.string().required(),
    password: Joi.string()
      .required()
      .min(6),
  },
});
