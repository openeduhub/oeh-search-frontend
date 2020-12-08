import { animate, state, style, transition, trigger } from '@angular/animations';
import {
    AfterViewInit,
    Component,
    ElementRef,
    HostListener,
    OnDestroy,
    ViewChild,
} from '@angular/core';
import { environment } from '../../environments/environment';

type OverflowInfo = {
    top: boolean;
    bottom: boolean;
    left: boolean;
    right: boolean;
};

/**
 * A floating action button that triggers a small menu to add new content.
 *
 * **IMPORTANT:** The button must be placed in the DOM as **direct and last child** of the container
 *                it should be floating over.
 *
 * The button is hidden if it would cover anything it shouldn't, such as the headerbar (might happen
 * on mobile with expanded keyboard) or the footer, where it cannot be scrolled out of the way. What
 * it *should* be floating over is defined by its placement in the DOM (see above).
 *
 * If there is not enough room for the button to be scrolled into view, it will be rendered
 * statically instead.
 */
@Component({
    selector: 'app-add-content-fab',
    templateUrl: './add-content-fab.component.html',
    styleUrls: ['./add-content-fab.component.scss'],
    animations: [
        trigger('fadeInOut', [
            state(
                'hide',
                style({
                    transform: 'scale(0)',
                }),
            ),
            state(
                'show',
                style({
                    transform: 'scale(1)',
                }),
            ),
            transition('void => *', []), // Avoid short popping up after page load.
            transition('* => *', [animate('0.15s')]),
        ]),
    ],
})
export class AddContentFabComponent implements AfterViewInit, OnDestroy {
    @ViewChild('container', { read: ElementRef }) containerRef: ElementRef<HTMLElement>;

    readonly wordpressUrl = environment.wordpressUrl;
    shouldFloat = true;
    shouldHide = true;

    private observer: MutationObserver;

    constructor(private hostRef: ElementRef<HTMLElement>) {}

    private static getOverflowInfo(outer: DOMRect, inner: DOMRect): OverflowInfo {
        return {
            top: outer.top > inner.top,
            bottom: outer.bottom < inner.bottom,
            left: outer.left > inner.left,
            right: outer.right < inner.right,
        };
    }

    @HostListener('window:scroll') onScroll() {
        this.updateShouldHide();
    }

    @HostListener('window:resize') onResize() {
        this.updateShouldFloat();
        this.updateShouldHide();
    }

    ngAfterViewInit(): void {
        this.registerParentObserver();
    }

    ngOnDestroy(): void {
        this.observer.disconnect();
    }

    updateShouldHide(): void {
        if (this.shouldFloat) {
            if (this.getFloatingPosition() === 'inside') {
                this.shouldHide = false;
            } else {
                this.shouldHide = true;
            }
        } else {
            this.shouldHide = false;
        }
    }

    private registerParentObserver(): void {
        const callback = () => {
            this.updateShouldFloat();
            this.updateShouldHide();
        };
        this.observer = new MutationObserver(callback);
        const config = { attributes: false, childList: true, subtree: true };
        this.observer.observe(this.hostRef.nativeElement.parentElement, config);
    }

    /**
     * Determines whether the button should be floating or static.
     */
    private updateShouldFloat(): void {
        const windowHeight = window.innerHeight;
        const buttonYPosition =
            window.pageYOffset + this.hostRef.nativeElement.getBoundingClientRect().top;
        this.shouldFloat = buttonYPosition > windowHeight;
    }

    /**
     * Gets the button's floating position relative to it's parent container.
     */
    private getFloatingPosition(): 'above' | 'inside' | 'below' {
        const overflowInfo = AddContentFabComponent.getOverflowInfo(
            this.hostRef.nativeElement.parentElement.getBoundingClientRect(),
            this.containerRef.nativeElement.getBoundingClientRect(),
        );
        if (overflowInfo.top) {
            return 'above';
        } else if (overflowInfo.bottom) {
            return 'below';
        } else {
            return 'inside';
        }
    }
}
