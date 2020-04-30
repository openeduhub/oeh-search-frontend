import { Component, OnInit } from '@angular/core';
import { DidYouMeanSuggestionFragment } from 'src/generated/graphql';
import { Facets, SearchService } from '../search.service';

@Component({
    selector: 'app-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit {
    facets: Facets;
    didYouMeanSuggestion: DidYouMeanSuggestionFragment;

    constructor(private search: SearchService) {}

    ngOnInit(): void {
        this.search
            .getDidYouMeanSuggestion()
            .subscribe(
                (didYouMeanSuggestion) => (this.didYouMeanSuggestion = didYouMeanSuggestion),
            );
    }
}
