import { Component, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { User } from '../models/user'
import { ActivatedRoute } from "@angular/router"
import { AuthService } from '../service/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { AdminService } from '../service/admin.service';

@Component({
	selector: 'app-auth',
	templateUrl: './auth.component.html',
	styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit, OnDestroy {

	public submitDisabled: boolean
	public inputType: string
	public user: User
	private subscriber = []

	constructor (
				private authService: AuthService,
				private route: ActivatedRoute,
				private toastr: ToastrService,
				private router: Router,
				private adminService: AdminService
				){}

	ngOnInit() {
		this.user = new User(this.route.snapshot.queryParamMap.get('username'))
		this.inputType = "password"
	}

	ngOnDestroy() {
		this.subscriber.forEach(sub => sub.unsubscribe())
		this.authService.ngServiceOnDestroy()
	}

	public showPassword() {
		this.inputType = this.inputType === 'password' ? 'text' : 'password';
	}

	public authenticate() {
		this.submitDisabled = true
		this.subscriber.push(
			this.authService.login(this.user)
			.subscribe((res: any) => {
				localStorage.setItem('token', res.body.token)
				this.router.navigate(['/'])
			},
			(err) => {
				let msg = 'Pseudo ou mot de passe incorrect, veuillez réessayer.'
				if (err.status === 429)
					msg = err.error
				this.toastr.error(msg, '', { progressBar: true, timeOut: 5000 })
				this.authService.logout()
				this.submitDisabled = false
			})
		)
	}
}
