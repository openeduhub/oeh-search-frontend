import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { DetailsPageComponent } from './details-page/details-page.component';
import { BadgesComponent } from './search-page/badges/badges.component';
import { MultivalueCheckboxComponent } from './search-page/multivalue-checkbox/multivalue-checkbox.component';
import { PaginatorComponent } from './search-page/paginator/paginator.component';
import { PreviewPanelComponent } from './search-page/preview-panel/preview-panel.component';
import { ResultCardContentCompactComponent } from './search-page/result-card-content-compact/result-card-content-compact.component';
import { ResultCardContentStandardComponent } from './search-page/result-card-content-standard/result-card-content-standard.component';
import { ResultCardComponent } from './search-page/result-card/result-card.component';
import { SearchFilterbarComponent } from './search-page/search-filterbar/search-filterbar.component';
import { SearchPageResolverService } from './search-page/search-page-resolver.service';
import { SearchPageComponent } from './search-page/search-page.component';
import { SearchResultsComponent } from './search-page/search-results/search-results.component';
import { SearchResultsService } from './search-page/search-results/search-results.service';
import { SubjectsPortalSectionComponent } from './search-page/subjects-portal-section/subjects-portal-section.component';
import { SubjectsPortalResolverService } from './search-page/subjects-portal/subjects-portal-resolver.service';
import { SubjectsPortalComponent } from './search-page/subjects-portal/subjects-portal.component';
import { CapitalizeFirstLetterPipe } from './shared/capitalize-first-letter.pipe';
import { CollectionCardComponent } from './shared/collection-card/collection-card.component';
import { CollectionPropertyPipe } from './shared/collection-property.pipe';
import { DetailsComponent } from './shared/details/details.component';
import { DurationPipe } from './shared/duration.pipe';
import { GenerateFiltersPipe } from './shared/generate-filters.pipe';
import { InCollectionWithTypePipe } from './shared/in-collection-with-type.pipe';
import { IsOerPipe } from './shared/is-oer.pipe';
import { NodePropertyPipe } from './shared/nodeProperty.pipe';
import { PreviewImageInnerComponent } from './shared/preview-image/preview-image-inner.component';
import { ReportProblemComponent } from './shared/report-problem/report-problem.component';
import { ReportProblemService } from './shared/report-problem/report-problem.service';
import { TrimPipe } from './shared/trim.pipe';
import { TruncatePipe } from './shared/truncate.pipe';
import { WrapObservablePipe } from './shared/wrap-observable.pipe';
import { PreviewImageComponent } from './shared/preview-image/preview-image.component';

@NgModule({
    declarations: [
        DetailsPageComponent,
        SearchPageComponent,
        BadgesComponent,
        MultivalueCheckboxComponent,
        PaginatorComponent,
        PreviewPanelComponent,
        ResultCardComponent,
        ResultCardContentCompactComponent,
        ResultCardContentStandardComponent,
        SearchFilterbarComponent,
        SearchResultsComponent,
        SubjectsPortalComponent,
        SubjectsPortalSectionComponent,
        CollectionCardComponent,
        DetailsComponent,
        PreviewImageInnerComponent,
        CapitalizeFirstLetterPipe,
        CollectionPropertyPipe,
        DurationPipe,
        GenerateFiltersPipe,
        InCollectionWithTypePipe,
        IsOerPipe,
        NodePropertyPipe,
        TrimPipe,
        TruncatePipe,
        WrapObservablePipe,
        ReportProblemComponent,
        PreviewImageComponent,
    ],
    imports: [SharedModule],
    exports: [DetailsComponent],
    providers: [
        SearchResultsService,
        SearchPageResolverService,
        SubjectsPortalResolverService,
        ReportProblemService,
    ],
})
export class SearchModule {}
