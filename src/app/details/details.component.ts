import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { BehaviorSubject, ReplaySubject } from 'rxjs';
import { ResultNode } from '../edu-sharing/edu-sharing.service';
import { PageModeService } from '../page-mode.service';

@Component({
    selector: 'app-details',
    templateUrl: './details.component.html',
    styleUrls: ['./details.component.scss'],
})
export class DetailsComponent implements OnDestroy {
    private hit$ = new BehaviorSubject<ResultNode>(null);
    @Input()
    public get hit(): ResultNode {
        return this.hit$.value;
    }
    public set hit(value: ResultNode) {
        this.hit$.next(value);
    }
    @Input() mode: 'dialog' | 'sidebar' | 'page';
    @Output() closeButtonClicked = new EventEmitter<void>();

    readonly slickConfig = {
        dots: false,
        infinite: false,
        slidesToShow: 2,
        slidesToScroll: 2,
        prevArrow: '.app-preview-slick-prev',
        nextArrow: '.app-preview-slick-next',
    };
    descriptionExpanded = false;
    // fullEntry$ = new BehaviorSubject<Entry | null>(null);
    showEmbedButton$ = this.pageMode.getPageConfig('showEmbedButton');

    private destroyed$ = new ReplaySubject<void>(1);

    constructor(private pageMode: PageModeService) {
        this.hit$.subscribe(() => this.reset());
        // this.hit$
        //     .pipe(
        //         takeUntil(this.destroyed$),
        //         tap(() => this.fullEntry$.next(null)),
        //         filter((hit) => !!hit),
        //         switchMap((hit) => this.search.getEntry(hit.id)),
        //     )
        //     .subscribe((entry) => this.fullEntry$.next(entry));
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    embed(): void {
        window.parent.postMessage(
            { type: 'embed', data: { id: this.hit.ref.id }, scope: 'OEH' },
            '*',
        );
    }

    private reset(): void {
        this.descriptionExpanded = false;
    }
}
