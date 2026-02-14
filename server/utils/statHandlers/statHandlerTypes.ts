export interface IOAuthTokenResponse {
    access_token: string;
    refresh_token: string;
    expires_in?: number;
    token_type?: string;
    scope?: string;
}

export interface ICardMetrics {
    played: number;
    resourced: number;
    activated: number;
    drawn: number;
    discarded: number;
}
