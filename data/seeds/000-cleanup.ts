import { Knex } from 'knex';
import knexCleaner from 'knex-cleaner';

exports.seed = function(knex: Knex) {
  return knexCleaner.clean(knex, {
    ignoreTables: ["knex_migrations", "knex_migrations_lock"]
  });
};
