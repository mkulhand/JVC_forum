import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../service/auth.service'

@Component({
	selector: 'app-header-menu',
	templateUrl: './header-menu.component.html',
	styleUrls: ['./header-menu.component.css']
})
export class HeaderMenuComponent implements OnInit, OnDestroy {

	public isLogged: Number = 0
	private subscriber = []

	constructor(private authService: AuthService) {}

	ngOnInit() {
		this.subscriber.push(
			this.authService.isLoggedIn()
			.subscribe((res: boolean) => {
				if (res)
					this.isLogged = 2
				else
					this.isLogged = 1
			})
		)
	}

	ngOnDestroy() {
		this.subscriber.forEach(sub => sub.unsubscribe())
		this.authService.ngServiceOnDestroy()
	}
}
