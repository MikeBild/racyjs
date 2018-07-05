import express from 'express';
const app = express.Router();

export default app;

app.get('/', (req, res, next) => {
  res.send({ message: 'Hello Racy!' });
});
