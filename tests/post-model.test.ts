const db = require('../data/db-config');
import { BasePost, Post } from '../api/posts/post.interface';
import * as PostModel from '../api/posts/posts-model';
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


describe('posts-model.ts', function() {
    describe('get()', function() {
        it('returns correct number of posts', async function() {
            const posts = await PostModel.get()
            expect(posts).toHaveLength(initialPosts.length)
        })
        it('returns the correct posts', async function() {
            const posts = await PostModel.get()
            posts.forEach((post: Post, i: number) => {
                expect(post).toMatchObject<BasePost>(initialPosts[i])
            })
        })
        it('returns empty array if no posts', async function() {
            await db.migrate.rollback()
            await db.migrate.latest()
            const posts = await PostModel.get()
            expect(posts).toEqual<Post[]>([])
            expect(posts).toHaveLength(0)
            expect(posts).not.toBeUndefined()
            expect(posts).not.toBeNull()
        })
    })
    describe('getById(id: Post[\'id\'])', function() {
        it('returns correct post', async function() {
            const posts = await PostModel.get()
            const post0 = await PostModel.getById(posts[0].id)
            expect(post0).toEqual<Post>(posts[0])
            expect(post0).toMatchObject<BasePost>(initialPosts[0])
            
            const post1 = await PostModel.getById(posts[1].id)
            expect(post1).toEqual<Post>(posts[1])
            expect(post1).toMatchObject<BasePost>(initialPosts[1])

            const post_n = await PostModel.getById(posts.slice(-1)[0].id)
            expect(post_n).toEqual<Post>(posts.slice(-1)[0])
            expect(post_n).toMatchObject<BasePost>(initialPosts.slice(-1)[0])
        })
        it('returns undefined for nonexistant post', async function() {
            const fakeId = initialPosts.length + 1;
            const noPost = await PostModel.getById(fakeId)

            expect(noPost).toBeFalsy()
            expect(noPost).not.toBeNull()
            expect(noPost).toBeUndefined()
        })
    })
    describe('insert(post: BasePost)', function() {
        it('inserts and returns newly inserted post', async function() {
            const newBasePost: BasePost = { user_id: 1, text: "new base post" }
            const newPost = await PostModel.insert(newBasePost)

            expect(newPost).toMatchObject(newBasePost)
            expect(newPost).toHaveProperty('id')
        })
        it('after insert, number of posts increases by 1', async function() {
            const oldPosts: Post[] = await PostModel.get()
            const newBasePost: BasePost = { user_id: 1, text: "new base post" }
            const newPost = await PostModel.insert(newBasePost)
            const newPosts: Post[] = await PostModel.get()
            
            expect(newPosts).toHaveLength(oldPosts.length + 1)
            expect(newPosts).toMatchObject([...oldPosts, newBasePost])
            expect(newPosts).toEqual([...oldPosts, newPost])
        })
        it('returns error if invalid foreign key', async function() {
            let errorTriggered: boolean = false
            const invalidBasePost: BasePost = { user_id: 1000, text: "this post is invalid" }
            try {
                const invalidPost = await PostModel.insert(invalidBasePost)
                console.log(invalidPost)
            } catch (err: any) {
                errorTriggered = true
                expect(err).toHaveProperty('errno')
                expect(err).toHaveProperty('code')
                expect(err).toHaveProperty('message')
                
                expect(err.errno).toEqual(19)
                expect(err.code).toMatch(/SQLITE_CONSTRAINT/)
                expect(err.message).toMatch(/FOREIGN KEY constraint failed/)
            }
            expect(errorTriggered).toBe(true)
        })
    })
    describe('update(id: Post[\'id\'], changes: BasePost)', function() {
        it('returns number of updated posts', async function() {
            const changes: BasePost = { user_id: 1, text: "updated post text" }

            const validId: Post['id'] = 1
            let updated: number | undefined = await PostModel.update(validId, changes)
            expect(updated).toBe<number>(1)

            const invalidId: Post['id'] = 40
            updated = await PostModel.update(invalidId, changes)
            expect(updated).toBe<number>(0)
        })
        it('updates post of valid id with given changes', async function() {
            const id: Post['id'] = 1
            const changes: BasePost = { user_id: 1, text: "updated post text" }
            
            const oldPost: Post | undefined = await PostModel.getById(id)
            await PostModel.update(id, changes)
            const updatedPost: Post | undefined = await PostModel.getById(id)

            expect(updatedPost).not.toEqual(oldPost)
            expect(oldPost?.text).not.toMatch(changes.text)
            expect(updatedPost?.text).toMatch(changes.text)
            expect(updatedPost?.text).not.toEqual(oldPost?.text)
        })
        it('after update, no change to number of posts', async function() {
            const id: Post['id'] = 1
            const numberOfPosts: number = (await PostModel.get()).length
            const changes: BasePost = { user_id: 1, text: "updated post text" }
            await PostModel.update(id, changes)
            const newPosts: Post[] = await PostModel.get()

            expect(newPosts).toHaveLength(numberOfPosts)
        })
    })
    describe('remove(id: Post[\'id\'])', function() {
        it('valid id call returns number of posts removed', async function() {
            const id: Post['id'] = 1
            const deleted: number = await PostModel.remove(id)
            expect(deleted).toEqual<number>(1)
            expect(deleted).toBe<number>(1)
        })
        it('valid call reduces number of posts by 1', async function() {
            const id: Post['id'] = 1
            const numberOfPosts: number = (await PostModel.get()).length
            await PostModel.remove(id)
            const newPosts: Post[] = await PostModel.get()

            expect(newPosts).not.toHaveLength(numberOfPosts)
            expect(newPosts).toHaveLength(numberOfPosts - 1)
        })
        it('valid call removes that post', async function() {
            const id: Post['id'] = 1
            const post: Post | undefined = await PostModel.getById(id)
            await PostModel.remove(id)

            const deletedPost: Post | undefined = await PostModel.getById(id)
            expect(deletedPost).toBeFalsy()
            expect(deletedPost).not.toBeNull()
            expect(deletedPost).toBeUndefined()

            const newPosts: Post[] = await PostModel.get()
            expect(newPosts).not.toContain(post)
            expect(newPosts).not.toContainEqual(post)
            newPosts.forEach((newPost: Post, i: number) => {
                expect(post).not.toMatchObject<Post>(newPost)
            })
        })
        it('invalid id call returns 0 posts removed', async function() {
            const id: Post['id'] = initialPosts.length + 1
            const deleted: number = await PostModel.remove(id)
            expect(deleted).toEqual<number>(0)
            expect(deleted).toBe<number>(0)
        })
        it('invalid id call does not change number of posts', async function() {
            const id: Post['id'] = initialPosts.length + 1
            const numberOfPosts: number = (await PostModel.get()).length
            await PostModel.remove(id)
            const newPosts: Post[] = await PostModel.get()

            expect(newPosts).toHaveLength(numberOfPosts)
        })
    })
})