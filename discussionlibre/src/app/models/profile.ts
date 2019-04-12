export class Profile {
	age: number;
	country: string;
	member_since: number;
	description: string;
	sex: number;
	id: string;
	msg_count: number;
	last_activity: string;
	username: string;

	constructor(data: any) {
		if (data !== null) {
			this.age = data.age
			this.country = data.country
			this.member_since = data.creation_date
			this.description = data.desc
			this.sex = data.gender
			this.id = data.id
			this.msg_count = data.msgcount
			this.last_activity = data.lastActif
			this.username = data.username
		}
	}
}