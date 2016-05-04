/**
 * Created by sibelius on 05/04/16.
 */
import { graphql } from 'graphql';
import { renderGraphiQL } from '../../graphql/util';
import { schema, graphiql } from '../../graphql';

function accepts(ctx, type) {
  return ctx.headers && ctx.headers.accept && ctx.headers.accept.includes(type);
}

export default (router) => {
  router
    .get('/graphql',
      function *() {
        const body = this.request.body;
        const { query, variables } = Object.assign({}, body, this.query);

        if (accepts(this, 'html') && graphiql) {
          this.body = renderGraphiQL({ query, variables });
        } else if (query && query.includes('mutation')) {
          this.status = 406;
          this.body = 'GraphQL mutation only allowed in POST request.';
        }
      }
    )
    .post('/graphql',
      function *() {
        const body = this.request.body;
        const { query, variables } = Object.assign({}, body, this.query);

        this.body = yield graphql(schema, query, this, variables);
      }
    );
};