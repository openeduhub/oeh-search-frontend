import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DetailsResolverService } from './details-resolver.service';
import { DetailsComponent } from './details/details.component';
import { ErrorComponent } from './error/error.component';
import { ExperimentsTogglesComponent } from './experiments-toggles/experiments-toggles.component';
import { SearchResolverService } from './search-resolver.service';
import { SearchComponent } from './search/search.component';

const routes: Routes = [
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
    { path: 'experiments', component: ExperimentsTogglesComponent },
    { path: '', redirectTo: 'search', pathMatch: 'full' },
    { path: 'error', component: ErrorComponent },
];
@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
