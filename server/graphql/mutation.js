import {
	GraphQLString,
	GraphQLSchema,
	GraphQLObjectType,
	GraphQLInputObjectType
} from 'graphql';

import {
	globalIdField,
	connectionArgs,
	connectionFromArray,
	connectionDefinitions,
	nodeDefinitions,
	mutationWithClientMutationId,
	fromGlobalId
} from 'graphql-relay';


import { getSchema } from '@risingstack/graffiti-mongoose';

import GraphQLDate from 'graphql-date';
import User from '../models/User';
import Promise from 'bluebird';

import Models from '../models';

var jwt = require('jsonwebtoken');
let auth = function(token, options) {
	return new Promise(function(resolve, reject) {
		jwt.verify(token, 'my-secret-code', options, function(err, decoded) {
			if (err) {
				return reject(err);
			}
			return resolve(decoded);
		});
	});
};

//
//
//
// const TeamType = new GraphQLObjectType({
// 	name: 'TeamType',
// 	fields: {
// 		name: { type: GraphQLString, nonNull: true },
// 		email: { type: GraphQLString, nonNull: true },
// 	}
// });
//
// const ChatType = new GraphQLObjectType({
//     name: 'ChatType',
//     fields: {
//         createdAt: {type: GraphQLDate}
//     }
// })
//
// const UserType = new GraphQLObjectType({
// 	name: 'UserType',
// 	fields: {
// 		_id: { type: GraphQLString, nonNull: true },
// 		name: { type: GraphQLString, nonNull: true },
// 		email: { type: GraphQLString, nonNull: true },
// 		profile: { type: GraphQLString },
// 		createdAt: { type: GraphQLDate },
// 		team: {
// 			type: connectionDefinitions({
// 				name: 'UserTeam',
// 				nodeType: TeamType,
// 			}).connectionType,
// 			args: {...connectionArgs },
// 			resolve: (parent, args, context) => {
// 				return connectionFromArray(parent.team, args);
// 			}
// 		},
// 	}
// });

let types = getSchema(Models)._typeMap;

let UserSchema = new GraphQLSchema({
	query: new GraphQLObjectType({
		name: 'Query',
		fields: {
			user: {
				type: types.User,
				args: {
					token: { type: GraphQLString }
				},
				resolve: async(root, args, context, info) => {
					console.log(context.request.body);
					if (!args.token) {
						return null;
					}
					let decoded = await auth(args.token);
					return User.findById(decoded.id).then(result => {
						return {
							...result.toObject()
						};
					});
				}
			},
		}
	}),
	mutation: new GraphQLObjectType({
		name: 'Mutation',
		fields: {
			updateUser: mutationWithClientMutationId({
				name: 'UpdateUser',
				inputFields: {
					...types.updateUserInput._fields,
					id: { type: GraphQLString },
					token: { type: GraphQLString, nonNull: true }
				},
				outputFields: {
					changedUser: {
						type: types.User,
						resolve: user => user
					}
				},
				mutateAndGetPayload: async(args) => {
					var token = args.token;
					delete args.token;
					let decoded = await auth(token);
					return User.update({ _id: decoded.id }, args).then(res => {
						console.log(res);
						if (res.ok) {
							return User.findById(decoded.id).then(result => result.toObject());
						}
						return null;
					});
				}
			})
		}
	})
});

export default UserSchema;