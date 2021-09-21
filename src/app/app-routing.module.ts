import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WloSearchModule } from './wlo-search/wlo-search.module';

export const ROOT_PATH = '';
export const WLO_SEARCH_PATH_COMPONENT = '';

const routes: Routes = [
    {
        path: WLO_SEARCH_PATH_COMPONENT,
        // WloSearchModule is designed to be lazy-loadable, but in this application, we load it
        // eagerly instead.
        //
        // loadChildren: () => import('./wlo-search/wlo-search.module').then((m) => m.WloSearchModule),
        loadChildren: () => WloSearchModule,
    },
    // { path: '', redirectTo: WLO_SEARCH_PATH_COMPONENT, pathMatch: 'full' },
];
@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
