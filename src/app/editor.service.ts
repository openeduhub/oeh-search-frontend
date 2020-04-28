import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { environment } from 'src/environments/environment';
import { MarkAsRecommendedGQL } from 'src/generated/graphql';

@Injectable({
    providedIn: 'root',
})
export class EditorService {
    constructor(
        httpLink: HttpLink,
        apollo: Apollo,
        private markAsRecommendedGQL: MarkAsRecommendedGQL,
    ) {
        apollo.createNamed('editor', {
            cache: new InMemoryCache(),
            link: httpLink.create({
                uri: environment.editorBackendUrl,
            }),
        });
        this.markAsRecommendedGQL.client = 'editor';
    }

    markAsRecommended(id: string, marked: boolean) {
        this.markAsRecommendedGQL.mutate({ id, marked }).subscribe({
            error: (error) => {
                throw new Error(`Failed to mark as recommended: ${error}`);
            },
        });
    }
}
