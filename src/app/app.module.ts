import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {AppRoutingModule, routingComponents} from './app-routing.module';
import {AppComponent} from './app.component';
import {VideoComponent} from './video';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatNativeDateModule} from "@angular/material/core";
import {MatSelectModule} from "@angular/material/select";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {HttpClientModule} from '@angular/common/http';
import {MatTooltipModule} from "@angular/material/tooltip";
import {NgToastModule} from "ng-angular-popup";
import {NgxSliderModule} from "@angular-slider/ngx-slider";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {MatToolbarModule} from "@angular/material/toolbar";


@NgModule({
  declarations: [
    AppComponent,
    routingComponents,
    VideoComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NoopAnimationsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    HttpClientModule,
    MatTooltipModule,
    NgToastModule,
    NgxSliderModule,
    MatProgressSpinnerModule,
    MatToolbarModule

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
