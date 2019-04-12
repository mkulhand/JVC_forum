import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { AuthService } from './auth.service';
import { serviceDestroy } from '../models/serviceDestroy';
import { Subscription, of, BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { TokenVerifyService } from './token-verify.service';

@Injectable({
	providedIn: 'root'
})
export class AdminService implements serviceDestroy {

	public subscriptions: Subscription[] = []

	constructor(private http: HttpClient, private authService: AuthService, private tokenvs: TokenVerifyService) {

	}

	ngServiceOnDestroy(): void {
		this.subscriptions.forEach(sub => sub.unsubscribe())
	}

	setTopicStatus(id: number, status: number) {
		let httpOptions = this.tokenvs.verify();
		if (!httpOptions)
			return of(false)
		else
			return this.http.post(environment.apiUrl + "/admin/topic/setStatus", { id: id, status: status }, httpOptions)
	}

	deleteTopic(id: number) {
		let httpOptions = this.tokenvs.verify();
		if (!httpOptions)
			return of(false)
		else {
			httpOptions['body'] = {id: id};
			return this.http.delete(environment.apiUrl + "/admin/topic", httpOptions)
		}
	}
}
