import knex from 'knex';
const configs = require('../knexfile');
const environment: string = process.env.NODE_ENV || 'development';

const db = knex(configs[environment]);

module.exports = db;
