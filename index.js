import koa from 'koa'; // koa@2
import koaRouter from 'koa-router'; // koa-router@next
import koaBody from 'koa-bodyparser'; // koa-bodyparser@next
import cors from '@koa/cors';
import { graphqlKoa, graphiqlKoa } from 'apollo-server-koa';
import { makeExecutableSchema } from 'graphql-tools';
import Sequelize from 'sequelize';

const sequelize = new Sequelize('schanzentisch', 'schanze', 'tisch', {
  host: 'localhost',
  dialect: 'sqlite',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  storage: './database.sqlite',
  operatorsAliases: false,
});

const Places = sequelize.define('places', {
  picture: Sequelize.STRING,
  name: Sequelize.STRING,
  priceRange: Sequelize.STRING,
  rating: Sequelize.TINYINT,
});

sequelize
  .sync()
  .then(() =>
    Places.findOrCreate({
      where: {
        name: 'Asia uniqe',
      },
      defaults: {
        picture:
          'https://media-cdn.tripadvisor.com/media/photo-s/11/cb/0f/f5/karte.jpg',
        priceRange: 'very cheap',
        rating: 3,
        name: 'Asia uniqe',
      },
    }))
  .then(() =>
    Places.findOrCreate({
      where: {
        name: 'Pamukale',
      },
      defaults: {
        picture:
          'http://www.hamburg-schmackhaft.de/wp-content/uploads/2016/12/basel-and-mars-restaurant-mittagstisch-test-03.jpg',
        name: 'Pamukale',
        priceRange: 'cheap',
        rating: 2,
      },
    }))
  .then(() =>
    Places.findOrCreate({
      where: {
        name: 'Balero',
      },
      defaults: {
        picture: 'http://www.el-serratto.de/speisekarte/mittagstisch.jpg',
        name: 'Balero',
        priceRange: 'pricy',
        rating: 2,
      },
    }))
  .then(() =>
    Places.findOrCreate({
      where: {
        name: 'erikas eck',
      },
      defaults: {
        picture:
          'https://media-cdn.tripadvisor.com/media/photo-s/0d/77/c5/1f/speisekarte-an-der-tafel.jpg',
        name: 'erikas eck',
        priceRange: 'why so expensive?',
        rating: 1,
      },
    }));

const app = new koa();
const router = new koaRouter();
const PORT = 3000;

const typeDefs = `
    type Query { allPlaces: [Places] }
    type Places { name: String, picture: String, priceRange: String, rating: Int }
`;

const resolvers = {
  Query: {
    allPlaces: () => Places.findAll(),
  },
};

const myGraphQLSchema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

// koaBody is needed just for POST.
router.post('/graphql', koaBody(), graphqlKoa({ schema: myGraphQLSchema }));
router.get('/graphql', graphqlKoa({ schema: myGraphQLSchema }));
router.get('/graphiql', graphiqlKoa({ endpointURL: '/graphql' }));

app.use(cors());
app.use(router.routes());
app.use(router.allowedMethods());
app.listen(PORT);
