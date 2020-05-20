import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { MarkAsRecommendedGQL, SetDisplayStateGQL } from '../generated/graphql';

@Injectable({
    providedIn: 'root',
})
export class EditorService {
    constructor(
        httpLink: HttpLink,
        apollo: Apollo,
        private markAsRecommendedGQL: MarkAsRecommendedGQL,
        private setDisplayStateGQL: SetDisplayStateGQL,
    ) {
        apollo.createNamed('editor', {
            cache: new InMemoryCache(),
            link: httpLink.create({
                uri: environment.editorBackendUrl + '/graphql',
            }),
        });
        this.markAsRecommendedGQL.client = 'editor';
        this.setDisplayStateGQL.client = 'editor';
    }

    markAsRecommended(id: string, value: boolean) {
        return this.markAsRecommendedGQL
            .mutate({ id, value })
            .pipe(
                catchError((error) => {
                    console.error(`Failed to mark as recommended: ${error}`);
                    return throwError(error);
                }),
            )
            .toPromise();
    }

    setDisplayState(id: string, value: boolean) {
        return this.setDisplayStateGQL
            .mutate({ id, value })
            .pipe(
                catchError((error) => {
                    console.error(`Failed to set display state: ${error}`);
                    return throwError(error);
                }),
            )
            .toPromise();
    }
}
