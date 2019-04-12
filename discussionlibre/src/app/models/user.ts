export class User {
	username: string;
	password: string;
	password2: string;

	constructor(username?: string) {
		this.username = (username != null) ? username : ''
		this.password = '';
		this.password2 = '';
	}

	public cmpPassword(): boolean {
		return this.password === this.password2 ? true : false
	}
}