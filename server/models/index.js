/**
 * Created by sibelius on 05/04/16.
 */

import validate from 'validate.js';

import User, {UserConstraints} from './User';
import Chat from './Chat';
import Measure from './Measure';
import Message from './Message';

export default [User, Chat, Measure, Message];


export function validateHook(fieldName, args){
    switch (fieldName) {
        case 'addUser':
        case 'updateUser':
            return  validate(args, UserConstraints);
        default:
            return null;
    }
}