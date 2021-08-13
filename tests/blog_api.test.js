const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')

const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')

let token
beforeEach(async () => {
  await Blog.deleteMany({})
  await User.deleteMany()

  const passwordHash = await bcrypt.hash('sekret', 10)
  const user = new User({
    username: 'root',
    name: 'Master User',
    password: passwordHash,
  })
  await user.save()
  const userForToken = {
    username: user.username,
    id: user.id,
  }
  token = jwt.sign(userForToken, process.env.SECRET)

  const blogObjects = helper.initialBlogs.map((blog) => new Blog(blog))
  const promiseArray = blogObjects.map((blog) => blog.save())
  await Promise.all(promiseArray)
})

describe('when there is initally some blogs saved', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  }, 100000)

  test('there are  blogs', async () => {
    const response = await api.get('/api/blogs')

    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })

  test('the first blog is about HTTP methods', async () => {
    const response = await api.get('/api/blogs')

    const author = response.body.map((r) => r.author)
    expect(author).toContain('Browser can execute only Javascript')
  })
  test('the unique identifier property of the blog post is id', async () => {
    const response = await api.get('/api/blogs')
    const blog = response.body[0]
    expect(blog.id).toBeDefined()
  })
})

describe('addition of new blog ', () => {
  test('a valid blog can be added', async () => {
    const newBlog = {
      author: 'Shine',
      title: 'Shine',
      url: 'shine.com',
      likes: 20,
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', `bearer ${token}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

    const author = blogsAtEnd.map((n) => n.author)
    expect(author).toContain('Shine')
  })

  test('blog without likes makes likes zero', async () => {
    const newBlog = {
      author: 'Mini',
      title: 'Mine',
      url: 'mine.com',
    }

    const response = await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', `bearer ${token}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)
    const blogr = response.body
    expect(blogr.likes).toBe(0)
  })

  test('blog without url and title responds to 400 Bad Request', async () => {
    const newBlog = {
      url: 'mine.com',
    }
    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', `bearer ${token}`)
      .expect(400)
    const blogr = await helper.blogsInDb()
    expect(blogr.length).toBe(helper.initialBlogs.length)
  })
})

describe('deletion of a note', () => {
  test('succeeds with status code 200 if id and user id is same is valid', async () => {
    const newBlog = {
      title: 'Full Stack',
      author: 'StackMaster',
      url: 'https://stack.com/',
      likes: 1,
    }
    const result = await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', `bearer ${token}`)

    const response = await api.get(`/api/blogs/${result.body.id}`)
    const deleteBlog = await api
      .delete(`/api/blogs/${result.body.id}`)
      .set('Authorization', `bearer ${token}`)
    expect(deleteBlog.status).toBe(204)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
    const author = blogsAtEnd.map((r) => r.author)
    expect(author).not.toContain(newBlog.author)
  })
})

describe('updating of a note', () => {
  test('succeeds with status code 200', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToEdit = blogsAtStart[0]

    const newBlog = {
      author: 'updated',
      title: 'updated',
      url: 'updated.com',
    }

    await api.put(`/api/blogs/${blogToEdit.id}`).send(newBlog).expect(200)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)

    const author = blogsAtEnd.map((n) => n.author)
    expect(author).toContain('updated')
  })
})

afterAll(() => {
  mongoose.connection.close()
})
