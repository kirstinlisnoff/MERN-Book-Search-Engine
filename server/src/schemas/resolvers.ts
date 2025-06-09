// import { saveBook } from '../controllers/user-controller';
import User from '../models/User.js';
import { signToken } from '../services/auth.js';
import { AuthenticationError } from 'apollo-server-errors';

const resolvers = {
  Query: {
    me: async (_parent: any, _args: any, context: any) => {
      console.log('Context user:', context.user);
      if (!context.user) {
        throw new AuthenticationError('You need to be logged in!');
      }
      const user = await User.findById(context.user._id);
      return user;
    },
  },

    Mutation: {
        login: async (_parent: any, { email, password }: { email: string; password: string }) => {
        const user = await User.findOne({ email });
        if (!user) {
          throw new AuthenticationError('No user found with this email address');
        }
        const correctPw = await user.isCorrectPassword(password);
        if (!correctPw) {
          throw new AuthenticationError('Incorrect password');
        }
        const token = signToken(user.username, user.email, user._id);
        return { token, user };
      },

        addUser: async (_parent: any, { username, email, password }: { username: string; email: string; password: string }) => {
            const user = await User.create({ username, email, password });
            const token = signToken(user.username, user.email, user._id);
            return { token, user };
        }, 

        saveBook: async (_parent: any, { bookData }: { bookData: any }, context: any) => {
            if (!context.user) {
                throw new AuthenticationError('You need to be logged in!');
            }
            const updatedUser = await User.findByIdAndUpdate(
                context.user._id,
                { $addToSet: { savedBooks: bookData } },
                { new: true, runValidators: true }
            );
            return updatedUser;
        },

        removeBook: async (_parent: any, { bookId }: { bookId: string }, context: any) => {
            if (!context.user) {
                throw new AuthenticationError('You need to be logged in!');
            }
            const updatedUser = await User.findByIdAndUpdate(
                context.user._id,
                { $pull: { savedBooks: { bookId } } },
                { new: true }
            );
            return updatedUser;
        },
    },
};  

export default resolvers;
