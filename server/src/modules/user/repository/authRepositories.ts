// server\src\modules\user\repository\authRepositories.ts
import User from "../../../database/models/user";
import bcrypt from "bcryptjs";

export const createUser = async (names: string, email: string, username: string, password: string) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ names, email, username, password: hashedPassword });
  await newUser.save();
};


export const findUserByEmail = async (email: string) => {
    return await User.findOne({ email });
  };
  