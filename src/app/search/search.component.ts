import { Component, OnInit, OnDestroy } from '@angular/core';
import { DidYouMeanSuggestionFragment } from 'src/generated/graphql';
import { Facets, SearchService } from '../search.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit, OnDestroy {
    facets: Facets;
    didYouMeanSuggestion: DidYouMeanSuggestionFragment;
    showFilterBar = false;

    private subscriptions: Subscription[] = [];

    constructor(private search: SearchService, private route: ActivatedRoute) {}

    ngOnInit(): void {
        this.subscriptions.push(
            this.search
                .getDidYouMeanSuggestion()
                .subscribe(
                    (didYouMeanSuggestion) => (this.didYouMeanSuggestion = didYouMeanSuggestion),
                ),
        );
        this.subscriptions.push(
            this.route.queryParams.subscribe((params) => {
                this.showFilterBar = params.filter === 'true';
            }),
        );
    }

    ngOnDestroy(): void {
        for (const subscription of this.subscriptions) {
            subscription.unsubscribe();
        }
    }
}
