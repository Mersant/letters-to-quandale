const { AuthenticationError } = require('apollo-server-express');
const { User, Journal } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    users: async () => {
      return User.find().populate('journal');
    },
    user: async (parent, { username }) => {
      return User.findOne({ username }).populate('journal');
    },
    journals: async (parent, { username }) => {
      return Journal.find(username).sort({ createdAt: -1 });
    },
    journal: async (parent, { journalId }) => {
      return Journal.findOne({ _id: journalId });
    },
    me: async (parent, args, context) => {
      if (context.user) {
        return User.findOne({ _id: context.user._id }).populate('journal');
      }
      throw new AuthenticationError('You need to be logged in!');
    },
  },

  Mutation: {
    addUser: async (parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);
      return { token, user };
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError('No user found with this email address');
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError('Incorrect credentials');
      }

      const token = signToken(user);

      return { token, user };
    },
    addJournal: async (parent, { journalText,image }, context) => {
      if (context.user) {
        const newJournal = await Journal.create({
          journalText,image
        });

        await User.findOneAndUpdate(
          { _id: context.user._id },
          {
             $addToSet: { journal: newJournal._id}
          },
          {
            new:true,
            runValidators:true
          }
        );

        return newJournal;
      }
      throw new AuthenticationError('You need to be logged in!');
    },
  },
};

module.exports = resolvers;