import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { EduSharingService, ResultNode } from '../edu-sharing/edu-sharing.service';

@Injectable({
    providedIn: 'root',
})
export class DetailsPageResolverService implements Resolve<ResultNode> {
    constructor(private eduSharing: EduSharingService) {}

    resolve(route: ActivatedRouteSnapshot): Observable<ResultNode> {
        const id = route.paramMap.get('id');
        return this.eduSharing.getNode(id);
    }
}
