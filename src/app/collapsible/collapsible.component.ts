import { AfterViewInit, Component, ElementRef, Renderer2, ViewChild } from '@angular/core';

function timeout(ms?: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

@Component({
    selector: 'app-collapsible',
    templateUrl: './collapsible.component.html',
    styleUrls: ['./collapsible.component.scss'],
    exportAs: 'appCollapsible',
})
export class CollapsibleComponent implements AfterViewInit {
    readonly ANIMATION_DURATION = 200; // ms
    isExpanded = true;

    private content: HTMLElement;

    constructor(private element: ElementRef, private renderer: Renderer2) {}

    ngAfterViewInit() {
        this.content = this.element.nativeElement.firstChild;
        this.renderer.setStyle(
            this.element.nativeElement,
            'transition-duration',
            this.ANIMATION_DURATION / 1000 + 's',
        );
    }

    toggle() {
        if (this.isExpanded) {
            this.collapse();
        } else {
            this.expand();
        }
    }

    async expand() {
        this.isExpanded = true;
        const contentHeight = this.content.offsetHeight;
        this.renderer.setStyle(this.element.nativeElement, 'height', contentHeight + 'px');
        await timeout(this.ANIMATION_DURATION);
        this.renderer.removeStyle(this.element.nativeElement, 'overflow');
        this.renderer.removeStyle(this.element.nativeElement, 'height');
    }

    async collapse() {
        this.isExpanded = false;
        const contentHeight = this.content.offsetHeight;
        this.renderer.setStyle(this.element.nativeElement, 'height', contentHeight + 'px');
        await timeout();
        this.renderer.setStyle(this.element.nativeElement, 'overflow', 'hidden');
        this.renderer.setStyle(this.element.nativeElement, 'height', 0);
    }
}
