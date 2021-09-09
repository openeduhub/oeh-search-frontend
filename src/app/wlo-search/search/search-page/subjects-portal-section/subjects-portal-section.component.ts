import {
    AfterViewInit,
    Attribute,
    Component,
    ElementRef,
    HostListener,
    Input,
    OnDestroy,
    ViewChild,
} from '@angular/core';
import { SlickCarouselComponent } from 'ngx-slick-carousel';
import { ReplaySubject } from 'rxjs';
import { delay, distinctUntilChanged, map, takeUntil } from 'rxjs/operators';
import { ConfigService } from '../../../core/config.service';
import { Filters, ResultNode } from '../../../core/edu-sharing.service';
import { ViewService } from '../../../core/view.service';

@Component({
    selector: 'app-subjects-portal-section',
    templateUrl: './subjects-portal-section.component.html',
    styleUrls: ['./subjects-portal-section.component.scss'],
})
export class SubjectsPortalSectionComponent implements OnDestroy, AfterViewInit {
    readonly routerPath = this.config.get().routerPath;
    readonly slickConfig = {
        dots: true,
        infinite: false,
        slidesToShow: 4,
        slidesToScroll: 4,
    };

    @Input() hits: ResultNode[];
    @Input() filters: Filters;

    @ViewChild(SlickCarouselComponent) slickCarousel: SlickCarouselComponent;

    private destroyed$ = new ReplaySubject<void>(1);
    private slickConfigUpdateTrigger = new ReplaySubject<void>(1);

    constructor(
        @Attribute('type') readonly type: string,
        private config: ConfigService,
        private elementRef: ElementRef<HTMLElement>,
        view: ViewService,
    ) {
        view.panelsChange()
            .pipe(takeUntil(this.destroyed$))
            .subscribe(() => this.slickConfigUpdateTrigger.next());
    }

    @HostListener('window:resize')
    onWindowResize() {
        this.slickConfigUpdateTrigger.next();
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    ngAfterViewInit(): void {
        this.slickConfigUpdateTrigger.next();
        this.slickConfigUpdateTrigger
            .pipe(
                // Wait for UI update after panels change.
                delay(0),
                map(() => this.elementRef.nativeElement.offsetWidth),
                distinctUntilChanged(),
                map((offsetWidth) => this.getSlidesToShow(offsetWidth)),
            )
            .subscribe((slidesToShow) => this.updateSlickOptions(slidesToShow));
    }

    private getSlidesToShow(elementWidth: number) {
        if (elementWidth >= 1210) {
            return 4;
        } else if (elementWidth >= 901) {
            return 3;
        } else if (elementWidth >= 590) {
            return 2;
        } else {
            return 1;
        }
    }

    private updateSlickOptions(slidesToShow: number): void {
        this.slickCarousel.$instance?.slick(
            'slickSetOption',
            'slidesToScroll',
            slidesToShow,
            false,
        );
        this.slickCarousel.$instance?.slick('slickSetOption', 'slidesToShow', slidesToShow, true);
    }
}
