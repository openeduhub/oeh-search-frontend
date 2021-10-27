import { Injectable } from '@angular/core';
import { SearchResults } from 'ngx-edu-sharing-api';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: null,
})
export class SearchResultsService {
    results = new BehaviorSubject<SearchResults>(null);
}
