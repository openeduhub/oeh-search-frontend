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

    @ViewChild('wrapper') private wrapper: ElementRef;
    private content: HTMLElement;

    constructor(private renderer: Renderer2) {}

    ngAfterViewInit() {
        this.content = this.wrapper.nativeElement.firstChild;
        this.renderer.setStyle(
            this.wrapper.nativeElement,
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
        const contentHeight = this.content.offsetHeight;
        this.renderer.setStyle(this.wrapper.nativeElement, 'height', contentHeight + 'px');
        await timeout(this.ANIMATION_DURATION);
        this.renderer.removeStyle(this.wrapper.nativeElement, 'overflow');
        this.renderer.removeStyle(this.wrapper.nativeElement, 'height');
        this.isExpanded = true;
    }

    async collapse() {
        const contentHeight = this.content.offsetHeight;
        this.renderer.setStyle(this.wrapper.nativeElement, 'height', contentHeight + 'px');
        await timeout();
        this.renderer.setStyle(this.wrapper.nativeElement, 'overflow', 'hidden');
        this.renderer.setStyle(this.wrapper.nativeElement, 'height', 0);
        this.isExpanded = false;
    }
}
