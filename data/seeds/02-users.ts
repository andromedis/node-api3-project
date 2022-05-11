import { Knex } from 'knex';
import { BaseUser } from '../../api/users/user.interface';

const users: BaseUser[] = [
  { name: 'Frodo Baggins' },
  { name: 'Samwise Gamgee' },
  { name: 'Meriadoc Brandybuck' },
  { name: 'Peregrin Took' },
  { name: 'Mithrandir' },
  { name: 'Boromir' },
  { name: 'Legolas' },
  { name: 'Gimli' },
  { name: 'Aragorn' },
];

exports.users = users;

exports.seed = function (knex: Knex) {
  return knex('users').insert(users);
};
