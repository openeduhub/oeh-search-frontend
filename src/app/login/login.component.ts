import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { UserInfo } from 'angular-oauth2-oidc';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
    userInfo: UserInfo;

    constructor(private authService: AuthService) {}

    ngOnInit(): void {
        this.authService.bootstrap();
        this.authService.getUserInfo().subscribe((userInfo) => (this.userInfo = userInfo));
    }

    login() {
        this.authService.login();
    }

    logout() {
        this.authService.logout();
    }
}
