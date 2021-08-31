import { ChangeDetectorRef, Pipe, PipeTransform } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';
import { Facet } from '../edu-sharing/edu-sharing.service';
import { facetProperties } from '../edu-sharing/facet-properties';
import { ValueMappingService } from '../edu-sharing/value-mapping.service';

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

    constructor(private ref: ChangeDetectorRef, private valueMapping: ValueMappingService) {
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
                    this.valueMapping.getDisplayName(facetProperties[facet], value),
                ),
            )
            .subscribe((displayName) => {
                this.displayName = displayName;
                this.ref.markForCheck();
            });
    }
}
