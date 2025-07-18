import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Node } from 'ngx-edu-sharing-api';
import { BehaviorSubject, Observable, ReplaySubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConfigService } from '../../../core/config.service';
import { PageModeService } from '../../../core/page-mode.service';
import { reportProblemItemKey } from '../../../template/shared/custom-definitions';
import { getCollectionProperty } from '../collection-property.pipe';
import {
    ReportProblemService,
    ResultData,
    problemKinds,
} from '../report-problem/report-problem.service';
import { WrappedResponse } from '../wrap-observable.pipe';

@Component({
    selector: 'app-details',
    templateUrl: './details.component.html',
    styleUrls: ['./details.component.scss'],
    standalone: false,
})
export class DetailsComponent implements OnDestroy {
    readonly routerPath = this.config.get().routerPath;
    private readonly hit$ = new BehaviorSubject<Node>(null);
    @Input()
    public get hit(): Node {
        return this.hit$.value;
    }
    public set hit(value: Node) {
        this.hit$.next(value);
    }
    @Input() mode: 'dialog' | 'sidebar' | 'page';
    @Output() closeButtonClicked = new EventEmitter<void>();

    readonly usedInCollections$ = this.hit$.pipe(
        map((hit) =>
            hit.usedInCollections?.filter(
                (collection) =>
                    getCollectionProperty(collection, 'url') &&
                    getCollectionProperty(collection, 'editorialState') === 'activated',
            ),
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
    emptyLanguageValues: string[] = ['', 'null', null];
    showEmbedButton$ = this.pageMode.getPageConfig('showEmbedButton');
    reportProblemResult$: Observable<WrappedResponse<void>>;

    private destroyed$ = new ReplaySubject<void>(1);

    constructor(
        private config: ConfigService,
        private pageMode: PageModeService,
        private reportProblemService: ReportProblemService,
        private translate: TranslateService,
    ) {
        this.hit$.subscribe(() => this.reset());
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

    contactSupport(): void {
        let mailText: string =
            'mailto:WLO Support<portal@jointly.info>?subject=' +
            this.translate.instant('TOPIC_PAGE.PREVIEW_PANEL.REPORT_PROBLEM.LABEL');
        // TODO: there might be better options than using localStorage
        const latestReportData: { element: Node; data: ResultData } = localStorage.getItem(
            reportProblemItemKey,
        )
            ? JSON.parse(localStorage.getItem(reportProblemItemKey))
            : {};

        if (latestReportData.element && latestReportData.data) {
            const element: Node = latestReportData.element;
            const resultData: ResultData = latestReportData.data;
            // https://stackoverflow.com/a/22765878
            const br: string = '%0D%0A';
            const reason: string = this.translate.instant(
                'TOPIC_PAGE.PREVIEW_PANEL.REPORT_PROBLEM.' + problemKinds[resultData.problemKind],
            );
            mailText +=
                '&body=' +
                this.translate.instant('TOPIC_PAGE.PREVIEW_PANEL.REPORT_PROBLEM.EMAIL_BODY', {
                    br,
                    name: element.name,
                    id: element.ref.id,
                    reason,
                    message: resultData.message,
                });
        }

        window.location.href = mailText;
    }

    private reset(): void {
        this.descriptionExpanded = false;
        this.reportProblemResult$ = null;
    }
}
