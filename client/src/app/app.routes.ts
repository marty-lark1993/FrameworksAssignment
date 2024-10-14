import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { VideosComponent } from './videos/videos.component';

export const routes: Routes = [
    {path: 'login', component:LoginComponent},
    {path: '', redirectTo:'/login', pathMatch: 'full'},
    {path: 'home', component:HomeComponent},
    {path: 'videos', component:VideosComponent}
];
