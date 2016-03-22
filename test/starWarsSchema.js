/**
 *  Copyright (c) 2015, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */
import {
  GraphQLEnumType,
  GraphQLInterfaceType,
  GraphQLObjectType,
  GraphQLUnionType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLSchema,
  GraphQLString,
  GraphQLID
} from 'graphql';

import {
  connectionArgs,
  connectionDefinitions,
  connectionFromArray,
  fromGlobalId,
  globalIdField,
  mutationWithClientMutationId,
  nodeDefinitions,
} from 'graphql-relay';

import { getFriends, getHero, getHuman, getDroid } from './starWarsData.js';

let {nodeInterface, nodeField} = nodeDefinitions(
  (globalId)=>{
    let {type, id} = fromGlobalId(globalId);
    if(type === 'Human'){
      return getHuman(id);
    }
    else if(type === 'Droid'){
      return getDroid(id);
    }
  },
  (obj)=>{
    let id = obj.id;
    if(getHuman(id)) return humanType;
    if(getDroid(id)) return droidType;
    return null;
  }
);
/**
 * This is designed to be an end-to-end test, demonstrating
 * the full GraphQL stack.
 *
 * We will create a GraphQL schema that describes the major
 * characters in the original Star Wars trilogy.
 *
 * NOTE: This may contain spoilers for the original Star
 * Wars trilogy.
 */

/**
 * Using our shorthand to describe type systems, the type system for our
 * Star Wars example is:
 *
 * enum Episode { NEWHOPE, EMPIRE, JEDI }
 *
 * interface Character {
 *   id: String!
 *   name: String
 *   friends: [Character]
 *   appearsIn: [Episode]
 * }
 *
 * type Human : Character {
 *   id: String!
 *   name: String
 *   friends: [Character]
 *   appearsIn: [Episode]
 *   homePlanet: String
 * }
 *
 * type Droid : Character {
 *   id: String!
 *   name: String
 *   friends: [Character]
 *   appearsIn: [Episode]
 *   primaryFunction: String
 * }
 *
 * type Query {
 *   hero(episode: Episode): Character
 *   human(id: String!): Human
 *   droid(id: String!): Droid
 * }
 *
 * We begin by setting up our schema.
 */

/**
 * The original trilogy consists of three movies.
 *
 * This implements the following type system shorthand:
 *   enum Episode { NEWHOPE, EMPIRE, JEDI }
 */
const episodeEnum = new GraphQLEnumType({
  name: 'Episode',
  description: 'One of the films in the Star Wars Trilogy',
  values: {
    NEWHOPE: {
      value: 4,
      description: 'Released in 1977.',
    },
    EMPIRE: {
      value: 5,
      description: 'Released in 1980.',
    },
    JEDI: {
      value: 6,
      description: 'Released in 1983.',
    },
  }
});

/**
 * Characters in the Star Wars trilogy are either humans or droids.
 *
 * This implements the following type system shorthand:
 *   interface Character {
 *     id: String!
 *     name: String
 *     friends: [Character]
 *     appearsIn: [Episode]
 *   }
 */
export const characterInterface = new GraphQLInterfaceType({
  name: 'Character',
  description: 'A character in the Star Wars Trilogy',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the character.',
    },
    name: {
      type: GraphQLString,
      description: 'The name of the character.',
    },
    friends: {
      type:friendConnecion,
      args: connectionArgs,
      //type: new GraphQLList(characterInterface),
      description: 'The friends of the character, or an empty list if they ' +
                   'have none.',
    },
    appearsIn: {
      type: new GraphQLList(episodeEnum),
      description: 'Which movies they appear in.',
    },
  }),
  resolveType: character => {
    return getHuman(character.id) ? humanType : droidType;
  }
});
let {connectionType:friendConnecion} = connectionDefinitions({name: 'Friend', nodeType: characterInterface});
/**
 * We define our human type, which implements the character interface.
 *
 * This implements the following type system shorthand:
 *   type Human : Character {
 *     id: String!
 *     name: String
 *     friends: [Character]
 *     appearsIn: [Episode]
 *   }
 */
export const humanType = new GraphQLObjectType({
  name: 'Human',
  description: 'A humanoid creature in the Star Wars universe.',
  fields: () => ({
    id:globalIdField('Human'),
    //id: {
    //  type: new GraphQLNonNull(GraphQLString),
    //  description: 'The id of the human.',
    //},
    name: {
      type: GraphQLString,
      description: 'The name of the human.',
    },
    friends: {
      type:friendConnecion,
      //type: new GraphQLList(characterInterface),
      args: connectionArgs,
      description: 'The friends of the human, or an empty list if they ' +
                   'have none.',
      resolve: (human, args) => connectionFromArray(getFriends(human), args),
    },
    appearsIn: {
      type: new GraphQLList(episodeEnum),
      description: 'Which movies they appear in.',
    },
    homePlanet: {
      type: GraphQLString,
      description: 'The home planet of the human, or null if unknown.',
    },
  }),
  interfaces: [ characterInterface,nodeInterface]
});

