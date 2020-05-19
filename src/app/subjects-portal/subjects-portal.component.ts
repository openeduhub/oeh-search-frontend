import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SubjectPortalsQuery } from '../../generated/graphql';
import { ExtendedResult } from '../search-results/search-results.component';
import { SearchService } from '../search.service';

@Component({
    selector: 'app-subjects-portal',
    templateUrl: './subjects-portal.component.html',
    styleUrls: ['./subjects-portal.component.scss'],
})
export class SubjectsPortalComponent implements OnInit {
    discipline: string;
    results: SubjectPortalsQuery;

    constructor(private route: ActivatedRoute, private search: SearchService) {}

    ngOnInit(): void {
        this.route.data.subscribe((data: { results: SubjectPortalsQuery }) => {
            this.results = data.results;
            this.loadLargeThumbnails();
        });
        this.route.paramMap.subscribe((paramMap) => (this.discipline = paramMap.get('discipline')));
    }

    private loadLargeThumbnails() {
        [
            this.results.material as ExtendedResult,
            this.results.source as ExtendedResult,
            this.results.tool as ExtendedResult,
        ].forEach((results) => {
            results.hits.hits
                .filter((hit) => hit.thumbnail)
                .map((result) => {
                    this.search.getLargeThumbnail(result.id).subscribe((largeThumbnail) => {
                        result.thumbnail.large = largeThumbnail;
                    });
                });
        });
    }
}
