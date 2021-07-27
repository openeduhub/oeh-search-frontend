import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DetailsPageResolverService } from './details-page/details-page-resolver.service';
import { DetailsPageComponent } from './details-page/details-page.component';
import { ErrorComponent } from './error/error.component';
import { ExperimentsTogglesComponent } from './experiments-toggles/experiments-toggles.component';
import { SearchResolverService } from './search-resolver.service';
import { SearchResultsComponent } from './search-results/search-results.component';
import { SearchComponent } from './search/search.component';
import { SubjectsPortalResolverService } from './subjects-portal/subjects-portal-resolver.service';
import { SubjectsPortalComponent } from './subjects-portal/subjects-portal.component';

const routes: Routes = [
    {
        path: 'search',
        component: SearchComponent,
        runGuardsAndResolvers: 'paramsOrQueryParamsChange',
        resolve: {
            searchData: SearchResolverService,
        },
        children: [
            {
                path: '',
                component: SearchResultsComponent,
            },
            {
                path: 'categories',
                component: SubjectsPortalComponent,
                runGuardsAndResolvers: 'paramsOrQueryParamsChange',
                resolve: {
                    results: SubjectsPortalResolverService,
                },
            },
        ],
    },
    {
        path: 'details/:id',
        component: DetailsPageComponent,
        resolve: { entry: DetailsPageResolverService },
    },
    { path: 'experiments', component: ExperimentsTogglesComponent },
    { path: '', redirectTo: 'search', pathMatch: 'full' },
    { path: 'error', component: ErrorComponent },
];
@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
