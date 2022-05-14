const db = require('../data/db-config');
import { BaseUser, User } from '../api/users/user.interface';
import { BasePost, Post } from '../api/posts/post.interface';
import * as UserModel from '../api/users/users-model';
import * as PostModel from '../api/posts/posts-model';
const { users: initialUsers }: {users: BaseUser[]} = require('../data/seeds/02-users');
const { posts: initialPosts }: {posts: BasePost[]} = require('../data/seeds/03-posts');


beforeAll(async () => {
    await db.migrate.rollback()
    await db.migrate.latest()
})
beforeEach(async () => {
    await db.seed.run()
})
afterAll(async function() {
    await db.destroy()
})


it('sanity check', () => {
    expect(true).not.toBe(false)
})


describe('users-model.ts', function() {
    describe('get()', function() {
        it('returns correct number of users', async function() {
            const users = await UserModel.get()
            expect(users).toHaveLength(initialUsers.length)
        })
        it('returns the correct users', async function() {
            const users = await UserModel.get()
            users.forEach((user: User, i: number) => {
                expect(user).toMatchObject<BaseUser>(initialUsers[i])
            })
        })
        it('returns empty array if no users', async function() {
            await db.migrate.rollback()
            await db.migrate.latest()
            const users = await UserModel.get()
            expect(users).toEqual<User[]>([])
            expect(users).toHaveLength(0)
            expect(users).not.toBeUndefined()
            expect(users).not.toBeNull()
        })
    })
    describe('getById(id: User[\'id\'])', function() {
        it('returns correct user', async function() {
            const users = await UserModel.get()
            const user0 = await UserModel.getById(users[0].id)
            expect(user0).toEqual<User>(users[0])
            expect(user0).toMatchObject<BaseUser>(initialUsers[0])
            
            const user1 = await UserModel.getById(users[1].id)
            expect(user1).toEqual<User>(users[1])
            expect(user1).toMatchObject<BaseUser>(initialUsers[1])

            const user_n = await UserModel.getById(users.slice(-1)[0].id)
            expect(user_n).toEqual<User>(users.slice(-1)[0])
            expect(user_n).toMatchObject<BaseUser>(initialUsers.slice(-1)[0])
        })
        it('returns undefined for nonexistant user', async function() {
            const fakeId = initialUsers.length + 1;
            const noUser = await UserModel.getById(fakeId)

            expect(noUser).toBeFalsy()
            expect(noUser).not.toBeNull()
            expect(noUser).toBeUndefined()
        })
    })
    describe('getUserPosts(userId: User[\'id\'])', function() {
        it('returns array of posts, which have properties id, text, postedBy', async function() {
            const userId: User['id'] = 1
            const name: User['name'] = initialUsers[0].name
            const userPosts: Post[] = await UserModel.getUserPosts(userId)
            userPosts.forEach((post: Post) => {
                expect(post).toHaveProperty<number>('id')
                expect(post).toHaveProperty<string>('text')
                expect(post).toHaveProperty<string>('postedBy')

                expect(post).not.toHaveProperty<number>('user_id')
                expect(post.postedBy).toMatch(name)
            })
        })
        it('returns empty array if no posts belonging to user', async function() {
            const id = initialUsers.length + 1
            const newUser = await UserModel.insert({ name: 'Bob' })
            expect(newUser?.id).toEqual(id)

            const userPosts: Post[] = await UserModel.getUserPosts(id)
            expect(userPosts).toEqual<Post[]>([])
            expect(userPosts).toHaveLength(0)
            expect(userPosts).not.toBeUndefined()
            expect(userPosts).not.toBeNull()
        })
        it('correct number of posts are returned', async function() {
            const userId: User['id'] = 1
            const numberOfUserPosts: number = initialPosts.filter((post: BasePost) => post.user_id == userId).length
            const userPosts: Post[] = await UserModel.getUserPosts(userId)

            expect(userPosts).toHaveLength(numberOfUserPosts)
        })
        it('all posts with user_id are returned', async function() {
            const userId: User['id'] = 1
            const name: User['name'] = initialUsers[0].name
            const filteredPosts: Post[] = (await PostModel.get())
                .filter((post: Post) => post.user_id == userId)
                .map((post: Post) => ({ ...post, postedBy: name }))           // adds postedBy property
            const userPosts: Post[] = (await UserModel.getUserPosts(userId))  
                .map((post: Post) => ({ ...post, user_id: userId }))          // adds user_id property

            expect(filteredPosts).toMatchObject(userPosts)
        })
    })
    describe('insert(user: BaseUser)', function() {
        it('inserts and returns newly inserted user', async function() {
            const newBaseUser: BaseUser = { name: "new name" }
            const newUser = await UserModel.insert(newBaseUser)

            expect(newUser).toMatchObject(newBaseUser)
            expect(newUser).toHaveProperty('id')
        })
        it('after insert, number of users increases by 1', async function() {
            const oldUsers: User[] = await UserModel.get()
            const newBaseUser: BaseUser = { name: "new name" }
            const newUser = await UserModel.insert(newBaseUser)
            const newUsers: User[] = await UserModel.get()
            
            expect(newUsers).toHaveLength(oldUsers.length + 1)
            expect(newUsers).toMatchObject([...oldUsers, newBaseUser])
            expect(newUsers).toEqual([...oldUsers, newUser])
        })
        it('returns error if non-unique name', async function() {
            let errorTriggered: boolean = false
            const existingBaseUser: BaseUser = initialUsers[0]
            try {
                const invalidUser = await UserModel.insert(existingBaseUser)
                console.log(invalidUser)
            } catch (err: any) {
                errorTriggered = true
                expect(err).toHaveProperty('errno')
                expect(err).toHaveProperty('code')
                expect(err).toHaveProperty('message')

                expect(err.errno).toEqual(19)
                expect(err.code).toMatch(/SQLITE_CONSTRAINT/)
                expect(err.message).toMatch(/UNIQUE constraint failed/)
            }
            expect(errorTriggered).toBe(true)
        })
    })
    describe('update(id: User[\'id\'], changes: BaseUser)', function() {
        it('returns number of updated users', async function() {
            const changes: BaseUser = { name: "new name" }

            const validId: User['id'] = 1
            let updated: number | undefined = await UserModel.update(validId, changes)
            expect(updated).toBe<number>(1)

            const invalidId: User['id'] = initialUsers.length + 1
            updated = await UserModel.update(invalidId, changes)
            expect(updated).toBe<number>(0)
        })
        it('updates user of valid id with given changes', async function() {
            const id: User['id'] = 1
            const changes: BaseUser = { name: "new name" }
            
            const oldUser: User | undefined = await UserModel.getById(id)
            await UserModel.update(id, changes)
            const updatedUser: User | undefined = await UserModel.getById(id)

            expect(updatedUser).not.toEqual(oldUser)
            expect(oldUser?.name).not.toMatch(changes.name)
            expect(updatedUser?.name).toMatch(changes.name)
            expect(updatedUser?.name).not.toEqual(oldUser?.name)
        })
        it('after update, no change to number of users', async function() {
            const id: User['id'] = 1
            const numberOfUsers: number = (await UserModel.get()).length
            const changes: BaseUser = { name: "new name" }
            await UserModel.update(id, changes)
            const newUsers: User[] = await UserModel.get()

            expect(newUsers).toHaveLength(numberOfUsers)
        })
    })
    describe('remove(id: User[\'id\'])', function() {
        it('valid id call returns number of users removed', async function() {
            const id: User['id'] = 1
            const deleted: number = await UserModel.remove(id)
            expect(deleted).toEqual<number>(1)
            expect(deleted).toBe<number>(1)
        })
        it('valid call reduces number of users by 1', async function() {
            const id: User['id'] = 1
            const numberOfUsers: number = (await UserModel.get()).length
            await UserModel.remove(id)
            const newUsers: User[] = await UserModel.get()

            expect(newUsers).not.toHaveLength(numberOfUsers)
            expect(newUsers).toHaveLength(numberOfUsers - 1)
        })
        it('valid call removes that user', async function() {
            const id: User['id'] = 1
            const user: User | undefined = await UserModel.getById(id)
            await UserModel.remove(id)

            const deletedUser: User | undefined = await UserModel.getById(id)
            expect(deletedUser).toBeFalsy()
            expect(deletedUser).not.toBeNull()
            expect(deletedUser).toBeUndefined()

            const newUsers: User[] = await UserModel.get()
            expect(newUsers).not.toContain(user)
            expect(newUsers).not.toContainEqual(user)
            newUsers.forEach((newUser: User, i: number) => {
                expect(user).not.toMatchObject<User>(newUser)
            })
        })
        it('invalid id call returns 0 (number of users removed)', async function() {
            const id: User['id'] = initialUsers.length + 1
            const deleted: number = await UserModel.remove(id)
            expect(deleted).toEqual<number>(0)
            expect(deleted).toBe<number>(0)
        })
        it('invalid id call does not change number of Users', async function() {
            const id: User['id'] = initialUsers.length + 1
            const numberOfUsers: number = (await UserModel.get()).length
            await UserModel.remove(id)
            const newUsers: User[] = await UserModel.get()

            expect(newUsers).toHaveLength(numberOfUsers)
        })
    })
})