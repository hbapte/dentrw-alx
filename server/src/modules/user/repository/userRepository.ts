import User from "../../../database/models/user";

export const findOrCreateUser = async ({ googleId, email, name, picture }: any) => {
  let user = await User.findOne({ googleId });
  if (!user) {
    user = new User({ googleId, email, name, picture });
    await user.save();
  }
  return user;
};
