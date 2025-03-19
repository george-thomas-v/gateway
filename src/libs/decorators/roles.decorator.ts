import { CustomDecorator, SetMetadata } from '@nestjs/common';
import { EUserRoles } from '@app/enums';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: EUserRoles[]): CustomDecorator<string> =>
  SetMetadata(ROLES_KEY, roles);
