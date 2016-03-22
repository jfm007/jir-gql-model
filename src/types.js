import {
  GraphQLList,
  GraphQLNonNull,
  GraphQLSchema
} from 'graphql';

export function gList(type) {
  return new GraphQLList(type);
}

export function gRequired(type) {
  return new GraphQLNonNull(type);
}

export function gSchema(queryRootType, mutationRootType) {
  return new GraphQLSchema({
    query: queryRootType,
    mutation: mutationRootType
  });
}
