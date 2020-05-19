import { Injectable } from '@angular/core';
import { AuthConfig, OAuthService, UserInfo } from 'angular-oauth2-oidc';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../environments/environment';

const authCodeFlowConfig: AuthConfig = {
    ...environment.openId,
    redirectUri: window.location.origin,
    responseType: 'code',
    scope: 'openid profile email offline_access api',
    showDebugInformation: !environment.production,
};

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private userInfo = new BehaviorSubject<UserInfo>(null);

    constructor(private oauthService: OAuthService) {}

    async bootstrap() {
        this.oauthService.configure(authCodeFlowConfig);
        await this.oauthService.loadDiscoveryDocumentAndTryLogin();
        if (this.oauthService.hasValidAccessToken()) {
            this.oauthService.setupAutomaticSilentRefresh();
            this.userInfo.next(await this.oauthService.loadUserProfile());
        }
    }

    async login() {
        this.oauthService.initCodeFlow();
    }

    logout() {
        this.oauthService.logOut();
        this.userInfo.next(null);
    }

    getUserInfo(): Observable<UserInfo> {
        return this.userInfo.asObservable();
    }
}
