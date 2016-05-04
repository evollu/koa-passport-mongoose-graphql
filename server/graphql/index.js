import { getSchema } from '@risingstack/graffiti-mongoose';
import graffiti from '@risingstack/graffiti';
import Models from '../models';
import compose from 'koa-compose';

export const schema = getSchema(Models);
export const graphiql = true;

export default function graphql() {
  console.log('graphql init');

  return compose([
      graffiti.koa({
        schema,
        graphiql,
      }),
    ]);
}