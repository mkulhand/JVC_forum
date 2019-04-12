import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Topic } from '../models/topic';
import { of } from 'rxjs';
import { TokenVerifyService } from './token-verify.service';

@Injectable({
	providedIn: 'root'
})
export class TopicService {
	
	constructor(private http: HttpClient, private tokenvs: TokenVerifyService) {}

	post(topic: Topic) {
		let httpOptions = this.tokenvs.verify()
		if (httpOptions) {
			return this.http.put(environment.apiUrl + "/topic", topic, httpOptions)
		} else
			return of(false)
	}

	postInsideTopic(topic: Topic) {	
		let httpOptions = this.tokenvs.verify()
		if (httpOptions) {
			return this.http.put(environment.apiUrl + "/msg", topic, httpOptions)
		} else
			return of(false)
	}
}
