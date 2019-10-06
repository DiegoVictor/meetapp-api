import * as Yup from 'yup';

export default async (req, res, next) => {
  try {
    const schema = Yup.object().shape({
      title: Yup.string().min(6),
      description: Yup.string().min(10),
      localization: Yup.string(),
      date: Yup.date(),
      banner_id: Yup.number(),
    });

    await schema.validate(req.body, { abortEarly: false });

    return next();
  } catch (err) {
    return res.status(400).json({
      error: 'Validation fails',
      messages: err.inner,
    });
  }
};
