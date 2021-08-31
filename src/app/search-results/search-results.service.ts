import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SearchResults } from '../edu-sharing/edu-sharing.service';

@Injectable({
    providedIn: 'root',
})
export class SearchResultsService {
    results = new BehaviorSubject<SearchResults>(null);
}
