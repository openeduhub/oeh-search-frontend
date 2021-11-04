import { Injectable } from '@angular/core';

export type SkipTarget = 'MAIN_CONTENT';

@Injectable({
    providedIn: 'root',
})
export class SkipNavService {
    private elements: { [target in SkipTarget]?: HTMLElement } = {};

    constructor() {}

    register(target: SkipTarget, element: HTMLElement): void {
        if (this.elements[target]) {
            throw new Error(`Tried to register skip target ${target}, but was already registered.`);
        }
        if (!element.hasAttribute('tabindex')) {
            element.addEventListener('blur', (event) =>
                (event.target as HTMLElement).removeAttribute('tabindex'),
            );
        }
        this.elements[target] = element;
    }

    unregister(target: SkipTarget): void {
        this.elements[target] = null;
    }

    skipTo(target: SkipTarget): void {
        const element = this.elements[target];
        if (element) {
            if (!element.hasAttribute('tabindex')) {
                element.setAttribute('tabindex', '-1');
            }
            element.focus();
        }
    }
}
