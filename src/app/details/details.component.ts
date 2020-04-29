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
    isRecommended: boolean;
    isDisplayed = true;
    userInfo: UserInfo;

    constructor(
        private route: ActivatedRoute,
        private authService: AuthService,
        private editorService: EditorService,
        private snackBar: MatSnackBar,
    ) {}

    ngOnInit(): void {
        this.route.data.subscribe((data: { details: Details }) => {
            this.details = data.details;
            this.isRecommended = new EditorialPipe().transform(this.details);
        });
        this.route.params.subscribe((params) => (this.id = params.id));
        this.authService.getUserInfo().subscribe((userInfo) => (this.userInfo = userInfo));
    }

    async markAsRecommended() {
        try {
            await this.editorService.markAsRecommended(this.id, !this.isRecommended);
            this.isRecommended = !this.isRecommended;
            if (this.isRecommended) {
                this.snackBar.open($localize`Marked as recommended`, null, { duration: 3000 });
            } else {
                this.snackBar.open($localize`Removed recommendation`, null, { duration: 3000 });
            }
        } catch (error) {
            this.snackBar.open($localize`Failed to edit recommendation`, null, { duration: 3000 });
        }
    }

    async hide() {
        try {
            await this.editorService.setDisplayState(this.id, false);
            const snackBarRef = this.snackBar.open(
                $localize`The entry will no longer be displayed in results`,
                $localize`Undo`,
            );
            snackBarRef.onAction().subscribe(() => {
                this.undoHide();
            });
            this.isDisplayed = false;
        } catch (error) {
            this.snackBar.open($localize`Failed to perform action`, null, { duration: 3000 });
        }
    }

    async undoHide() {
        try {
            await this.editorService.setDisplayState(this.id, true);
            this.isDisplayed = true;
            this.snackBar.open($localize`The entry will be displayed again`, null, {
                duration: 3000,
            });
        } catch (error) {
            this.snackBar.open($localize`Failed to perform action`, null, { duration: 3000 });
        }
    }
}
