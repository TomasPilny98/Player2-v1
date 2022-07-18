import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {PlayerPageComponent} from './player-page';
import {LoadingPageComponent} from './loading-page';

const routes: Routes = [
  {path: '', component: LoadingPageComponent},
  {path: 'player-page', component: PlayerPageComponent},

  // otherwise redirect to root (LoadingPage in this case)
  {path: '**', redirectTo: ''}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}

export const routingComponents = [LoadingPageComponent, PlayerPageComponent]
