import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { ValueV2 } from '../../api/models';
import { MdsV1Service } from '../../api/services';
import { EduSharingService } from './edu-sharing.service';

@Injectable({
    providedIn: 'root',
})
export class ValueMappingService {
    private readonly mds$ = this.mdsV1
        .getMetadataSetV2({
            repository: EduSharingService.repository,
            metadataset: EduSharingService.metadataSet,
        })
        .pipe(shareReplay());

    constructor(private mdsV1: MdsV1Service) {
        this.mds$.subscribe();
    }

    getDisplayName(property: string, key: string): Observable<string> {
        return this.getValues(property).pipe(
            map((values) => values?.find((value) => value.id === key)?.caption ?? key),
        );
    }

    private getValues(property: string): Observable<ValueV2[]> {
        return this.mds$.pipe(
            map((mds) => mds.widgets.find((widget) => widget.id === property).values),
        );
    }
}
