import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Profile } from '../models/profile';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from 'src/environments/environment';


@Injectable({
	providedIn: 'root'
})
export class ProfileService {

	constructor(private http: HttpClient, private jwtHelper: JwtHelperService) {}

	getProfile(id: number) {
		const token = this.jwtHelper.tokenGetter()
		if (token) {
			let headers = new HttpHeaders().set("Authorization", "Bearer " + token)
			let httpOptions = {
			  withCredentials: true,
			  headers: headers
		}
			return this.http.get(environment.apiUrl + "/profile/" + id, httpOptions)
		}
	}

	updateProfile(profile: Profile) {

	}
}
