import User from "../../../database/models/user";
import bcrypt from "bcrypt";

export const createUser = async (names: string, email: string, username: string, password: string) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ names, email, username, password: hashedPassword });
  await newUser.save();
};
