/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import type { MicrosoftTokenRequest } from '../models/MicrosoftTokenRequest';
import type { RefreshTokenRequest } from '../models/RefreshTokenRequest';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
@Injectable({
    providedIn: 'root',
})
export class AuthService {
    constructor(public readonly http: HttpClient) {}
    /**
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public postApiAuthMicrosoft(
        requestBody: MicrosoftTokenRequest,
    ): Observable<any> {
        return __request(OpenAPI, this.http, {
            method: 'POST',
            url: '/api/Auth/microsoft',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public postApiAuthRefresh(
        requestBody: RefreshTokenRequest,
    ): Observable<any> {
        return __request(OpenAPI, this.http, {
            method: 'POST',
            url: '/api/Auth/refresh',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public postApiAuthLogout(): Observable<any> {
        return __request(OpenAPI, this.http, {
            method: 'POST',
            url: '/api/Auth/logout',
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public getApiAuthMe(): Observable<any> {
        return __request(OpenAPI, this.http, {
            method: 'GET',
            url: '/api/Auth/me',
        });
    }
}
