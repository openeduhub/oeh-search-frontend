import { Directive, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { SkipNavService, SkipTarget } from './skip-nav.service';
/**
 * Adds the element to the skip navigation.
 *
 * Only one element can be registered for any given `target`.
 */
@Directive({
    selector: '[appSkipTarget]',
})
export class SkipTargetDirective implements OnInit, OnDestroy {
    // Use an alias for a property input that is equal to the component selector.
    // tslint:disable-next-line:no-input-rename
    @Input('appSkipTarget') target: SkipTarget;

    constructor(private elementRef: ElementRef<HTMLElement>, private skipNav: SkipNavService) {}

    ngOnInit(): void {
        this.skipNav.register(this.target, this.elementRef.nativeElement);
    }

    ngOnDestroy(): void {
        this.skipNav.unregister(this.target);
    }
}
