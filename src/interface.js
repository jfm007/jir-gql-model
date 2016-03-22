import BaseObject from './baseObject';
import { GraphQLInterfaceType, GraphQLUnionType } from 'graphql';
import invariant from 'invariant'
/*Used to construct interface type from graphQl*/
class Interface extends BaseObject {
  constructor(...props){
    super(...props);
  }
  resolve(resolve) {
    this.resolveType = resolve;
    return this;
  }

  gql() {
    const { resolveType } = this;
    return new GraphQLInterfaceType({...super.gql(), resolveType});
  }
}
/*Used to construct a Union type in the graphQL*/
class Union {
  constructor(name, types, resolve, description){
    this.name = name;
    invariant(typeof types === 'object', 'Missing types information');
    this.types = types;
    if(typeof resolve === 'function'){
      this.resolveType = resolve;
    }
    else if(typeof resolve === 'string'){
      this.description = resolve;
    }
    if(description) this.description = description;
  }
  resolve(resolve){
    this.resolveType = resolve;
    return this;
  }
  gql(){
    return new GraphQLUnionType({...this});
  }
}
/*Export the union class as gUnion*/
export function gUnion(...args){
  return new Union(...args);
}
/*Export the interface class as gInterface*/
export function gInterface(...args) {
  return new Interface(...args);
}
