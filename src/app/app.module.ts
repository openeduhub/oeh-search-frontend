import { A11yModule } from '@angular/cdk/a11y';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { LayoutModule } from '@angular/cdk/layout';
import { OverlayModule } from '@angular/cdk/overlay';
import {
    HttpClient,
    HttpClientModule,
    HttpEvent,
    HttpEventType,
    HttpHandler,
    HttpRequest,
} from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatRippleModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
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
import { APOLLO_NAMED_OPTIONS, APOLLO_OPTIONS } from 'apollo-angular';
import { HttpBatchLink, HttpLink } from 'apollo-angular/http';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { Observable, of, throwError } from 'rxjs';
import { environment } from '../environments/environment';
import generatedIntrospection from '../generated/fragmentTypes.json';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BadgesComponent } from './badges/badges.component';
import { CapitalizeFirstLetterPipe } from './capitalize-first-letter.pipe';
import { CollectionCardComponent } from './collection-card/collection-card.component';
import { DetailsComponent } from './details/details.component';
import { DurationPipe } from './duration.pipe';
import { EncodeUriComponentPipe } from './encode-uri-component.pipe';
import { ErrorComponent } from './error/error.component';
import { ExperimentsTogglesComponent } from './experiments-toggles/experiments-toggles.component';
import { FooterbarComponent } from './footerbar/footerbar.component';
import { GenerateFiltersPipe } from './generate-filters.pipe';
import { HasEditorialTagPipe } from './has-editorial-tag.pipe';
import { HeaderbarComponent } from './headerbar/headerbar.component';
import { LanguagePipe } from './language.pipe';
import { MenubarComponent } from './menubar/menubar.component';
import { MultivalueCheckboxComponent } from './multivalue-checkbox/multivalue-checkbox.component';
import { OerSliderComponent } from './oer-slider/oer-slider.component';
import { PaginatorComponent } from './paginator/paginator.component';
import { PreviewImageComponent } from './preview-image/preview-image.component';
import { PreviewPanelComponent } from './preview-panel/preview-panel.component';
import { ReportClickDirective } from './report-click.directive';
import { ResultCardContentCompactComponent } from './result-card-content-compact/result-card-content-compact.component';
import { ResultCardContentStandardComponent } from './result-card-content-standard/result-card-content-standard.component';
import { ResultCardSmallComponent } from './result-card-small/result-card-small.component';
import { ResultCardComponent } from './result-card/result-card.component';
import { SearchFieldComponent } from './search-field/search-field.component';
import { SearchFilterbarComponent } from './search-filterbar/search-filterbar.component';
import { SearchResultsComponent } from './search-results/search-results.component';
import { SearchComponent } from './search/search.component';
import { SkipTargetDirective } from './skip-nav/skip-target.directive';
import { SubjectsPortalSectionComponent } from './subjects-portal-section/subjects-portal-section.component';
import { SubjectsPortalComponent } from './subjects-portal/subjects-portal.component';
import { TrimPipe } from './trim.pipe';
import { TruncatePipe } from './truncate.pipe';
import { WrapObservablePipe } from './wrap-observable.pipe';
import { DetailsPageComponent } from './details-page/details-page.component';

const httpLinkBeacon = (() => {
    class BeaconHttpHandler implements HttpHandler {
        handle(req: HttpRequest<any>): Observable<HttpEvent<any>> {
            const headers = {
                type: 'application/json',
            };
            const blob = new Blob([JSON.stringify(req.body)], headers);
            const success = navigator.sendBeacon(req.url, blob);
            if (success) {
                return of({ type: HttpEventType.Sent });
            } else {
                return throwError({ message: 'Failed to queue request' });
            }
        }
    }
    const httpClient = new HttpClient(new BeaconHttpHandler());
    return new HttpLink(httpClient);
})();

@NgModule({
    declarations: [
        AppComponent,
        DetailsComponent,
        EncodeUriComponentPipe,
        ErrorComponent,
        ExperimentsTogglesComponent,
        FooterbarComponent,
        GenerateFiltersPipe,
        HasEditorialTagPipe,
        HeaderbarComponent,
        MenubarComponent,
        MultivalueCheckboxComponent,
        OerSliderComponent,
        PaginatorComponent,
        PreviewImageComponent,
        ResultCardComponent,
        ResultCardContentCompactComponent,
        ResultCardContentStandardComponent,
        ResultCardSmallComponent,
        SearchComponent,
        SearchFieldComponent,
        SearchFilterbarComponent,
        SearchResultsComponent,
        SkipTargetDirective,
        SubjectsPortalComponent,
        SubjectsPortalSectionComponent,
        TrimPipe,
        TruncatePipe,
        ReportClickDirective,
        PreviewPanelComponent,
        DurationPipe,
        LanguagePipe,
        BadgesComponent,
        CapitalizeFirstLetterPipe,
        CollectionCardComponent,
        WrapObservablePipe,
        DetailsPageComponent,
    ],
    imports: [
        A11yModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        BrowserModule,
        ClipboardModule,
        FormsModule,
        HttpClientModule,
        LayoutModule,
        MatAutocompleteModule,
        MatBadgeModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatCardModule,
        MatCheckboxModule,
        MatChipsModule,
        MatDialogModule,
        MatExpansionModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatPaginatorModule,
        MatProgressSpinnerModule,
        MatRippleModule,
        MatSelectModule,
        MatSliderModule,
        MatSlideToggleModule,
        MatSnackBarModule,
        MatTabsModule,
        MatTooltipModule,
        OverlayModule,
        ReactiveFormsModule,
        SlickCarouselModule,
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
        {
            provide: APOLLO_NAMED_OPTIONS,
            deps: [HttpLink],
            useFactory: (httpLink: HttpLink) => ({
                analytics: {
                    link: httpLink.create({
                        uri: environment.analyticsUrl + '/graphql',
                    }),
                    cache: new InMemoryCache(),
                },
                analyticsBeacon: {
                    link: httpLinkBeacon.create({
                        uri: environment.analyticsUrl + '/graphql',
                    }),
                    cache: new InMemoryCache(),
                },
            }),
        },
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
