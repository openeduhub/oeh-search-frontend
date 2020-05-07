import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import {
    MatAutocompleteSelectedEvent,
    MatAutocompleteTrigger,
} from '@angular/material/autocomplete';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { Filters, SearchService } from '../search.service';
import { parseSearchQueryParams } from '../utils';

@Component({
    selector: 'app-search-field',
    templateUrl: './search-field.component.html',
    styleUrls: ['./search-field.component.scss'],
})
export class SearchFieldComponent implements OnInit {
    @ViewChild('autoComplete') autoComplete: MatAutocompleteTrigger;
    @ViewChild('searchFieldInput') searchFieldInput: ElementRef<HTMLInputElement>;
    searchField = new FormControl();
    autoCompleteSuggestions$: Observable<string[]>;
    private searchString: string;
    private filters: Filters;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private search: SearchService,
    ) {}

    ngOnInit(): void {
        this.route.queryParamMap.subscribe((queryParamMap) => {
            const { searchString, filters } = parseSearchQueryParams(queryParamMap);
            this.searchString = searchString;
            this.searchField.setValue(this.searchString, { emitEvent: false });
            this.filters = filters;
        });
        this.searchField.valueChanges
            .pipe(
                tap((searchString) => {
                    this.searchString = searchString;
                }),
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

    clear() {
        this.searchField.setValue('');
        this.searchFieldInput.nativeElement.focus();
        this.onSubmit();
    }

    private onSearchStringChanges(searchString: string) {
        if (typeof searchString === 'string') {
            this.autoCompleteSuggestions$ = this.search.autoComplete(searchString, this.filters);
        }
    }
}
