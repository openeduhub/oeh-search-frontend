import { ClipboardModule } from '@angular/cdk/clipboard';
import { OverlayModule } from '@angular/cdk/overlay';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { InMemoryCache } from '@apollo/client/core';
import { APOLLO_OPTIONS } from 'apollo-angular';
import { HttpBatchLink } from 'apollo-angular/http';
import { environment } from '../environments/environment';
import generatedIntrospection from '../generated/fragmentTypes.json';
import { AddContentFabComponent } from './add-content-fab/add-content-fab.component';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DetailsComponent } from './details/details.component';
import { EncodeUriComponentPipe } from './encode-uri-component.pipe';
import { ErrorComponent } from './error/error.component';
import { ExperimentsTogglesComponent } from './experiments-toggles/experiments-toggles.component';
import { FooterbarComponent } from './footerbar/footerbar.component';
import { GenerateFiltersPipe } from './generate-filters.pipe';
import { HasEditorialTagPipe } from './has-editorial-tag.pipe';
import { HeaderbarComponent } from './headerbar/headerbar.component';
import { MenubarComponent } from './menubar/menubar.component';
import { MultivalueCheckboxComponent } from './multivalue-checkbox/multivalue-checkbox.component';
import { NewSearchFieldComponent } from './new-search-field/new-search-field.component';
import { OerSliderComponent } from './oer-slider/oer-slider.component';
import { PaginatorComponent } from './paginator/paginator.component';
import { PreviewImageComponent } from './preview-image/preview-image.component';
import { ResultCardContentCompactComponent } from './result-card-content-compact/result-card-content-compact.component';
import { ResultCardContentStandardComponent } from './result-card-content-standard/result-card-content-standard.component';
import { ResultCardSmallComponent } from './result-card-small/result-card-small.component';
import { ResultCardComponent } from './result-card/result-card.component';
import { SearchFieldComponent } from './search-field/search-field.component';
import { SearchFilterbarComponent } from './search-filterbar/search-filterbar.component';
import { SearchResultsComponent } from './search-results/search-results.component';
import { SearchComponent } from './search/search.component';
import { SubjectsPortalSectionComponent } from './subjects-portal-section/subjects-portal-section.component';
import { SubjectsPortalComponent } from './subjects-portal/subjects-portal.component';
import { TrimPipe } from './trim.pipe';
import { TruncatePipe } from './truncate.pipe';

@NgModule({
    declarations: [
        AppComponent,
        SearchComponent,
        TruncatePipe,
        GenerateFiltersPipe,
        DetailsComponent,
        SearchResultsComponent,
        ErrorComponent,
        HeaderbarComponent,
        FooterbarComponent,
        SearchFieldComponent,
        TrimPipe,
        HasEditorialTagPipe,
        MenubarComponent,
        SearchFilterbarComponent,
        MultivalueCheckboxComponent,
        EncodeUriComponentPipe,
        ResultCardComponent,
        PaginatorComponent,
        SubjectsPortalComponent,
        ResultCardSmallComponent,
        SubjectsPortalSectionComponent,
        OerSliderComponent,
        AddContentFabComponent,
        ResultCardContentStandardComponent,
        ResultCardContentCompactComponent,
        PreviewImageComponent,
        ExperimentsTogglesComponent,
        NewSearchFieldComponent,
    ],
    imports: [
        AppRoutingModule,
        BrowserAnimationsModule,
        BrowserModule,
        ClipboardModule,
        FormsModule,
        HttpClientModule,
        MatAutocompleteModule,
        MatBadgeModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatCardModule,
        MatChipsModule,
        MatExpansionModule,
        MatFormFieldModule,
        MatMenuModule,
        MatSliderModule,
        MatSnackBarModule,
        MatCheckboxModule,
        MatIconModule,
        MatInputModule,
        MatPaginatorModule,
        MatProgressSpinnerModule,
        MatSelectModule,
        MatSlideToggleModule,
        MatTooltipModule,
        OverlayModule,
        ReactiveFormsModule,
        MatTabsModule,
    ],
    providers: [
        {
            provide: APOLLO_OPTIONS,
            useFactory: (httpLink: HttpBatchLink) => {
                return {
                    cache: new InMemoryCache({
                        possibleTypes: generatedIntrospection.possibleTypes,
                    }),
                    link: httpLink.create({
                        uri: environment.relayUrl + '/graphql',
                    }),
                    shouldBatch: true,
                };
            },
            deps: [HttpBatchLink],
        },
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
