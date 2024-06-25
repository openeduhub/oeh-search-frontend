import { ViewportScroller } from '@angular/common';
import { Component, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NavigationStart, Router } from '@angular/router';
import { combineLatest, ReplaySubject } from 'rxjs';
import { distinctUntilChanged, filter, map, take, takeUntil } from 'rxjs/operators';
import { ViewService } from '../../../core/view.service';
import { DetailsComponent } from '../../shared/details/details.component';

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

    constructor(
        private dialog: MatDialog,
        private view: ViewService,
        private router: Router,
        private viewportScroller: ViewportScroller,
    ) {
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
            // closeOnNavigation: false,
        });
        // this.registerCloseOnBackNav();
        this.registerCloseOnNavigation();
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
     * Close the dialog on navigation via the angular router.
     *
     * This is different to the option `closeOnNavigation` of `MatDialogConfig` as the latter only
     * affects forward/backwards navigation in history.
     */
    private registerCloseOnNavigation(): void {
        this.router.events
            .pipe(
                takeUntil(this.dialogRef.beforeClosed()),
                filter((e): e is NavigationStart => e instanceof NavigationStart),
                take(1),
            )
            .subscribe(() => {
                // The router fails to reset the scroll position here, since the dialog still blocks
                // scrolling.
                this.dialogRef
                    .afterClosed()
                    .subscribe(() => this.viewportScroller.scrollToPosition([0, 0]));
                this.closeDialog();
            });
    }

    /**
     * On back navigation while the dialog is open, close the dialog instead of navigating back.
     */
    // We cannot use this when there is a possibility, that the user navigates to a new location
    // (within the app) while the dialog is open. We have no way of removing our dummy state in this
    // situation before the new location is pushed to the history stack. Ideally, we would represent
    // an open dialog with a query parameter, but then we would have to handle implicit navigation
    // when the window is resized and the preview switches from overlay to sidebar.
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
