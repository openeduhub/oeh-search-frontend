import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DummyComponent } from './dummy/dummy.component';

export const ROOT_PATH = '/';
export const WLO_SEARCH_PATH_COMPONENT = 'wlo-search';

const routes: Routes = [
    {
        path: 'dummy',
        component: DummyComponent,
    },
    {
        path: WLO_SEARCH_PATH_COMPONENT,
        loadChildren: () => import('./wlo-search/wlo-search.module').then((m) => m.WloSearchModule),
    },
    { path: '', redirectTo: WLO_SEARCH_PATH_COMPONENT, pathMatch: 'full' },
];
@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
