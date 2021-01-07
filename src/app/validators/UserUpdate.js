import { celebrate, Segments, Joi } from 'celebrate';

export default celebrate({
  [Segments.BODY]: {
    confirm_password: Joi.when('password', {
      is: Joi.exist(),
      then: Joi.string()
        .valid(Joi.ref('password'))
        .required(),
      otherwise: Joi.forbidden(),
    }),
    email: Joi.string().email(),
    name: Joi.string(),
    old_password: Joi.string().min(6),
    password: Joi.string()
      .min(6)
      .when('old_password', {
        is: Joi.exist(),
        then: Joi.string().required(),
        otherwise: Joi.forbidden(),
      }),
  },
});
