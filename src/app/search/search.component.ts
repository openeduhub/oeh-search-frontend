import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { filter, first } from 'rxjs/operators';
import { DidYouMeanSuggestionFragment } from 'src/generated/graphql';
import { Facets, SearchService, Filters } from '../search.service';

@Component({
    selector: 'app-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit {
    facets: Facets;
    didYouMeanSuggestion: DidYouMeanSuggestionFragment;

    constructor(
        private route: ActivatedRoute,
        private formBuilder: FormBuilder,
        private router: Router,
        private search: SearchService,
    ) {}

    ngOnInit(): void {
        // Any user input that affects results is funneled through query params. On any such input,
        // we call `router.navigate`. The rest is handled by `onQueryParams`, both, when initially
        // loading and when updating the page.
        this.registerSearchObservers();
    }

    private registerSearchObservers() {
        this.search.getFacets().subscribe((facets) => this.setFacets(facets));
        this.search
            .getFacets()
            .pipe(
                filter((facets) => facets !== null),
                first(),
            )
            .subscribe((facets) => this.facets = facets);
        this.search
            .getDidYouMeanSuggestion()
            .subscribe(
                (didYouMeanSuggestion) => (this.didYouMeanSuggestion = didYouMeanSuggestion),
            );
    }

    private setFacets(facets: Facets) {
        if (!facets) {
            return;
        }
        if (!this.facets) {
            this.facets = {} as Facets;
        }
        for (const [label, facet] of Object.entries(facets)) {
            // Leave the facet object in place if it already exists, so Angular won't reconstruct
            // the whole thing and the select dialog won't close every time the user selects an
            // option.
            if (this.facets[label]) {
                this.facets[label].buckets = facet.buckets;
            } else {
                this.facets[label] = facet;
            }
        }
    }
}
