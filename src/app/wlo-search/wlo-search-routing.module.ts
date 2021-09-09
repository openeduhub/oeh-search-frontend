import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ErrorPageComponent } from './core/error-page/error-page.component';
import { ExperimentsTogglesComponent } from './preferences/experiments-toggles/experiments-toggles.component';
import { DetailsPageResolverService } from './search/details-page/details-page-resolver.service';
import { DetailsPageComponent } from './search/details-page/details-page.component';
// import { SearchPageResolverService } from './search/search-page/search-page-resolver.service';
import { SearchPageComponent } from './search/search-page/search-page.component';
import { SearchResultsComponent } from './search/search-page/search-results/search-results.component';
import { SubjectsPortalResolverService } from './search/search-page/subjects-portal/subjects-portal-resolver.service';
import { SubjectsPortalComponent } from './search/search-page/subjects-portal/subjects-portal.component';
import { WloSearchComponent } from './wlo-search.component';

const routes: Routes = [
    {
        path: '',
        component: WloSearchComponent,
        children: [
            {
                path: 'search',
                component: SearchPageComponent,
                // runGuardsAndResolvers: 'paramsOrQueryParamsChange',
                // resolve: {
                //     searchData: SearchPageResolverService,
                // },
                children: [
                    {
                        path: '',
                        component: SearchResultsComponent,
                    },
                    {
                        path: 'categories',
                        component: SubjectsPortalComponent,
                        // runGuardsAndResolvers: 'paramsOrQueryParamsChange',
                        // resolve: {
                        //     results: SubjectsPortalResolverService,
                        // },
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
            { path: 'error', component: ErrorPageComponent },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class WloSearchRoutingModule {}
