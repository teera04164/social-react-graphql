const { UserInputError } = require("apollo-server-errors")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const {
  validateRegisterInput,
  validateLoginInput
} = require("../../utils/validator")
const { SECRET_KEY } = require("../../config")
const User = require("./../../models/User")

const genToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username
    },
    SECRET_KEY,
    { expiresIn: "1h" }
  )
}

module.exports = {
  Mutation: {
    async login(_, { username, password }) {
      const { errors, valid } = validateLoginInput(username, password)
      const user = await User.findOne({ username })
      if (!valid) {
        errors.general = "Errors"
        throw new UserInputError(errors.general, { errors })
      }
      if (!user) {
        errors.general = "User not found"
        throw new UserInputError(errors.general, { errors })
      }

      const match = await bcrypt.compare(password, user.password)
      if (!match) {
        errors.general = "Worng credentials"
        throw new UserInputError(errors.general, { errors })
      }

      const token = genToken(user)
      return {
        ...user._doc,
        id: user._id,
        token
      }
    },
    async register(
      _,
      { registerInput: { username, email, password, confirmPassword } },
      context,
      info
    ) {
      const { valid, errors } = validateRegisterInput(
        username,
        email,
        password,
        confirmPassword
      )

      if (!valid) {
        throw new UserInputError("Error", { errors })
      }

      const user = await User.findOne({ username })
      if (user) {
        throw new UserInputError("Username is taken", {
          errors: {
            username: "This username is taken"
          }
        })
      }

      password = await bcrypt.hash(password, 12)
      const newUser = new User({
        email,
        username,
        password,
        confirmPassword,
        createdAt: new Date().toISOString()
      })
      const res = await newUser.save()

      const token = genToken(res)

      return {
        ...res._doc,
        id: res._id,
        token
      }
    }
  }
}
