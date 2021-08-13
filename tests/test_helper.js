const Blog = require('../models/blog')
const User = require('../models/user')
const initialBlogs = [
  {
    author: 'HTML is easy',
    title: 'tori ho',
    url: 'llll.co',
    likes: 50,
  },
  {
    title: 'asdasdsadsa ho',
    url: 'lasdasdsadlll.co',
    likes: 502,
    author: 'Browser can execute only Javascript',
  },
]

const nonExistingId = async () => {
  const blog = new Blog({
    title: 'will remove soon ',
    url: 'willremovesoon',
    likes: 1231,
    author: 'willremovesoon',
  })
  await blog.save()
  await blog.remove()

  return blog._id.toString()
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map((blog) => blog.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map((user) => user.toJSON())
}

module.exports = {
  initialBlogs,
  nonExistingId,
  blogsInDb,
  usersInDb,
}
