export class Topic {
	title: string
	msg: string
	topic_id: number

	constructor() {
		this.title = ""
		this.topic_id = -1
		this.msg = "Ne postez pas d'insultes, évitez les majuscules, faites une recherche avant de poster pour voir si la question n'a pas déjà été posée...\n\n\Tout message d'incitation au piratage est strictement interdit et sera puni d'un bannissement."
	}
}