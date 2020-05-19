import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';
import { OAuthModule } from 'angular-oauth2-oidc';
import { ApolloModule, APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLink, HttpLinkModule } from 'apollo-angular-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DetailsResolverService } from './details-resolver.service';
import { DetailsComponent } from './details/details.component';
import { EditorialPipe } from './editorial.pipe';
import { EncodeUriComponentPipe } from './encode-uri-component.pipe';
import { ErrorComponent } from './error/error.component';
import { GenerateFiltersPipe } from './generate-filters.pipe';
import { HeaderbarComponent } from './headerbar/headerbar.component';
import { LoginComponent } from './login/login.component';
import { MenubarComponent } from './menubar/menubar.component';
import { MultivalueCheckboxComponent } from './multivalue-checkbox/multivalue-checkbox.component';
import { PaginatorComponent } from './paginator/paginator.component';
import { ResultCardComponent } from './result-card/result-card.component';
import { SafeBase64DataPipe } from './safe-base64-data.pipe';
import { SearchFieldComponent } from './search-field/search-field.component';
import { SearchFilterbarComponent } from './search-filterbar/search-filterbar.component';
import { SearchResultsResolverService } from './search-results-resolver.service';
import { SearchResultsComponent } from './search-results/search-results.component';
import { SearchComponent } from './search/search.component';
import { SortPipe } from './sort.pipe';
import { SubjectsPortalResolverService } from './subjects-portal-resolver.service';
import { SubjectsPortalComponent } from './subjects-portal/subjects-portal.component';
import { TrimPipe } from './trim.pipe';
import { TruncatePipe } from './truncate.pipe';
import { WelcomeComponent } from './welcome/welcome.component';
import { WorkInProgressMessageComponent } from './work-in-progress-message/work-in-progress-message.component';

const appRoutes: Routes = [
    {
        path: 'welcome',
        component: WelcomeComponent,
    },
    {
        path: 'search',
        component: SearchComponent,
        children: [
            {
                path: '',
                component: SearchResultsComponent,
                resolve: { results: SearchResultsResolverService },
                runGuardsAndResolvers: 'paramsOrQueryParamsChange',
            },
        ],
    },
    {
        path: 'details/:id',
        component: DetailsComponent,
        resolve: { details: DetailsResolverService },
    },
    {
        path: 'subjects-portal/:discipline',
        component: SubjectsPortalComponent,
        resolve: { results: SubjectsPortalResolverService },
    },
    { path: 'login', component: LoginComponent },
    { path: '', redirectTo: 'welcome', pathMatch: 'full' },
    { path: 'error', component: ErrorComponent },
];

@NgModule({
    declarations: [
        AppComponent,
        SearchComponent,
        TruncatePipe,
        GenerateFiltersPipe,
        DetailsComponent,
        SearchResultsComponent,
        SafeBase64DataPipe,
        ErrorComponent,
        HeaderbarComponent,
        SearchFieldComponent,
        TrimPipe,
        SortPipe,
        EditorialPipe,
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
    ],
    imports: [
        ApolloModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        HttpClientModule,
        HttpLinkModule,
        MatAutocompleteModule,
        MatBadgeModule,
        MatButtonModule,
        MatCardModule,
        MatExpansionModule,
        MatFormFieldModule,
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
            useFactory: (httpLink: HttpLink) => {
                return {
                    cache: new InMemoryCache(),
                    link: httpLink.create({
                        uri: environment.relayUrl,
                    }),
                };
            },
            deps: [HttpLink],
        },
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
