import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User } from '../models/user'
import { timeout } from 'rxjs/operators'
import { environment } from 'src/environments/environment';

@Injectable({
	providedIn: 'root'
})
export class RegisterService {

	constructor(private http: HttpClient) { }

	newUser(user: User) {
		return this.http.put(environment.apiUrl + "/user", user, { observe: 'response', withCredentials: true })
	}
}
