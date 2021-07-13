import { Component, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { BehaviorSubject, combineLatest, ReplaySubject } from 'rxjs';
import { distinctUntilChanged, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { Entry, SearchService } from '../search.service';
import { Hit, ViewService } from '../view.service';

@Component({
    selector: 'app-preview-panel',
    templateUrl: './preview-panel.component.html',
    styleUrls: ['./preview-panel.component.scss'],
})
export class PreviewPanelComponent implements OnDestroy {
    @ViewChild('content') contentRef: TemplateRef<PreviewPanelComponent>;
    hit$ = this.view.getSelectedItem().pipe(filter((item) => !!item));
    mode$ = this.view.previewPanelMode$;
    showSidebar$ = combineLatest([this.view.getSelectedItem(), this.mode$]).pipe(
        map(([selectedItem, mode]) => !!selectedItem && mode === 'sidebar'),
    );
    fullEntry$ = new BehaviorSubject<Entry | null>(null);
    author$ = this.hit$.pipe(map((entry) => this.getAuthor(entry)));
    descriptionExpanded = false;
    readonly slickConfig = {
        dots: false,
        infinite: false,
        slidesToShow: 2,
        slidesToScroll: 2,
        prevArrow: '.app-preview-slick-prev',
        nextArrow: '.app-preview-slick-next',
    };

    private dialogRef: MatDialogRef<PreviewPanelComponent>;
    private destroyed$ = new ReplaySubject<void>(1);

    constructor(
        private dialog: MatDialog,
        private search: SearchService,
        private view: ViewService,
    ) {
        this.hit$.pipe(takeUntil(this.destroyed$)).subscribe(() => this.reset());
        this.hit$
            .pipe(
                takeUntil(this.destroyed$),
                tap(() => this.fullEntry$.next(null)),
                filter((hit) => !!hit),
                switchMap((hit) => this.search.getEntry(hit.id)),
            )
            .subscribe((entry) => this.fullEntry$.next(entry));
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
        this.dialogRef = this.dialog.open(this.contentRef, {
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

    private reset(): void {
        this.descriptionExpanded = false;
    }

    private getAuthor(hit?: Hit): string {
        if (hit?.misc.author) {
            return hit.misc.author;
        } else {
            return hit?.lom.lifecycle.contribute
                ?.filter((contributor) => contributor.role === 'author')
                .map((author) => this.parseVcard(author.entity, 'FN'))
                .join(', ');
        }
    }

    private parseVcard(vcard: string, attribute: string): string {
        return vcard
            .split('\n')
            .find((line) => line.startsWith(attribute + ':'))
            ?.slice(attribute.length + 1)
            ?.trim();
    }
}
