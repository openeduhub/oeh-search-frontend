import { ClipboardModule } from '@angular/cdk/clipboard';
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
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';
import { OAuthModule } from 'angular-oauth2-oidc';
import { ApolloModule, APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLinkModule } from 'apollo-angular-link-http';
import { HttpBatchLink, HttpBatchLinkModule } from 'apollo-angular-link-http-batch';
import { InMemoryCache, IntrospectionFragmentMatcher } from 'apollo-cache-inmemory';
import { environment } from '../environments/environment';
import { AddContentFabComponent } from './add-content-fab/add-content-fab.component';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DetailsResolverService } from './details-resolver.service';
import { DetailsComponent } from './details/details.component';
import { EncodeUriComponentPipe } from './encode-uri-component.pipe';
import { ErrorComponent } from './error/error.component';
import { GenerateFiltersPipe } from './generate-filters.pipe';
import { HeaderbarComponent } from './headerbar/headerbar.component';
import { IsInCollectionPipe } from './is-in-collection.pipe';
import { LoginComponent } from './login/login.component';
import { MenubarComponent } from './menubar/menubar.component';
import { MultivalueCheckboxComponent } from './multivalue-checkbox/multivalue-checkbox.component';
import { OerSliderComponent } from './oer-slider/oer-slider.component';
import { PaginatorComponent } from './paginator/paginator.component';
import { ResultCardContentCompactComponent } from './result-card-content-compact/result-card-content-compact.component';
import { ResultCardContentStandardComponent } from './result-card-content-standard/result-card-content-standard.component';
import { ResultCardSmallComponent } from './result-card-small/result-card-small.component';
import { ResultCardComponent } from './result-card/result-card.component';
import { SearchFieldComponent } from './search-field/search-field.component';
import { SearchFilterbarComponent } from './search-filterbar/search-filterbar.component';
import { SearchResolverService } from './search-resolver.service';
import { SearchResultsComponent } from './search-results/search-results.component';
import { SearchComponent } from './search/search.component';
import { SubjectsPortalSectionComponent } from './subjects-portal-section/subjects-portal-section.component';
import { SubjectsPortalComponent } from './subjects-portal/subjects-portal.component';
import { TrimPipe } from './trim.pipe';
import { TruncatePipe } from './truncate.pipe';
import { WelcomeComponent } from './welcome/welcome.component';
import { WorkInProgressMessageComponent } from './work-in-progress-message/work-in-progress-message.component';
import introspectionQueryResultData from '../generated/fragmentTypes.json';
import { PreviewImageComponent } from './preview-image/preview-image.component';

const appRoutes: Routes = [
    {
        path: 'welcome',
        component: WelcomeComponent,
    },
    { path: 'login', component: LoginComponent },
    {
        path: 'search/:educationalContext/:discipline',
        component: SearchComponent,
        runGuardsAndResolvers: 'paramsOrQueryParamsChange',
        resolve: {
            searchData: SearchResolverService,
        },
    },
    {
        path: 'search',
        component: SearchComponent,
        runGuardsAndResolvers: 'paramsOrQueryParamsChange',
        resolve: {
            searchData: SearchResolverService,
        },
    },
    {
        path: 'details/:id',
        component: DetailsComponent,
        resolve: { details: DetailsResolverService },
    },
    { path: '', redirectTo: 'search', pathMatch: 'full' },
    { path: 'error', component: ErrorComponent },
];

const fragmentMatcher = new IntrospectionFragmentMatcher({
    introspectionQueryResultData,
});

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
        SearchFieldComponent,
        TrimPipe,
        IsInCollectionPipe,
        WelcomeComponent,
        MenubarComponent,
        LoginComponent,
        SearchFilterbarComponent,
        MultivalueCheckboxComponent,
        WorkInProgressMessageComponent,
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
    ],
    imports: [
        ApolloModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        BrowserModule,
        ClipboardModule,
        FormsModule,
        HttpClientModule,
        HttpLinkModule,
        HttpBatchLinkModule,
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
        MatTooltipModule,
        OAuthModule.forRoot({
            resourceServer: {
                allowedUrls: [environment.editorBackendUrl],
                sendAccessToken: true,
            },
        }),
        ReactiveFormsModule,
        RouterModule.forRoot(appRoutes),
    ],
    providers: [
        {
            provide: APOLLO_OPTIONS,
            useFactory: (httpLink: HttpBatchLink) => {
                return {
                    cache: new InMemoryCache({ fragmentMatcher }),
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
