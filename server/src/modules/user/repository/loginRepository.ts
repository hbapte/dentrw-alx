import User from "../../../database/models/user";
import bcrypt from "bcrypt";

export const findUserByEmail = async (email: string) => {
  return await User.findOne({ email });
};

export const comparePasswords = async (password: string, hashedPassword: string) => {
  return await bcrypt.compare(password, hashedPassword);
};
