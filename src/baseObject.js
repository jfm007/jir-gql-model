import invariant from 'invariant';
import _ from 'lodash';
/*Used to set up the field resolve for the field types and args
* Used it to allow the circular referencing*/
function gqlFieldsResolve(fields) {
  const fieldNames = Object.keys(fields);
  const fieldDefs = {};
  for (const fieldName of fieldNames) {
    const field = fields[fieldName];
    const { type } = field;

    fieldDefs[fieldName] = {
      ...field,
      //resolve the fields for args from the args def
      args: gqlFieldsResolve(field.args || {}),
      //if the type is a circular referencing then it was supposed to use function to define it.
      type: typeof type === 'function' ? type() : type
    };
  }
  return fieldDefs;
}

export default class BaseObject {
  constructor(name, description) {
    this.name = name;
    this.description = description;

    this._field = null;
    this.fields = {};
  }

  _saveField() {
    if (this._field) {
      this.fields[this._field.name] = this._field;
      this._field = null;
    }
  }

  /*how the field behaves is like this.
  * params
  *   name: the name of the field. If the field is not defined, then it will create a new field
  *         with the given name.
  *         If the field is define, it enter the mode to start editing the field.
  *   type, description, resolve:
  *         If the field is new field, then the type, description and resolve is used to set up the new field
  *         if the field is an existing field, then the type, des and resolve is used to update the definition of the
  *         old field
  * */
  field(name, type, description, resolve) {
    if (typeof description === 'function') {
      /* eslint-disable no-param-reassign */
      resolve = description;
      description = null;
      /* eslint-enable no-param-reassign */
    }

    this._saveField();
    if(typeof name === 'string') {
      /// only allowed to update description and resolve
      if (this.fields[name]) {
        this._field = this.fields[name];
        if (description)
          this._field.description = description;
        if (resolve)
          this._field.resolve = resolve;
        if (type)
          this._field.type = type;
        if(name === 'id' && (description || resolve || type))
          console.log(this._field);
      }
      else {
        invariant(type,
          `field(...): '${name}' has an undefined or null type. If you ` +
          `are trying to refer to '${this.name}' then you should use a function`);

        this._field = {
          name,
          type,
          description,
          resolve,
          args: {}
        };
      }
    }
    else if(typeof name === 'object'){
      //console.log(name);
      invariant(name.name, 'Must supply a name for graph ql field')
      invariant(name.type, 'Must supply a graphql compatible type');
      if(this.fields[name.name]){
        this._field = this.fields[name.name];
        let {type, description, resolve, args} = name;
        this._field = {...name}
      }
      else
        this._field = {...name};
    }
    return this;
  }
  args(args){
    if(args){
      invariant(this._field, `args(...): must appear under a field`);
      this._field.args = args;
    }
    return this;
  }
  /*Used to add/update arg information for the current field. Need to do more about it*/
  arg(name, type, defaultValue, description) {
    if (!description) {
      /* eslint-disable no-param-reassign */
      description = defaultValue;
      defaultValue = undefined;
      /* eslint-enable no-param-reassign */
    }

    invariant(this._field, `arg(...): '${name}' must appear under a field`);

    //If the first param is string, we do the normal setup with eh type, default value and description
    if (typeof name === 'string') {
      invariant(!this._field.args[name],
        `arg(...): '${name}' is already defined by ${this._field.name}`);

      this._field.args[name] = {name, type, description, defaultValue};
    }
    //if the first param name is not string, we assume it is a complete args definition
    else if(name.name){
      this._field.args[name.name] = name;
    }
    return this;
  }

  deprecated(reason) {
    invariant(
      this._field,
      `deprecated(...): Deprecations must appear under a field`
    );

    this._field.deprecationReason = reason;
    return this;
  }

  /*Used to get the graphQL object*/
  gql() {
    this._saveField();

    const { name, description } = this;
    return {
      name,
      description,
      fields: () => gqlFieldsResolve(this.fields)
    };
  }
}
