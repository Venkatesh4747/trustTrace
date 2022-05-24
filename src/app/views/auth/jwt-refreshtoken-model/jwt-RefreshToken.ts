export interface JwtModel {
    sub: string;
    exp: number;
    iat: number;
}

export interface RefreshTokenResponse {
    accessToken: string;
}
