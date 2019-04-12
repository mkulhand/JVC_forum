import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Router, CanActivate } from '@angular/router';
import { Subscription } from 'rxjs';
import { serviceDestroy } from '../models/serviceDestroy';

@Injectable()
export class AuthGuardService implements CanActivate, serviceDestroy {

	public subscriptions: Subscription[] = [];

	constructor(public authService: AuthService, public router: Router) { }

	canActivate(): Promise<boolean> {
		return new Promise<boolean>((resolve, reject) => {
			this.subscriptions.push(
				this.authService.isAuthenticated()
				.subscribe(
				(auth: boolean) => {
					if (!auth) {
						this.router.navigate(['register'])
						reject(false)
					} else
						resolve(true)
					this.ngServiceOnDestroy()
				},
				() => {
					this.router.navigate(['register'])
					reject(false)
					this.ngServiceOnDestroy()
				})
			)
		})
	}

	ngServiceOnDestroy(): void {
		this.subscriptions.forEach(sub => sub.unsubscribe())
	}
}
