import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule }	 from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { HeaderMenuComponent } from './header-menu/header-menu.component';
import { NewTopicComponent } from './new-topic/new-topic.component'
import { RegisterComponent } from './register/register.component';
import { AppRoutingModule } from './app-routing.module';
import { AuthComponent } from './auth/auth.component';

import { ScrollToModule } from '@nicky-lenaers/ngx-scroll-to';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { ProfileComponent } from './profile/profile.component';
import { JwtModule } from '@auth0/angular-jwt';
import { AuthGuardService } from './service/auth-guard.service';
import { AuthService } from './service/auth.service';
import { LogoutComponent } from './logout/logout.component';
import { IsAuthGuardService } from './service/is-auth-guard.service';
import { ForumComponent } from './forum/forum.component';
import { HomeComponent } from './home/home.component';
import { TopicMessageComponent } from './topic-message/topic-message.component';
import { AnswerTopicComponent } from './answer-topic/answer-topic.component';

export function tokenGetter() {
	return localStorage.getItem('token')
}

@NgModule({
	declarations: [
		AppComponent,
		HeaderMenuComponent,
		NewTopicComponent,
		RegisterComponent,
		AuthComponent,
		ProfileComponent,
		LogoutComponent,
		ForumComponent,
		HomeComponent,
		TopicMessageComponent,
		AnswerTopicComponent
	],
	imports: [
		FormsModule,
		BrowserModule,
		AppRoutingModule,
		HttpClientModule,
		BrowserAnimationsModule,
		ToastrModule.forRoot({
			preventDuplicates: true,
			positionClass: 'toast-bottom-right'
		}),
		JwtModule.forRoot({
			config: {
				tokenGetter: tokenGetter,
				whitelistedDomains: ['http://10.1.7.1:3000', 'https://discussionlibre:3000', 'https://www.discussionlibre:3000'],
			}
		}),
		ScrollToModule.forRoot()
	],
	providers: [ AuthGuardService, IsAuthGuardService, AuthService ],
	bootstrap: [AppComponent]
})
export class AppModule { }
