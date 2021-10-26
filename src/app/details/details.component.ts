import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { BehaviorSubject, Observable, ReplaySubject } from 'rxjs';
import { filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { PageModeService } from '../page-mode.service';
import { ReportProblemService } from '../report-problem/report-problem.service';
import { Entry, SearchService } from '../search.service';
import { Hit } from '../view.service';
import { WrappedResponse } from '../wrap-observable.pipe';

@Component({
    selector: 'app-details',
    templateUrl: './details.component.html',
    styleUrls: ['./details.component.scss'],
})
export class DetailsComponent implements OnDestroy {
    private hit$ = new BehaviorSubject<Hit>(null);
    @Input()
    public get hit(): Hit {
        return this.hit$.value;
    }
    public set hit(value: Hit) {
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
    author$ = this.hit$.pipe(map((entry) => this.getAuthor(entry)));
    fullEntry$ = new BehaviorSubject<Entry | null>(null);
    showEmbedButton$ = this.pageMode.getPageConfig('showEmbedButton');
    reportProblemResult$: Observable<WrappedResponse<void>>;

    private destroyed$ = new ReplaySubject<void>(1);

    constructor(
        private search: SearchService,
        private pageMode: PageModeService,
        private reportProblemService: ReportProblemService,
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
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    embed(): void {
        window.parent.postMessage({ type: 'embed', data: { id: this.hit.id }, scope: 'OEH' }, '*');
    }

    reportProblem(): void {
        this.reportProblemResult$ = this.reportProblemService.openDialog(this.hit);
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
