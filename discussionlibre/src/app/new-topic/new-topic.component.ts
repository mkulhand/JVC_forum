import { Component, OnInit } from '@angular/core';
import { Topic } from '../models/topic'
import { JwtHelperService } from '@auth0/angular-jwt';
import { TopicService } from '../service/topic.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
	selector: 'app-new-topic',
	templateUrl: './new-topic.component.html',
	styleUrls: ['./new-topic.component.css']
})
export class NewTopicComponent implements OnInit {
	public submitDisabled: boolean
	private clearedTextarea = false
	public topic: Topic
	public httpAction: string
	public username: string

	constructor(private jwtHelper: JwtHelperService, private topicService: TopicService, private toastr: ToastrService, private router: Router) {
		
	}

	ngOnInit() {
		this.topic = new Topic()
		let payload = this.jwtHelper.decodeToken(this.jwtHelper.tokenGetter())
		if (payload) {
			this.username = payload.username
			this.httpAction = "/profile"
		} else {
			this.username = "Se connecter pour poster"
			this.httpAction = "/auth"
		}
	}

	postTopic() {
		if (!this.clearedTextarea)
			this.toastr.error("Ce message n'est pas valide !", '', { progressBar: true, timeOut: 5000 })
		else {
			this.topic.msg = this.topic.msg.trim()
			this.topic.title = this.topic.title.trim()
			this.submitDisabled = true
			this.topicService.post(this.topic)
			.subscribe(
			(topicID) => {
				if (topicID === false)
					this.toastr.error('Il faut être connecté pour poster', '', { progressBar: true, timeOut: 5000 })
				else
					this.router.navigate(['forum/' + topicID + '/1'])
			},
			(err) => {
				let msg = "Ce message n'est pas valide !"
				if (err.status === 429)
					msg = 'Vous avez créer un topic il y a moins de 10 secondes.'
				this.toastr.error(msg, '', { progressBar: true, timeOut: 5000 })
				this.submitDisabled = false
			})
		}
	}

	print() {
		console.log(this.topic)
	}

	clearTextarea(event: any) {
		if (!this.clearedTextarea) {
			this.topic.msg = ""
			event.target.value = "";
			this.clearedTextarea = true;
		}
	}
}
