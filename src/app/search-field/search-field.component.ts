import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import {
    MatAutocompleteSelectedEvent,
    MatAutocompleteTrigger,
} from '@angular/material/autocomplete';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { SearchParametersService } from '../search-parameters.service';
import { SearchService } from '../search.service';

@Component({
    selector: 'app-search-field',
    templateUrl: './search-field.component.html',
    styleUrls: ['./search-field.component.scss'],
})
export class SearchFieldComponent implements OnInit, OnDestroy {
    @ViewChild('autoComplete') autoComplete: MatAutocompleteTrigger;
    @ViewChild('searchFieldInput') searchFieldInput: ElementRef<HTMLInputElement>;
    searchField = new FormControl();
    autoCompleteSuggestions$: Observable<string[]>;
    private searchString: string;
    private subscriptions: Subscription[] = [];

    constructor(
        private router: Router,
        private search: SearchService,
        private searchParameters: SearchParametersService,
    ) {}

    ngOnInit(): void {
        this.subscriptions.push(
            this.searchParameters.get().subscribe((searchParameters) => {
                const { searchString } = searchParameters || {};
                this.searchString = searchString;
                this.searchField.setValue(this.searchString, { emitEvent: false });
            }),
        );
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

    ngOnDestroy(): void {
        for (const subscription of this.subscriptions) {
            subscription.unsubscribe();
        }
    }

    onSubmit() {
        this.autoComplete.closePanel();
        this.router.navigate(this.router.url.startsWith('/search') ? [] : ['/search'], {
            queryParams: {
                q: this.searchString,
                pageIndex: 0,
            },
            queryParamsHandling: 'merge',
        });
    }

    onAutocompleteSelected(event: MatAutocompleteSelectedEvent) {
        this.router.navigate(this.router.url.startsWith('/search') ? [] : ['/search'], {
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
            this.autoCompleteSuggestions$ = this.search.autoComplete(searchString);
        }
    }
}
