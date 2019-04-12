import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Regex } from '../models/regex';
import { ForumService } from '../service/forum.service';
import { AdminService } from '../service/admin.service';
import { Subscription } from 'rxjs';
import { AuthService } from '../service/auth.service';

@Component({
	selector: 'app-forum',
	templateUrl: './forum.component.html',
	styleUrls: ['./forum.component.css']
})
export class ForumComponent implements OnInit, OnDestroy {

	public topics
	public isAdmin = false
	private subscriptions: Subscription[] = []
	public page = {
		current: 0,
		first: 0,
		next: 0,
		prev: 0
	}

	constructor(private activatedRoute: ActivatedRoute,
				private router: Router,
				private forumService: ForumService,
				private adminService: AdminService,
				private authService: AuthService) {
					
				}

	ngOnInit() {
		this.subscriptions.push(
			this.authService.isLoggedAsAdmin()
			.subscribe((data: boolean) => {
				this.isAdmin = data;
			})
		)
		this.subscriptions.push(
			this.activatedRoute.params
			.subscribe((data: any) => {
				if (data.id.match(Regex.number)) {
					this.page.current = parseInt(data.id, 10)
					if (this.page.current < 0)
						this.router.navigate(['/forum/0'])
					this.pull()
				} else
					this.router.navigate(['/forum/0'])
			})
		)
		this.authService.isAdmin()
	}

	ngOnDestroy() {
		this.subscriptions.forEach(sub => sub.unsubscribe())
	}

	pull() {
		this.subscriptions.push(
			this.forumService.getPage(this.page.current)
			.subscribe((topics: any) => {
				topics.forEach((topic : any) => {
					const match = topic.last_updated.match(Regex.date)
					topic.last_updated = match[3] + '/' + match[2] + '/' + match[1] + ' ' + match[4] + 'h' + match[5]
					topic.msg_count--
					this.setIcon(topic)
				})
				this.configureButton()
				//We pull one more topic to know if we reach last page, and only display 25
				if (topics.length !== 26)
					this.page.next = -1;
				else
					topics.splice(-1)
				this.topics = topics
			},
			() => this.router.navigate(['/forum/0']))
		)
	}

	private configureButton() {
		this.page.next = this.page.current + 1
		this.page.prev = this.page.current - 1
		if (this.page.prev < 0)
			this.page.prev = 0
	}

	private setIcon(topic) {
		topic.icon = "/assets/images/"
		switch (topic.status) {
			case 0: topic.icon += topic.msg_count >= 20 ? "dossier-rouge.gif" : "dossier-vert.gif"; break
			case 1: topic.icon += "topic_cadenas.gif"; break
			case 2: topic.icon += "epingle-verte.gif"; break
			case 3: topic.icon += "epingle-rouge.gif"; break
		}
	}

	setTopicStatus(i: number, status: number) {
		let CONFIRM = 'Verrouiller le topic ?'
		if (status === 2)
			CONFIRM = 'Épingler le topic ?'
		else if (status === 3)
			CONFIRM = 'Épingler et verrouiller le topic ?'
		else if (status === 0)
			CONFIRM = 'Restaurer le topic ?'

		if (confirm(CONFIRM)) {
			this.subscriptions.push(
				this.authService.isLoggedAsAdmin()
				.subscribe((isAdmin: boolean) => {
					if (isAdmin) {
						this.subscriptions.push(
							this.adminService.setTopicStatus(this.topics[i].id, status)
							.subscribe(
								(data: any) => {
									if (status >= 2 || (this.topics[i].status >= 2 && status <= 1))
										this.pull()
									else {
										this.topics[i].status = status
										this.setIcon(this.topics[i])
									}
								},
								(err: any) => {
									console.log(err)
							})
						)
					}
				})
			)
		}
	}

	deleteTopic(i: number) {
		if (confirm('Supprimer le topic ?')) {
			this.subscriptions.push(
				this.authService.isLoggedAsAdmin()
				.subscribe((isAdmin: boolean) => {
					if (isAdmin) {
						this.subscriptions.push(
							this.adminService.deleteTopic(this.topics[i].id)
							.subscribe(
								(data: any) => {
									this.pull()
								},
								(err: any) => {
									console.log(err)
							})
						)
					}
				})
			)
		}
	}
}
