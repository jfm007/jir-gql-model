/**
 * Created by jfm on 12/02/2016.
 */
import mocha from 'mocha';
import chai from 'chai';
import {GraphQLString} from 'graphql';
import {gList, gString} from '../src/index'
import BaseObject from '../src/baseObject'
import {humanType, characterInterface} from './starWarsSchema'
import {gHuman, gCharacter, stwSchema} from './gqlStwSchema'

chai.should();
describe('gqlModel', ()=> {
  describe('base object', ()=> {
    let baseObj = new BaseObject('name', 'test');
    it('constructor should have name and description set up', ()=> {
      baseObj.name.should.equal('name');
      baseObj.description.should.equal('test')
    });
    describe('field related', ()=> {
      it('allow to add field with calling field(name, type, des)', ()=> {
        let gqlObj = baseObj.field('fieldId', gString, "a field id", ()=> {
        }).gql();
       // console.log(characterInterface);
        gqlObj.should.have.property('fields');
        gqlObj.fields().should.have.property('fieldId');
        gqlObj.fields().fieldId.name.should.equals('fieldId');
        gqlObj.fields().fieldId.description.should.equals('a field id');
        (gqlObj.fields().fieldId.resolve === undefined).should.equal(false);
        gqlObj.fields().fieldId.type.should.equal(GraphQLString);
      });
    });
  });
  describe('ObjectType', ()=>{
     it('If it has interfaces, then the fields defined in its interfaces, ' +
       'should be defined on it', ()=>{
       //console.log(gHuman);
     })
  });
})
