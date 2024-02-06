import { User } from "next-auth";

export interface MySession {
  user: User;
  expires: string;
  token: Token;
}

export interface Token {
  name: string;
  email: string;
  picture: string;
  sub: string;
  accessToken: string;
  iat: number;
  exp: number;
  jti: string;
}
