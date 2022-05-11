const db = require('../../data/db-config');
import { BaseUser, User } from '../users/user.interface';
import { Post } from '../posts/post.interface';

export function get(): Promise<User[]> {
  return db('users');
}

export function getById(id: User['id']): Promise<User | undefined> {
  return db('users')
    .where({ id })
    .first();
}

export function getUserPosts(userId: User['id']): Promise<Post[]> {
  return db('posts as p')
    .join('users as u', 'u.id', 'p.user_id')
    .select('p.id', 'p.text', 'u.name as postedBy')
    .where('p.user_id', userId);
}

export function insert(user: BaseUser): Promise<User | undefined> {
  return db('users')
    .insert(user)
    .then((ids: User['id'][]) => {
      return getById(ids[0]);
    });
}

export function update(id: User['id'], changes: BaseUser): Promise<number> {
  return db('users')
    .where({ id })
    .update(changes);
}

export function remove(id: User['id']): Promise<number> {
  return db('users')
    .where('id', id)
    .del();
}
