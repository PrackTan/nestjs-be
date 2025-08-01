import * as bcrypt from 'bcrypt';
const salt = 10;
export const hashPassword = async (plainPassword: string) => {
  try {
    return await bcrypt.hash(plainPassword, salt);
  } catch (error) {
    throw new Error('Error hashing password');
  }
};
export const comparePassword = async (plainPassword: string, hash: string) => {
  try {
    return await bcrypt.compare(plainPassword, hash);
  } catch (error) {
    throw new Error('Error comparing password');
  }
};
