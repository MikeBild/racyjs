import morgan from 'morgan';
import cors from 'cors';
import compression from 'compression';
import examples from './examples';

export default ({ config, app }) => {
  app.use(morgan('combined'));
  app.use(cors());
  app.use(compression());

  app.use('/api/examples', examples);
};
