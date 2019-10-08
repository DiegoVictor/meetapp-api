import * as Yup from 'yup';
import { badRequest } from '@hapi/boom';

export default async (req, res, next) => {
  try {
    const schema = Yup.object().shape({
      confirm_password: Yup.string().when('password', (password, field) =>
        password ? field.required().oneOf([Yup.ref('password')]) : field
      ),
      email: Yup.string().email(),
      name: Yup.string(),
      old_password: Yup.string().min(6),
      password: Yup.string()
        .min(6)
        .when('old_password', (old_password, field) =>
          old_password ? field.required() : field
        ),
    });

    await schema.validate(req.body, { abortEarly: false });

    return next();
  } catch (err) {
    throw badRequest('Validation fails', err.inner);
  }
};
