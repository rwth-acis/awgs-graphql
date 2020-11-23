import dotenv from 'dotenv'
import express from 'express';
//import session from 'express-session';
import {ApolloServer, gql, AuthenticationError, AuthorizationError} from 'apollo-server-express';
import Sequelize from 'sequelize';
import User from './models/User.js';
import ItemType from './models/ItemType.js';
import Item from './models/Item.js';
import fs from 'fs';
import {Issuer} from 'openid-client';
//import {auth} from 'express-openid-connect';

dotenv.config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
  define: {
    timestamps: false
  }
});

// Construct a schema, using GraphQL schema language
const typeDefs = gql`${fs.readFileSync(__dirname.concat('/schema.graphql'), 'utf8')}`;

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    itemtypes: (parent, args, context) => {
      return ItemType.findAll();
    },
    items: (parent, args, context) => {
      return Item.findAll({include: [
          {model: ItemType}
        ],
        order: [["lastupdate", "DESC"]]}).then(items => {console.log(items); return items; });
    }
  },
  Mutation: {
    createItem: (parent, {name, description, typeString, url}, context) => {
      return Item.findOne({order: [['ID', 'DESC']]}).then(latestItem => {
        const lastIdSplit = latestItem.id.split('-');
        const currentYear = (new Date()).getFullYear();
        let newId = 'AWGS-' + currentYear + '-';
        if (lastIdSplit[1] == currentYear) {
          newId += (parseInt(lastIdSplit[2]) + 1).toString().padStart(3, '0');
        } else {
          // happy new year!
          newId += '001';
        }

        return ItemType.findOne({where: {name: typeString}}).then(itemtype => {
          const type = itemtype.id;

          return Item.build({
            id: newId,
            name: name,
            description: description,
            type: type,
            url: url,
            owner: context.user.name
          }).save().then(item => {
            item.lastupdate = Date.now();
            return item;
          });

        });

      });
    },
    updateItem: (parent, {id, name, description, typeString, url}, context) => {
      return Item.findOne({where: {id: id}}).then(latestItem => {
        
        return ItemType.findOne({where: {name: typeString}}).then(itemtype => {
          const type = itemtype.id;
          latestItem.id = id;
          latestItem.name = name;
          latestItem.description = description;
          latestItem.type = type;
          latestItem.url = url;

          return latestItem.save().then(item => {
            item.lastupdate = Date.now();
            return item;
          });

        });

      });
    }
  },
  Item: {
    type: (parent, args, context, info) => parent.getItemType(),
  },
  ItemType: {
    items: (parent, args, context, info) => parent.getItems(),
  }
};

let client;

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({req}) => {
    // get the user token from the headers
    let token = req.headers.authorization || '';
    if (token.startsWith('Bearer ')) {
      token = token.split(' ')[1];
    }
   
    // try to retrieve a user with the token
    return client.userinfo(token).then(userinfo => {
      return User.findOne({ where: {sub: userinfo.sub} }).then(user => {
        if (user == null) {
          throw new AuthenticationError('You must be logged in.')
        }
        user.updateAttributes({lastlogin: sequelize.fn('NOW')});
        if (!user.authorization) {
          throw new AuthorizationError('You are not authorized to view this resource.'); 
        }
        // add the user to the context
        return {user};
      });
    });
  },
 });

const app = express();
server.applyMiddleware({app});

const port = process.env.SERVER_PORT;

// resolve both OIDC and sequelize promises
Promise.all([Issuer.discover('https://api.learning-layers.eu/o/oauth2'), sequelize.authenticate()]).then(([layersIssuer]) => {
    client = new layersIssuer.Client({
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET
    });
    
    User.init(sequelize, Sequelize);
    ItemType.init(sequelize, Sequelize);
    Item.init(sequelize, Sequelize);
    ItemType.associate();
    Item.associate();
    
    app.listen({port}, () =>
      console.log(`🚀 Server ready at http://localhost:${port}${server.graphqlPath}`),
    );
  }).catch(err => {
    console.error('Unable to connect to the database:', err);
    throw err;
  });
