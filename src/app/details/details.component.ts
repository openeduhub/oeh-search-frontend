import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Details } from '../search.service';
import { AuthService } from '../auth.service';
import { EditorService } from '../editor.service';
import { UserInfo } from 'angular-oauth2-oidc';
import { EditorialPipe } from '../editorial.pipe';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-details',
    templateUrl: './details.component.html',
    styleUrls: ['./details.component.scss'],
})
export class DetailsComponent implements OnInit {
    id: string;
    details: Details;
    userInfo: UserInfo;

    constructor(
        private route: ActivatedRoute,
        private authService: AuthService,
        private editorService: EditorService,
        private snackBar: MatSnackBar
    ) {}

    ngOnInit(): void {
        this.route.data.subscribe((data: { details: Details }) => (this.details = data.details));
        this.route.params.subscribe((params) => (this.id = params.id));
        this.authService.getUserInfo().subscribe((userInfo) => (this.userInfo = userInfo));
    }

    markAsRecommended() {
        this.editorService.markAsRecommended(this.id, !new EditorialPipe().transform(this.details));
        this.snackBar.open($localize`Status saved`);
    }
}
