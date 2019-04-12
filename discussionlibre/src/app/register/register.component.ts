import { Component, OnInit, OnDestroy } from '@angular/core';
import { RegisterService } from '../service/register.service'
import { User } from '../models/user'
import { Router } from "@angular/router"
import { Regex } from '../models/regex'
import { ToastrService } from 'ngx-toastr';
import { timeout } from 'rxjs/operators';


@Component({
	selector: 'app-register',
	templateUrl: './register.component.html',
	styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit, OnDestroy {
	public inputType: string
	public submitDisabled: boolean
	public user: User
	private subscriber = []

	constructor (private registerService: RegisterService, private router: Router, private toastr: ToastrService){}

	ngOnInit() {
		this.user = new User()
		this.inputType = "password"
	}

	ngOnDestroy() {
		this.subscriber.forEach(sub => sub.unsubscribe())
	}

	showPassword() {
		this.inputType = this.inputType === 'password' ? 'text' : 'password';
	}

	register() {
		const errors = [];
		this.submitDisabled = true

		if (!this.user.cmpPassword())
			errors.push("Vos deux mots de passe doivent être identiques.<br>")
		else {
			if (this.user.password.length <= 3 || this.user.password.length >= 33)
				errors.push("Votre mot de passe doit contenir entre 4 et 32 caractères.<br>")
		}
		if (this.user.username.length <= 2 || this.user.username.length >= 16)
			errors.push("Votre pseudo doit contenir entre 3 et 15 caractères.<br>")
		if (!this.user.username.match(Regex.username))
			errors.push("Ce pseudo n'est pas valide.<br>")
		if (errors.length) {
			this.submitDisabled = false
			this.toastr.error(errors.join('<br/>'), '', { enableHtml: true, timeOut: 8000 * errors.length + 1, progressBar: true })
		} else {
			this.subscriber.push(
				this.registerService.newUser(this.user)
				.subscribe((res: any) => {
					if (res.status === 201) {
						this.toastr.success('Votre compte a bien été créé.', '', { timeOut: 5000, progressBar: true })
						setTimeout(() => this.router.navigate(['auth'], { queryParams: { username: this.user.username } }), 0)
					}
				},
				err => {
					if (err.status == 403) {
						this.submitDisabled = false
						this.toastr.error("Ce pseudo est déjà utilisé.", '', { timeOut: 8000, progressBar: true })
					} else {
						this.toastr.warning("Impossible de contacter de le serveur, veuillez réessayer plus tard.", '', { timeOut: 8000, progressBar: true })
					}
				})
			)
		}
	}
}
