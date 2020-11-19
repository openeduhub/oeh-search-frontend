import { Clipboard } from '@angular/cdk/clipboard';
import { Location } from '@angular/common';
import { Component, OnInit, Renderer2 } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { UserInfo } from 'angular-oauth2-oidc';
import { environment } from '../../environments/environment';
import { EditorialTag, Hit, Type } from '../../generated/graphql';
import { AuthService } from '../auth.service';
import { EditorService } from '../editor.service';
import { HasEditorialTagPipe } from '../has-editorial-tag.pipe';

@Component({
    selector: 'app-details',
    templateUrl: './details.component.html',
    styleUrls: ['./details.component.scss'],
})
export class DetailsComponent implements OnInit {
    readonly Type = Type;
    readonly EditorialTag = EditorialTag;
    readonly wordpressUrl = environment.wordpressUrl;
    id: string;
    hit: Hit;
    isRecommended: boolean;
    isDisplayed = true;
    userInfo: UserInfo;

    constructor(
        private route: ActivatedRoute,
        private authService: AuthService,
        private clipboard: Clipboard,
        private editorService: EditorService,
        private snackBar: MatSnackBar,
        private location: Location,
        private renderer: Renderer2,
    ) {}

    ngOnInit(): void {
        this.route.data.subscribe((data: { details: Hit }) => {
            this.hit = data.details;
            this.isRecommended = new HasEditorialTagPipe().transform(
                this.hit,
                EditorialTag.Recommended,
            );
        });
        this.route.params.subscribe((params) => (this.id = params.id));
        this.authService.getUserInfo().subscribe((userInfo) => (this.userInfo = userInfo));
        // this.renderer
        //     .listen(document, 'keydown.control.c', () => this.copyTableEntryToClipboard());
        // this.renderer.listen(document, 'keydown.meta.c', () => this.copyTableEntryToClipboard());
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

    goBack() {
        this.location.back();
    }

    // private copyTableEntryToClipboard() {
    //     if (window.getSelection().toString() === '') {
    //         this.clipboard.copy(this.getTableEntry());
    //         this.snackBar.open($localize`Copied table entry to clipboard`, null, {
    //             duration: 3000,
    //         });
    //     }
    // }

    // private getTableEntry() {
    //     return [
    //         this.details.lom.general.title,
    //         this.id,
    //         this.details.collection?.map((collection) => collection.uuid).join(';'),
    //         this.details.type,
    //         this.details.lom.general.description,
    //         this.details.lom.technical.location,
    //         `${environment.relayUrl}/rest/entry/${this.id}/thumbnail`,
    //         this.details.valuespaces.learningResourceType?.map((value) => value.de).join(';'),
    //         this.details.valuespaces.discipline?.map((value) => value.de).join(';'),
    //         this.details.valuespaces.educationalContext?.map((value) => value.de).join(';'),
    //         this.details.license?.url,
    //         this.details.valuespaces.intendedEndUserRole?.map((value) => value.de).join(';'),
    //         '', // typical age range from
    //         '', // typical age range to
    //         '', // material language
    //         this.details.lom.general.keyword?.join(';'),
    //     ].join('\t');
    // }
}
