import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Topic } from '../models/topic'
import { JwtHelperService } from '@auth0/angular-jwt';
import { TopicService } from '../service/topic.service';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { ScrollToService, ScrollToConfigOptions } from '@nicky-lenaers/ngx-scroll-to';

@Component({
	selector: 'app-answer-topic',
	templateUrl: './answer-topic.component.html',
	styleUrls: ['./answer-topic.component.css']
})
export class AnswerTopicComponent implements OnInit, OnDestroy {

	@Input() topicID: Observable<number>
	private subscriber = []
	public submitDisabled: boolean
	private clearedTextarea = false
	public topic: Topic
	public username: string
	public httpAction: string

	constructor(private jwtHelper: JwtHelperService, private topicService: TopicService, private toastr: ToastrService, private router: Router, private activatedRoute: ActivatedRoute) {}

	ngOnInit() {
		this.topic = new Topic()
		this.subscriber.push(this.topicID.subscribe((id: number) => this.topic.topic_id = id))

		let payload = this.jwtHelper.decodeToken(this.jwtHelper.tokenGetter())
		if (payload) {
			this.username = payload.username
			this.httpAction = "/profile"
		} else {
			this.username = "Se connecter pour poster"
			this.httpAction = "/auth"
		}
	}

	ngOnDestroy() {
		this.subscriber.forEach(sub => sub.unsubscribe())
	}

	postMessage() {
		if (!this.clearedTextarea)
			this.toastr.error("Ce message n'est pas valide !", '', { progressBar: true, timeOut: 5000 })
		else {
			this.submitDisabled = true
			this.topic.msg = this.topic.msg.trim()
			this.subscriber.push(this.topicService.postInsideTopic(this.topic)
			.subscribe(
			(res: any) => {
				let page = Math.floor(res.count / 20)
				if (res.count % 20 === 0)
					page--
				this.router.navigateByUrl('/', { skipLocationChange: false })
				.then(() => {
					this.router.navigate(['forum/' + this.topic.topic_id + '/' + (page + 1)], { queryParams: { scroll: "issou" } })
				})
			},
			(err) => {
				this.submitDisabled = false
				let msg = "Ce message n'est pas valide !"
				if (err.status === 423)
					msg = "Ce topic est verrouillé."
				else if (err.status === 429)
					msg = "Vous avez posté un message il y a moins de 10 secondes."
				this.toastr.error(msg, '', { progressBar: true, timeOut: 5000 })
			}))
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

	goBack() {
		this.router.navigate(['forum/0'])
	}
}
