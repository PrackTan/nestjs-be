export interface User {
  _id: string;
  email: string;
  password: string;
  name: string;
  role: string;
  phone: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  accountType: string;
}
