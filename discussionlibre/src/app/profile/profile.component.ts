import { Component, OnInit } from '@angular/core';
import { Profile } from '../models/profile';
import { ProfileService } from '../service/profile.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { countries } from '../models/countries';

@Component({
	selector: 'app-profile',
	templateUrl: './profile.component.html',
	styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

	public profile = new Profile(null)
	public countries = countries

	constructor(private profileService: ProfileService, private jwtHelper: JwtHelperService) { }

	ngOnInit() {
		let id = this.jwtHelper.decodeToken(localStorage.getItem('token')).id
		this.profileService.getProfile(id)
		.subscribe(
		(res: any) => {
			this.profile = new Profile(res)
		}
		)
	}

	onPenClick() {
		let el = document.getElementById('countrySelect') as HTMLSelectElement
		el.options[0].selected = true
	}

}
