import * as Yup from 'yup';
import { badRequest } from '@hapi/boom';

export default async (req, res, next) => {
  try {
    const schema = Yup.object().shape({
      banner_id: Yup.number().required(),
      date: Yup.date().required(),
      description: Yup.string()
        .min(10)
        .required(),
      localization: Yup.string().required(),
      title: Yup.string()
        .min(6)
        .required(),
    });

    await schema.validate(req.body, { abortEarly: false });

    return next();
  } catch (err) {
    throw badRequest('Validation fails', err.inner);
  }
};
