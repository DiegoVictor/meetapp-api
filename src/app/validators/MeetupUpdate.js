import { celebrate, Segments, Joi } from 'celebrate';

export default celebrate({
  [Segments.BODY]: {
    banner_id: Joi.number(),
    date: Joi.date(),
    description: Joi.string().min(10),
    localization: Joi.string(),
    title: Joi.string().min(6),
  },
});
