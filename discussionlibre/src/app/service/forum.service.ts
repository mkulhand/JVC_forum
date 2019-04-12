import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
	providedIn: 'root'
})
export class ForumService {

	constructor(private http: HttpClient) { }

	getTopic(id: number) {
		return this.http.get(environment.apiUrl + "/topic/" + id, { withCredentials: true })
	}

	getPage(page: number) {
		return this.http.get(environment.apiUrl + "/topic/fresh/" + page, { withCredentials: true })
	}

	getTopicCount() {
		return this.http.get(environment.apiUrl + "/topic/count", { withCredentials: true })
	}

	getTopicMessage(page: number, topicID: number) {
		return this.http.get(environment.apiUrl + "/topic/" + topicID + "/" + page, { withCredentials: true })
	}

	getTopicMessageCount(topicID: number) {
		return this.http.get(environment.apiUrl + "/topic/" + topicID + "/msgcount", { withCredentials: true })
	}
}
