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
