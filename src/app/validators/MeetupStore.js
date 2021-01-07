import { celebrate, Segments, Joi } from 'celebrate';

export default celebrate({
  [Segments.BODY]: {
    banner_id: Joi.number().required(),
    date: Joi.date().required(),
    description: Joi.string()
      .min(10)
      .required(),
    localization: Joi.string().required(),
    title: Joi.string()
      .min(6)
      .required(),
  },
});
