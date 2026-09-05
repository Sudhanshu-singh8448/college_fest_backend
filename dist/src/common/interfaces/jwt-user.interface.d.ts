export interface JwtUser {
    id: string;
    registrationNumber: string;
    email: string;
    roles: string[];
    permissions: string[];
}
