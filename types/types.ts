export interface User {
  name: string;
  email: string;
  sub: string;
  iat: number;
  exp: number;
  jti: string;
  picture?: string;
  image?: string;
}

export interface APIUserInfo extends User {
  user: User;
}
