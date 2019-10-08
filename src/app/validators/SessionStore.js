import * as Yup from 'yup';
import { badRequest } from '@hapi/boom';

export default async (req, res, next) => {
  try {
    const schema = Yup.object().shape({
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string().required(),
    });

    await schema.validate(req.body, { abortEarly: false });

    return next();
  } catch (err) {
    throw badRequest('Validation fails', err.inner);
  }
};
