export interface PayloadUser {
  sub: string;
  iss: string;
  user: User;
}

export interface User {
  _id: string;
  email: string;
  password: string;
  name: string;
  role: string;
  phone: string;
  isActive: boolean;
  accountType: string;
}
