import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import {
    MatAutocompleteSelectedEvent,
    MatAutocompleteTrigger,
} from '@angular/material/autocomplete';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { SearchService } from '../search.service';

@Component({
    selector: 'app-search-field',
    templateUrl: './search-field.component.html',
    styleUrls: ['./search-field.component.scss'],
})
export class SearchFieldComponent implements OnInit {
    @ViewChild('autoComplete') autoComplete: MatAutocompleteTrigger;
    searchField = new FormControl();
    autoCompleteSuggestions$: Observable<string[]>;
    private searchString: string;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private search: SearchService,
    ) {}

    ngOnInit(): void {
        this.route.queryParams.subscribe((params) => {
            this.searchString = params.q;
            this.searchField.setValue(this.searchString);
        });
        this.searchField.valueChanges
            .pipe(
                tap((searchString) => (this.searchString = searchString)),
                debounceTime(200),
                distinctUntilChanged(),
            )
            .subscribe((searchString) => this.onSearchStringChanges(searchString));
    }

    onSubmit() {
        this.autoComplete.closePanel();
        this.router.navigate(['/search'], {
            queryParams: {
                q: this.searchString,
                pageIndex: 0,
            },
            queryParamsHandling: 'merge',
        });
    }

    onAutocompleteSelected(event: MatAutocompleteSelectedEvent) {
        this.router.navigate([], {
            queryParams: { q: event.option.value, pageIndex: 0 },
            queryParamsHandling: 'merge',
        });
    }

    private onSearchStringChanges(searchString: string) {
        if (typeof searchString === 'string') {
            this.autoCompleteSuggestions$ = this.search.autoComplete(searchString);
        }
    }
}
