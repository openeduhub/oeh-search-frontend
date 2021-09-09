import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { EduSharingService, ResultNode } from '../../core/edu-sharing.service';
import { SearchModule } from '../search.module';

@Injectable({
    providedIn: SearchModule,
})
export class DetailsPageResolverService implements Resolve<ResultNode> {
    constructor(private eduSharing: EduSharingService) {}

    resolve(route: ActivatedRouteSnapshot): Observable<ResultNode> {
        const id = route.paramMap.get('id');
        return this.eduSharing.getNode(id);
    }
}
