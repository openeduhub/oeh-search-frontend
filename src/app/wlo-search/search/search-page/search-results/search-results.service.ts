import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SearchResults } from '../../../core/edu-sharing.service';
import { SearchModule } from '../../search.module';

@Injectable({
    providedIn: null,
})
export class SearchResultsService {
    results = new BehaviorSubject<SearchResults>(null);
}
