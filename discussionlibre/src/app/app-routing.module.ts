import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './register/register.component'
import { NewTopicComponent } from './new-topic/new-topic.component'
import { AuthComponent } from './auth/auth.component';
import { AuthGuardService as AuthGuard} from './service/auth-guard.service';
import { IsAuthGuardService as isAuthGuard} from './service/is-auth-guard.service';
import { ProfileComponent } from './profile/profile.component';
import { LogoutComponent } from './logout/logout.component';
import { ForumComponent } from './forum/forum.component';
import { HomeComponent } from './home/home.component';
import { TopicMessageComponent } from './topic-message/topic-message.component';

const routes: Routes = [
  { path: 'forum/:id', component: HomeComponent, children: [
    { path: '', component: ForumComponent },
    { path: '', component: NewTopicComponent }
  ] },
  { path: '', redirectTo: 'forum/0', pathMatch: 'full' },
  { path: 'forum', redirectTo: 'forum/0', pathMatch: 'full' },
  { path: 'forum/:id/:page', component: TopicMessageComponent },
  { path: 'register', component: RegisterComponent, canActivate: [isAuthGuard]},
  { path: 'auth', component: AuthComponent, canActivate: [isAuthGuard]},
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'logout', component: LogoutComponent, canActivate: [AuthGuard]},
  { path: '**', redirectTo: 'forum/0'}
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})

export class AppRoutingModule { }
