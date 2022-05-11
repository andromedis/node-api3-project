const db = require('../../data/db-config');
import { BasePost, Post } from './post.interface';

export function get(): Promise<Post[]> {
  return db('posts');
}

export function getById(id: Post['id']): Promise<Post | undefined> {
  return db('posts')
    .where({ id })
    .first();
}

export function insert(post: BasePost): Promise<Post | undefined> {
  return db('posts')
    .insert(post)
    .then((ids: Post['id'][]) => {
      return getById(ids[0]);
    });
}

export function update(id: Post['id'], changes: BasePost): Promise<number> {
  return db('posts')
    .where({ id })
    .update(changes);
}

export function remove(id: Post['id']): Promise<number> {
  return db('posts')
    .where('id', id)
    .del();
}
