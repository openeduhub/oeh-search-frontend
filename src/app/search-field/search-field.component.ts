import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import {
    MatAutocompleteSelectedEvent,
    MatAutocompleteTrigger,
} from '@angular/material/autocomplete';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { SearchService } from '../search.service';
import { Filters } from 'src/generated/graphql';

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
    inputHasChanged = false;
    private searchString: string;
    private filters: Filters;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private search: SearchService,
    ) {}

    ngOnInit(): void {
        this.route.queryParams.subscribe((params) => {
            this.searchString = params.q;
            this.searchField.setValue(this.searchString, { emitEvent: false });
            this.inputHasChanged = false;
            if (params.filters) {
                this.filters = JSON.parse(params.filters);
            }
        });
        this.searchField.valueChanges
            .pipe(
                tap((searchString) => {
                    this.searchString = searchString;
                    this.inputHasChanged = true;
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
    }

    private onSearchStringChanges(searchString: string) {
        if (typeof searchString === 'string') {
            this.autoCompleteSuggestions$ = this.search.autoComplete(searchString, this.filters);
        }
    }
}
