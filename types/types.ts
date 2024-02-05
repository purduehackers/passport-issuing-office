export interface User {
  name: string;
  email: string;
  picture: string;
  sub: string;
  iat: number;
  exp: number;
  jti: string;
}

export interface APIUserInfo extends User {
  user: User;
}
