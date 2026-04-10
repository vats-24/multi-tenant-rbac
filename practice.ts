/* What we leaerned in the tutorial*/ 
import fastify from "fastify";

//the below two segment of code we had to write is because of typescript
type conf = {
  db: string;
};

declare module "fastify" {
  interface FastifyInstance {
    conf: conf;
  }
}

const app = fastify({
  logger: true,
});
 
app.decorate("conf", {
  db: "something",
  port: 3000,
});
/* now we can access the decorated property by the name provided
earlier it was showing red mark while accesing conf typescript was throwing an error
so we declared its type in fastify instance
*/
console.log(app.conf.db);

// why cant be used simutaneously???
/*above we attached it to fastify instance now if we want to attach it to fastifyrequest
Decorate request with a 'user' property
app.decorateReqest('user', '')

Update our property
fastify.addHook('preHandler', (req, reply, done) => {
  req.user = 'Bob Dylan'
  done()
})
And finally access it
fastify.get('/', (req, reply) => {
  reply.send(`Hello, ${req.user}!`)
})*/


/*PLUGINS
//app.register(plugin, [options])

fastify.register(require('my-plugin'))

// `after` will be executed once
// the previous declared `register` has finished
fastify.after(err => console.log(err))

// `ready` will be executed once all the registers declared
// have finished their execution
fastify.ready(err => console.log(err))

// `listen` is a special ready,
// so it behaves in the same way
fastify.listen({ port: 3000 }, (err, address) => {
  if (err) console.log(err)
})

*/


/*Hooks to be read and Server instance to be checked*/