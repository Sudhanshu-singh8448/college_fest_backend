/**
 * Shape of the user object attached to req.user by the JWT strategy.
 */
export interface JwtUser {
  id: string;
  registrationNumber: string;
  email: string;
  roles: string[];
  permissions: string[];
}
