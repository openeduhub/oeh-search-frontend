import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { parseSearchQueryParams } from '../search-parameters.service';
import { SearchData, SubjectsPortalResults } from '../search-resolver.service';

@Component({
    selector: 'app-subjects-portal',
    templateUrl: './subjects-portal.component.html',
    styleUrls: ['./subjects-portal.component.scss'],
})
export class SubjectsPortalComponent implements OnInit {
    results: SubjectsPortalResults;
    isExpanded: boolean;

    constructor(private route: ActivatedRoute) {}

    ngOnInit(): void {
        this.route.data.subscribe((data: { searchData: SearchData }) => {
            this.results = data.searchData.subjectsPortalResults;
        });
        this.route.queryParamMap.subscribe((queryParamMap) => {
            const { pageIndex } = parseSearchQueryParams(queryParamMap);
            if (pageIndex === 0) {
                this.isExpanded = true;
            } else {
                this.isExpanded = false;
            }
        });
    }
}
