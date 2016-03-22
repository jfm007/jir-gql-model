import invariant from 'invariant';
import BaseObject from './baseObject';
import _ from 'lodash';
import { GraphQLObjectType, GraphQLList, GraphQLNonNull, GraphQLScalarType} from 'graphql';
import { globalIdField } from 'graphql-relay';

/*gObj is used to construct GraphQLObjectType. It inherits from the BaseObject class
* add the behavior to automatically add the interface fields into it.
* */
class gObj extends BaseObject {
  constructor(...args){
    //let {name, description, interfaces}={...args}
    super(...args);
    if(typeof this.description === 'Object') {
      this.interfaces = this.description;
      this.description = null;
    }
    else
       this.interfaces = args[2];
    this._addInterfaceFields();
    //console.log(this.fields);
  }

  /*used to add the fields defined in the interfaces to the current type*/
  _addInterfaceFields(){
    if(this.interfaces && this.interfaces.length > 0){
      this.interfaces.forEach(i=>{
        if(this._isNodeInterface(i)){
          this.field(globalIdField(this.name));
          return;
        }
        if(i._typeConfig) {
          _.forEach(i._typeConfig.fields(), (field, fieldName)=> {
            let description = field.description;
            if(description)
            {
              description = description.replace(i.name, this.name)
              if(description === field.description)
                description = description.replace(i.name.toLowerCase(), this.name);
            }
            this._field = {...field, name: fieldName, description};
            this._saveField();
          });
        }
      })
    }
    return this;
  }
  /*Used to check whether the given type is node interface type*/
  _isNodeInterface(type){
    if(type.name === 'Node'){
      const fields = type._typeConfig.fields();
      return fields['id'];
    }
    return false;
  }
  /*Used to set up description for a field*/
  describe(description){
    invariant(this._field, `description(...): Description must appear under a field`);
    this._field.description = description;
    return this;
  }
  /*Used to set up resolve for a field*/
  resolve(resolve) {
    invariant(this._field, `resolve(...): Resolve must appear under a field`);
    this._field.resolve = resolve;
    return this;
  }
  /*Used to check whether the current field is type of the given type*/
  isTypeOf(isTypeOf) {
    this._field.isTypeOf = isTypeOf;
    return this;
  }

  gql() {
    const {interfaces} = this;
    return new GraphQLObjectType({...super.gql(), interfaces});
  }
}

export function gObject(...args) {
  return new gObj(...args);
}
