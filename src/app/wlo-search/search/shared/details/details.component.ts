import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { BehaviorSubject, Observable, ReplaySubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConfigService } from '../../../core/config.service';
import { ResultNode } from '../../../core/edu-sharing.service';
import { PageModeService } from '../../../core/page-mode.service';
import { getCollectionProperty } from '../collection-property.pipe';
import { ReportProblemService } from '../report-problem/report-problem.service';
import { WrappedResponse } from '../wrap-observable.pipe';

@Component({
    selector: 'app-details',
    templateUrl: './details.component.html',
    styleUrls: ['./details.component.scss'],
})
export class DetailsComponent implements OnDestroy {
    readonly routerPath = this.config.get().routerPath;
    private readonly hit$ = new BehaviorSubject<ResultNode>(null);
    @Input()
    public get hit(): ResultNode {
        return this.hit$.value;
    }
    public set hit(value: ResultNode) {
        this.hit$.next(value);
    }
    @Input() mode: 'dialog' | 'sidebar' | 'page';
    @Output() closeButtonClicked = new EventEmitter<void>();

    readonly usedInCollections$ = this.hit$.pipe(
        map((hit) =>
            hit.usedInCollections?.filter((collection) => getCollectionProperty(collection, 'url')),
        ),
        map((collections) => (collections?.length === 0 ? null : collections)),
    );

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
    reportProblemResult$: Observable<WrappedResponse<void>>;

    private destroyed$ = new ReplaySubject<void>(1);

    constructor(
        private config: ConfigService,
        private pageMode: PageModeService,
        private reportProblemService: ReportProblemService,
    ) {
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

    reportProblem(): void {
        this.reportProblemResult$ = this.reportProblemService.openDialog(this.hit);
    }

    private reset(): void {
        this.descriptionExpanded = false;
    }
}
