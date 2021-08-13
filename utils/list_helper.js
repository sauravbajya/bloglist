const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((sum, item) => sum + item.likes, 0)
}

const favouriteBlog = (blogs) => {
  const highlike = blogs.reduce(
    (high, blog) => (high = high > blog.likes ? high : blog.likes),
    0
  )
  const blogObj = blogs.find((blog) => (blog.likes = highlike))
  return {
    title: blogObj.title,
    author: blogObj.author,
    likes: blogObj.likes,
  }
}

module.exports = { dummy, totalLikes, favouriteBlog }
