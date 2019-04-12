import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Router, CanActivate } from '@angular/router';
import { serviceDestroy } from '../models/serviceDestroy';
import { Subscription } from 'rxjs';

@Injectable()
export class IsAuthGuardService implements CanActivate, serviceDestroy {

	public subscriptions: Subscription[] = []

	constructor(public authService: AuthService, public router: Router) { }

	canActivate(): Promise<boolean> {
		return new Promise<boolean>((resolve, reject) => {
			this.subscriptions.push(
				this.authService.isAuthenticated()
				.subscribe(
				(auth: boolean) => {
					if (auth) {
						reject(false)
						this.router.navigate(['/'])
						this.ngServiceOnDestroy()
					}
					else
						resolve(true)
				},
				() => {
					reject(false)
					this.router.navigate(['/'])
					this.ngServiceOnDestroy()
				})
			)
		})
	}

	ngServiceOnDestroy(): void {
		this.subscriptions.forEach(sub => sub.unsubscribe())
	}
}
