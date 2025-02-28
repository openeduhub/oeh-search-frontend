import { ChangeDetectorRef, Pipe, PipeTransform } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';
import { EduSharingService, Facet } from '../core/edu-sharing.service';
import { facetProperties } from '../core/facet-properties';

@Pipe({
    name: 'displayName',
    pure: false,
})
export class DisplayNamePipe implements PipeTransform {
    // Since `valueMapping.getDisplayName` returns an Observable, we basically do what Angular's own
    // `async` pipe does to resolve it, but a lot simpler since we handle only an Observable that
    // emits once.

    private displayName: string;
    private readonly inputSubject = new BehaviorSubject<{ facet: Facet; value: string }>(null);

    constructor(private ref: ChangeDetectorRef, private eduSharing: EduSharingService) {
        this.registerInputSubject();
    }

    transform(value: string, facet: Facet): string {
        if (this.inputSubject.value?.value !== value || this.inputSubject.value?.facet !== facet) {
            this.inputSubject.next({ value, facet });
        }
        return this.displayName;
    }

    private registerInputSubject(): void {
        this.inputSubject
            .pipe(
                filter((input) => input !== null),
                switchMap(({ facet, value }) =>
                    this.eduSharing.getDisplayName(facetProperties[facet], value),
                ),
            )
            .subscribe((displayName) => {
                this.displayName = displayName.label;
                this.ref.markForCheck();
            });
    }
}