/**
 * The other type of character in Star Wars is a droid.
 *
 * This implements the following type system shorthand:
 *   type Droid : Character {
 *     id: String!
 *     name: String
 *     friends: [Character]
 *     appearsIn: [Episode]
 *     primaryFunction: String
 *   }
 */
const droidType = new GraphQLObjectType({
  name: 'Droid',
  description: 'A mechanical creature in the Star Wars universe.',
  fields: () => ({
    id: globalIdField('Droid'),
    //id: {
    //  type: new GraphQLNonNull(GraphQLString),
    //  description: 'The id of the droid.',
    //},
    name: {
      type: GraphQLString,
      description: 'The name of the droid.',
    },
    friends: {
      //type:  new GraphQLList(characterInterface),
      type: friendConnecion,
      args: connectionArgs,
      description: 'The friends of the droid, or an empty list if they ' +
                   'have none.',
      resolve: (droid, args) => connectionFromArray(getFriends(droid), args),
    },
    appearsIn: {
      type: new GraphQLList(episodeEnum),
      description: 'Which movies they appear in.',
    },
    primaryFunction: {
      type: GraphQLString,
      description: 'The primary function of the droid.',
    },
    homePlanet: {
      type: GraphQLString,
      description: 'The home planet of the human, or null if unknown.',
    },
  }),
  interfaces: [ characterInterface,nodeInterface]
});

const SWCharacterType = new GraphQLUnionType({
  name:'SWCharacter',
  types:[humanType, droidType],
  resolveType(swCharacter){
    if(swCharacter.homePlanet){
      return humanType;
    }
    if(swCharacter.primaryFunction){
      return droidType;
    }
  }
});
/**
 * This is the type that will be the root of our query, and the
 * entry point into our schema. It gives us the ability to fetch
 * objects by their IDs, as well as to fetch the undisputed hero
 * of the Star Wars trilogy, R2-D2, directly.
 *
 * This implements the following type system shorthand:
 *   type Query {
 *     hero(episode: Episode): Character
 *     human(id: String!): Human
 *     droid(id: String!): Droid
 *   }
 *
 */
const queryType = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    hero: {
      type: characterInterface,
      args: {
        episode: {
          description: 'If omitted, returns the hero of the whole saga. If ' +
                       'provided, returns the hero of that particular episode.',
          type: episodeEnum
        }
      },
      resolve: (root, { episode }) => getHero(episode)
    },
    node:nodeField,
    humans:{
      type:new GraphQLList(humanType),
      resolve:()=>getHuman()
    },
    droids:{
      type:new GraphQLList(droidType),
      args:{
        ids:{
          type:new GraphQLList(GraphQLString),
          description:'something'
        }
      },
      resolve:(root, {ids})=>
      {
        if (ids) {
          let droidIds = null;
          if(typeof ids === 'string')
            droidIds = ids;
          else
            droidIds = ids.map(x=> {
              const {type, id} = fromGlobalId(x);
              if (type === 'Droid') return id;
            });
          return getDroid(droidIds);
        }
        return getDroid();
      }
    },
    //human: {
    //  type: humanType,
    //  args: {
    //    id: {
    //      description: 'id of the human',
    //      type: new GraphQLNonNull(GraphQLString)
    //    }
    //  },
    //  resolve: (root, { id }) => getHuman(id)
    //},
    //droid: {
    //  type: droidType,
    //  args: {
    //    id: {
    //      description: 'id of the droid',
    //      type: new GraphQLNonNull(GraphQLString)
    //    }
    //  },
    //  resolve: (root, { id }) => getDroid(id)
    //},
    //character:{
    //  type:SWCharacterType,
    //  args:{
    //    id:{
    //      description:'id of the character',
    //      type:new GraphQLNonNull(GraphQLString)
    //    }
    //  },
    //  resolve:(root, {id})=>{
    //    var droid = getDroid(id);
    //    if(droid) return droid;
    //    var human = getHuman(id);
    //    if(human) return human;
    //  }
    //}
  })
});

/**
 * Finally, we construct our schema (whose starting query type is the query
 * type we defined above) and export it.
 */
export const StarWarsSchema = new GraphQLSchema({
  query: queryType
});

//mutation  {
//  Character: updateCharacterName(
//    id: "1001",
//    newName: "Fangming"
//) {
//    id,
//      name
//  }
//}