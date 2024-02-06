import { User } from "next-auth";

export interface MySession {
  user: User;
  expires: string;
  token: Token;
  passport: Passport | null;
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

export interface Passport {
  id: number;
  owner_id: number;
  version: number;
  surname: string;
  name: string;
  date_of_birth: string;
  date_of_issue: string;
  place_of_origin: string;
  secret: string;
  activated: boolean;
}
