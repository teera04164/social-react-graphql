const Post = require("../../models/Post")
const checkAuth = require("../../utils/check-auth")
const { AuthenticationError, UserInputError } = require("apollo-server")

module.exports = {
  Query: {},
  Mutation: {
    async createComment(_, { postId, body }, context) {
      const { username } = checkAuth(context)
      if (body.trim() === "") {
        throw new UserInputError("Emty comment", {
          errors: {
            body: "Comment body must not emty"
          }
        })
      }

      const post = await Post.findById(postId)
      if (post) {
        post.comments.unshift({
          body,
          username,
          createdAt: new Date().toISOString()
        })
        post.save()
        return post
      } else {
        throw new UserInputError("Post not found")
      }
    },
    async deleteComment(_, { postId, commentId }, context) {
      const { username } = checkAuth(context)

      const post = await Post.findById(postId)

      if (post) {
        const commentIndex = post.comments.findIndex((c) => c.id === commentId)

        if (post.comments[commentIndex].username === username) {
          post.comments.splice(commentIndex, 1)
          post.save()
          return post
        } else {
          throw new AuthenticationError("Action not allow")
        }
      }
      throw new Error("Not found post!")
    }
  }
}
