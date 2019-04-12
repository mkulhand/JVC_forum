import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { User } from '../models/user'
import { environment } from 'src/environments/environment'

import { BehaviorSubject, Observable, of, Subscription} from 'rxjs'
import { serviceDestroy } from '../models/serviceDestroy';
import { TokenVerifyService } from './token-verify.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { map } from 'rxjs/operators';

@Injectable({
	providedIn: 'root'
})
export class AuthService implements serviceDestroy {

	public subscriptions: Subscription[] = []

	private loggedIn = new BehaviorSubject<boolean>(false)
	private loggedAsAdmin = new BehaviorSubject<boolean>(false)

	constructor(private http: HttpClient, public tokenvs: TokenVerifyService, private jwtHelper: JwtHelperService){
		this.subscriptions.push(
			this.isAuthenticated()
			.subscribe(
			(auth: boolean) => {
				if (auth) {
					this.loggedIn.next(true)
					this.isAdmin()
				}
				else
					this.logout()
			},
			() => this.logout())
		)
	}

	ngServiceOnDestroy(): void {
		this.subscriptions.forEach(sub => sub.unsubscribe())
	}

	public login(user: User) {
		return this.http.post(environment.apiUrl + "/user/auth", user, { withCredentials: true, observe: 'response' })
		.pipe(
			map((res) => {
				this.loggedIn.next(true)
				return res
			}
		))
	}

	public logout() {
		let httpOptions = this.tokenvs.verify()
		if (httpOptions)
			this.subscriptions.push(
				this.http.get(environment.apiUrl + "/logout", httpOptions)
				.subscribe()
			)
		localStorage.clear()
		this.loggedAsAdmin.next(false)
		this.loggedIn.next(false)
	}

	public isLoggedIn(): Observable<boolean> {
		return this.loggedIn.asObservable()
	}

	public isLoggedAsAdmin(): Observable<boolean> {
		return this.loggedAsAdmin.asObservable()
	}

	public isAuthenticated() {
		const token = this.jwtHelper.tokenGetter()
		if (token == null || this.jwtHelper.isTokenExpired(token))
			return of(false)
		else
			return of(true)
	}

	public isAdmin() {
		const dcd = this.jwtHelper.decodeToken(this.jwtHelper.tokenGetter())
		if (dcd)
			this.loggedAsAdmin.next(dcd.hasOwnProperty('ip'))
		else
			this.loggedAsAdmin.next(false)
	}
}
