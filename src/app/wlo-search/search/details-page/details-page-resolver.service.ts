import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { EduSharingService } from '../../core/edu-sharing.service';
import { SearchModule } from '../search.module';
import { Node } from 'ngx-edu-sharing-api';

@Injectable({
    providedIn: SearchModule,
})
export class DetailsPageResolverService implements Resolve<Node> {
    constructor(private eduSharing: EduSharingService) {}

    resolve(route: ActivatedRouteSnapshot): Observable<Node> {
        const id = route.paramMap.get('id');
        return this.eduSharing.getNode(id);
    }
}
