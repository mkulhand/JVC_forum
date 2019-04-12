import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
	providedIn: 'root'
})
export class TokenVerifyService {

	constructor(private jwtHelper: JwtHelperService) { }

	verify() {
		const token = this.jwtHelper.tokenGetter()
		if (token) {
			let headers = new HttpHeaders().set("Authorization", "Bearer " + token)
			let httpOptions = {
				withCredentials: true,
				headers: headers
			}
			return httpOptions;
		} else
			return false;
	}
}
