import { Component, OnInit, AfterViewInit, Output, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ForumService } from '../service/forum.service';
import { Months } from '../models/months'
import { Regex } from '../models/regex'
import { BehaviorSubject } from 'rxjs';
import { ScrollToConfigOptions, ScrollToService } from '@nicky-lenaers/ngx-scroll-to';

@Component({
	selector: 'app-topic-message',
	templateUrl: './topic-message.component.html',
	styleUrls: ['./topic-message.component.css']
})

export class TopicMessageComponent implements OnInit, AfterViewInit, OnDestroy {

	public sendTopicID = new BehaviorSubject<number>(0)
	private subscriber = []
	public messages: any
	public topicID: number
	public title: string
	private config: ScrollToConfigOptions = {
		target: 'newPost',
		duration: 1000,
		easing: 'easeOutElastic',
		offset: 1000
	}
	public page = {
		current: 0,
		next: 0,
		prev: 0,
		first: 1,
		end: -1
	}

	constructor(private activatedRoute: ActivatedRoute, private router: Router, private forumService: ForumService, private scrollTo: ScrollToService) { }

	ngOnInit() {
		this.subscriber.push(
			this.activatedRoute.params.subscribe(data => {
				this.page.current = parseInt(data.page, 10)
				if (data.id.match(Regex.number) && data.page.match(Regex.number) && this.page.current >= 1) {
					this.page.current = parseInt(data.page, 10)
					this.topicID = parseInt(data.id)
					this.sendTopicID.next(this.topicID)
					this.getMessages()
					this.getPageInfo()
				} else
					return this.router.navigate(['forum/0'])
			})
		)
	}

	ngAfterViewInit() {
		this.activatedRoute.queryParams.subscribe(query => {
			if (query.scroll)
				this.scrollTo.scrollTo(this.config)
		})
	}

	ngOnDestroy() {
		this.subscriber.forEach(sub => sub.unsubscribe())
	}

	getMessages() {
		this.subscriber.push(
			this.forumService.getTopicMessage(this.page.current - 1, this.topicID)
			.subscribe(
			(res: any) => {
				//set the title and remove it from the result
				this.title = res[res.length - 1].title
				res.splice(-1)
				//parse the date in the correct format
				res.forEach((el) => {
					const match = el.date.match(Regex.date)
					el.date = 'Posté le ' + match[3] + ' ' + Months[match[2]] + ' ' + match[1] + ' à ' + match[4] + ':' + match[5] + ':' + match[6]
					el.text = el.text.trim()
				})
				this.messages = res
			},
			(err) => {
				//redirect to homepage if topic id is not a number or to first page of the topic
				if (err.status === 404)
					return this.router.navigate(['/forum/0'])
				else if (err.status === 417 || err.status === 401)
					return this.router.navigate(['/forum/' + this.topicID + '/0'])
			})
		)
	}

	getPageInfo() {
		this.subscriber.push(
			this.forumService.getTopicMessageCount(this.topicID)
			.subscribe(
				(res: any) => {
				if (res.count > 20) {
					this.page.end = Math.floor(res.count / 20) + 1
					if (res.count % 20 == 0)
						this.page.end--;
					this.page.next = this.page.current + 1
					this.page.prev = this.page.current - 1
				}
			},
			() => {
				return this.router.navigate(['forum/0'])
			})
		)
	}

	getArray(): number[] {
		if (this.page.end > 0) {
			if (this.page.current < 7) {
				let array = [...Array(this.page.end > 10 ? 10 : this.page.end + 1).keys()]
				array.shift()
				return array
			} else {
				let remainingPage = this.page.end - this.page.current
				if (remainingPage > 5)
					remainingPage = 5
				return [...Array(remainingPage + 6).keys()].map(i => {
					if (i <= 5) {
						return this.page.current - (5 - i)
					} else {
						return this.page.current + (i - 5)
					}
				})
			}
		}
	}

	refresh() {
		window.location.reload()
	}

	scrollDown() {
		document.getElementById('newmessage').focus()
		this.scrollTo.scrollTo(this.config)
	}
}
