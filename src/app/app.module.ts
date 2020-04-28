import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';
import { ApolloModule, APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLink, HttpLinkModule } from 'apollo-angular-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DetailsResolverService } from './details-resolver.service';
import { DetailsComponent } from './details/details.component';
import { ErrorComponent } from './error/error.component';
import { GenerateFiltersPipe } from './generate-filters.pipe';
import { HeaderbarComponent } from './headerbar/headerbar.component';
import { SafeBase64DataPipe } from './safe-base64-data.pipe';
import { SearchFieldComponent } from './search-field/search-field.component';
import { SearchResultsResolverService } from './search-results-resolver.service';
import { SearchResultsComponent } from './search-results/search-results.component';
import { SearchComponent } from './search/search.component';
import { TrimPipe } from './trim.pipe';
import { TruncatePipe } from './truncate.pipe';
import { environment } from 'src/environments/environment';
import { WelcomeComponent } from './welcome/welcome.component';
import { EditorialPipe } from './editorial.pipe';
import { MenubarComponent } from './menubar/menubar.component';
import { SearchFilterbarComponent } from './search-filterbar/search-filterbar.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MultivalueCheckboxComponent } from './multivalue-checkbox/multivalue-checkbox.component';

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
        EditorialPipe,
        WelcomeComponent,
        MenubarComponent,
        SearchFilterbarComponent,
        MultivalueCheckboxComponent,
    ],
    imports: [
        ApolloModule,
        AppRoutingModule,
        RouterModule.forRoot(appRoutes),
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        HttpClientModule,
        HttpLinkModule,
        MatCardModule,
        MatFormFieldModule,
        MatCheckboxModule,
        MatIconModule,
        MatInputModule,
        ReactiveFormsModule,
        MatPaginatorModule,
        MatAutocompleteModule,
        MatButtonModule,
        MatSelectModule,
        MatExpansionModule,
        MatProgressSpinnerModule,
        MatTooltipModule,
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
