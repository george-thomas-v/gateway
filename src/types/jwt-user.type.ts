import { EUserRoles } from '@app/enums';
import { JwtPayload } from 'jsonwebtoken';

export enum ETokenType {
  ACCESS_TOKEN = 'access_token',
  REFRESH_TOKEN = 'refresh_token',
}

export interface JwtUser extends JwtPayload {
  sub: string;
  role: EUserRoles;
  type: ETokenType;
}
