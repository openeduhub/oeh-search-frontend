import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ResultFragment } from 'src/generated/graphql';

@Injectable({
    providedIn: 'root',
})
export class SearchResultsService {
    results = new BehaviorSubject<ResultFragment>(null);
}
