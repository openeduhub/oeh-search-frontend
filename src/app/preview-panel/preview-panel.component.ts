import { Component, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { combineLatest, ReplaySubject } from 'rxjs';
import { distinctUntilChanged, filter, map, takeUntil } from 'rxjs/operators';
import { DetailsComponent } from '../details/details.component';
import { ViewService } from '../view.service';

@Component({
    selector: 'app-preview-panel',
    templateUrl: './preview-panel.component.html',
    styleUrls: ['./preview-panel.component.scss'],
})
export class PreviewPanelComponent implements OnDestroy {
    @ViewChild('dialogContent') dialogContentRef: TemplateRef<PreviewPanelComponent>;
    @ViewChild(DetailsComponent) detailsComponentRef: DetailsComponent;

    hit$ = this.view.getSelectedItem().pipe(filter((item) => !!item));
    mode$ = this.view.previewPanelMode$;
    showSidebar$ = combineLatest([this.view.getSelectedItem(), this.mode$]).pipe(
        map(([selectedItem, mode]) => !!selectedItem && mode === 'sidebar'),
    );

    private dialogRef: MatDialogRef<PreviewPanelComponent>;
    private destroyed$ = new ReplaySubject<void>(1);

    constructor(private dialog: MatDialog, private view: ViewService) {
        this.registerDialog();
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    private registerDialog(): void {
        combineLatest([
            this.view.getSelectedItem().pipe(
                map((selectedItem) => !!selectedItem),
                distinctUntilChanged(),
            ),
            this.view.previewPanelMode$,
        ])
            .pipe(
                takeUntil(this.destroyed$),
                filter(([showPreviewPanel, mode]) => showPreviewPanel && mode === 'dialog'),
            )
            .subscribe(() => this.openDialog());
        this.view.previewPanelMode$
            .pipe(
                takeUntil(this.destroyed$),
                filter((mode) => mode !== 'dialog'),
            )
            .subscribe(() => this.closeDialog('mode-change'));
    }

    private openDialog(): void {
        if (this.dialogRef) {
            console.warn('Tried to open dialog, but dialogRef already exists.');
            return;
        }
        this.dialogRef = this.dialog.open(this.dialogContentRef, {
            panelClass: 'app-preview-panel-dialog-container',
            backdropClass: 'app-backdrop',
            maxWidth: '',
            closeOnNavigation: false,
        });
        this.registerCloseOnBackNav();
        this.dialogRef.beforeClosed().subscribe((dialogResult) => {
            if (dialogResult !== 'mode-change') {
                this.view.selectItem(null);
            }
        });
        this.dialogRef.afterClosed().subscribe(() => {
            this.dialogRef = null;
        });
    }

    /**
     * On back navigation while the dialog is open, close the dialog instead of navigating back.
     */
    private registerCloseOnBackNav(): void {
        // Push a dummy state on history to catch the popstate event without triggering navigation.
        history.pushState(null, null, window.location.href);
        window.addEventListener('popstate', () => this.closeDialog('back-nav'), { once: true });
        // Cleanup the dummy state in case the dialog was closed by other means.
        this.dialogRef
            .beforeClosed()
            .pipe(filter((dialogResult) => dialogResult !== 'back-nav'))
            .subscribe(() => history.back());
    }

    close(): void {
        this.closeDialog();
        this.view.unselectItem();
    }

    private closeDialog(dialogResult?: any): void {
        this.dialogRef?.close(dialogResult);
        this.dialogRef = null;
    }
}
