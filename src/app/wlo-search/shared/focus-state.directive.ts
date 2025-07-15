import { Directive, HostListener } from '@angular/core';

@Directive({
    selector: '[appFocusState]',
    exportAs: 'appFocusState',
    standalone: false,
})
export class FocusStateDirective {
    /** Either the element or one of its descendants has focus. */
    hasFocus = false;
    /** The element is being hovered with the cursor. */
    hovering = false;

    constructor() {}

    @HostListener('focusin')
    onFocusIn() {
        this.hasFocus = true;
    }

    @HostListener('focusout')
    onFocusOut() {
        this.hasFocus = false;
    }

    @HostListener('mouseenter')
    onMouseOver() {
        this.hovering = true;
    }

    @HostListener('mouseleave')
    onMouseOut() {
        this.hovering = false;
    }
}
