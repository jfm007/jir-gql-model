/**
 * Created by jfm on 2/02/2016.
 */
import express from 'express';
import graphqlHttp from 'express-graphql';
const graphQLServer = express();
import { StarWarsSchema, characterInterface } from './starWarsSchema.js'
import { stwSchema, gCharacter, gHuman } from './gqlStwSchema';

//console.log(gHuman._typeConfig.fields());
graphQLServer.use('/graphql', graphqlHttp({schema:stwSchema, graphiql:true}));
graphQLServer.listen(8080);
console.log('The GraphQL Server is running');
