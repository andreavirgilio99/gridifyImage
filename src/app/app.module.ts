import { NgModule } from "@angular/core";
import { AppComponent } from "./app.component";
import { CommonModule } from "@angular/common";
import { BrowserModule } from "@angular/platform-browser";
import { ImgSelectorComponent } from "./components/img-selector/img-selector.component";
import { FormsModule } from "@angular/forms";

@NgModule({
    bootstrap: [AppComponent],
    imports: [
        CommonModule,
        BrowserModule,
        FormsModule
    ],
    declarations: [
        AppComponent,
        ImgSelectorComponent
    ]
})
export class AppModule {

}