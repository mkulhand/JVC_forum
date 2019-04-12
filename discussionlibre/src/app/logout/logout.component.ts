import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../service/auth.service';
import { Router } from '@angular/router';

@Component({
	selector: 'app-logout',
	templateUrl: './logout.component.html',
	styleUrls: ['./logout.component.css']
})
export class LogoutComponent implements OnInit, OnDestroy {

	constructor(private authService: AuthService, private router: Router) { }

	ngOnInit() {
		setTimeout(() => {
			this.authService.logout()
			this.router.navigate(['/'])
		}, 0);
	}

	ngOnDestroy() {
		this.authService.ngServiceOnDestroy()
	}
}
