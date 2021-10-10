import { celebrate, Segments, Joi } from 'celebrate';

export default celebrate({
  [Segments.BODY]: {
    meetup_id: Joi.number().required(),
  },
});
