import {
  connectionArgs,
  connectionDefinitions,
  connectionFromArray,
  fromGlobalId,
  globalIdField,
  mutationWithClientMutationId,
  nodeDefinitions,
} from 'graphql-relay';

import {gSchema, gList, gRequired,
  gInterface, gObject,
  gEnum, gInt, gString, gUnion, gId}
  from '../src/index';
import * as data from './starWarsData';

import {GraphQLInterfaceType} from 'graphql'

let {nodeInterface, nodeField} = nodeDefinitions(
  (globalId)=>{
    let {type, id} = fromGlobalId(globalId);
    console.log(`type ${type}, id ${id}`);
    if(type === 'Human'){
      return data.humanData[id];
    }
    else if(type === 'Droid'){
      return data.droidData[id];
    }
  },
  (obj)=>{
    let id = obj.id;
    if(data.getHuman(id)) return gHuman;
    if(data.getDroid(id)) return gDroid;
    return null;
  }
);

const episodeEnum = gEnum('Episode',
  'One of the films in the Star Wars Trilogy')
  .value('NEWHOPE', 4, 'Released in 1977.')
  .value('EMPIRE', 5, 'Released in 1980.')
  .value('JEDI', 6, 'Released in 1983.')
  .gql();


//
export const gCharacter = gInterface('Character',
  'A character in the Star Wars Trilogy')
  .field('id', gRequired(gId), 'The id of the character.')
  .field('name', gString, 'The name of the character.')
  .field('friends',()=>friendConnection, 'friends of the character').args(connectionArgs)
  //.field('friends', ()=>gList(gCharacter))
  //  'The friends of the character, or an empty list if they have none')
  .field('appearsIn', gList(episodeEnum), 'Which movies they appear in.')
  .resolve((obj) => {
    return data.getHuman(obj.id) ? gHuman : gDroid;
  })
  .gql();

//export const gCharacter =  new GraphQLInterfaceType({
//  name: 'Character',
//  description: 'A character in the Star Wars Trilogy',
//  fields: () => ({
//    id: {
//      type: new gRequired(gId),
//      description: 'The id of the character.',
//    },
//    name: {
//      type: gString,
//      description: 'The name of the character.',
//    },
//    friends: {
//      type:friendConnection,
//      args: connectionArgs,
//      //type: new GraphQLList(characterInterface),
//      description: 'The friends of the character, or an empty list if they ' +
//      'have none.',
//    },
//    appearsIn: {
//      type: gList(episodeEnum),
//      description: 'Which movies they appear in.',
//    },
//  }),
//  resolveType: character => {
//    return data.getHuman(character.id) ? gHuman : gDroid;
//  }
//});
var {connectionType: friendConnection} =
  connectionDefinitions({name: 'Friend', nodeType: gCharacter});
export const gHuman = gObject('Human',
  'A humanoid creature in the Star Wars universe.',[gCharacter,nodeInterface])
  //.field(globalIdField('Human'))//.description('id of the human')
  .field('friends').args(connectionArgs).resolve((human, args)=>connectionFromArray(data.getFriends(human),args))
  //.field('friends').resolve(human=>data.getFriends(human))
  .field('homePlanet', gString,
    'The home planet of the human, or null if unknown.')
  .gql();
//console.log(gHuman._typeConfig.fields()['friends'].type._typeConfig.fields()['node']);
const gDroid = gObject('Droid',
  'A mechanical creature in the Star Wars universe.',[gCharacter,nodeInterface])
  .field('friends').args(connectionArgs).resolve((droid, args)=>connectionFromArray(data.getFriends(droid),args))
  .field(globalIdField('Droid'))
  //.field('friends').resolve((droid)=>data.getFriends(droid))
  .field('oldName', gString, "deprecated").deprecated("Deprecated Old Name")//.resolve((droid)=>{return droid.name})
  .field('primaryFunction', gString, 'The primary function of the droid.')
  .gql();

//const gHumanDroid = gUnion("HumanDroid", [gDroid, gHuman], "Union of human and droid")
//  .resolve((ghd)=>{
//    if(ghd.homePlanet) return gHuman;
//    if(ghd.primaryFunction) return gDroid;
//  })
//  .gql();
//console.log(gDroid._typeConfig.fields()['id']);
const gQuery = gObject('Query')
  .field(nodeField)
  .field('hero', gCharacter, () => data.artoo)
  .arg('episode', episodeEnum)
  .resolve((root, {episode})=>data.getHero(episode))
  .field('humans', new gList(gHuman), ()=>data.getHuman())
  .gql();
  //.field('human', gHuman)
  //.arg('id', gRequired(gString))
  //.resolve((root, {id}) => data.humanData[id])
  //.field('droid', gDroid)
  //.arg('id', gRequired(gString))
  //.resolve((root, {id}) => data.droidData[id])
  //.field('stwCharacter', gHumanDroid)
  //.arg('id', gRequired(gString))
  //.resolve((root, {id}) =>{
  //  var droid = data.getDroid(id);
  //  if(droid) return droid;
  //  var human = data.getHuman(id);
  //  if(human) return human;
  //})
  //.gql();

//const gMutation = gObject('Mutation')
//  .field('updateCharacterName', gCharacter)
//  .arg('id', gRequired(gString))
//  .arg('newName', gRequired(gString))
//  .resolve((root, {id, newName}) => data.updateCharacterName(id, newName))
//  .gql();

export const stwSchema = gSchema(gQuery);//,gMutation);