
/*
	ERRMSG
*/
global.errmsg = {
	MISSING_DATA:			"Données manquantes",
	INCORRECT_DATA:			"Données non conformes",
	DUPLICATE_USERNAME:		"Ce pseudo est déjà utilisé.",
	BAD_FORMAT:				"Données mal formatées",
	INCORRECT_PASSWORD:		"Mot de passe incorrect",
	INCORRECT_USERNAME:		"Username incorrect",
	QUERY_ERROR:			"la requête n'a pas pu aboutir",
	ID_NOT_FOUND:			"Identifiant introuvable",
	BLANK_STRING:			"Le texte ne peut être vide",
	LONG_STRING:			"Le texte est trop long",
	NO_RESOURCE:			"Ressource non trouvée",
	ARCHIVED_TOPIC:			"Le topic est archivé",
	INVALID_TOKEN:			"Token invalide",
	USER_BANNED:			"L'utilisateur est banni"
}

/*
	ACTIONMSG
*/
global.actionmsg = {
	USER_ADDED:				"Votre compte a été créé, vous allez être redirigé",
	USER_UPDATED:			"Vos données on été modifiées",
	USER_DELETED:			"L'utilisateur a été supprimé",
	USER_AUTH:				"Connexion réussie",
	USER_PASSWORD_UPDATED:	"Votre mot de passe a bien été modifié",
	TOPIC_UPDATED:			"Le topic a été modifié",
	TOPIC_ADDED:			"Le topic a été ajouté",
	TOPIC_DELETED:			"Le topic a été supprimé",
	MSG_ADDED:				"Le message a été ajouté",
	MSG_DELETED:			"Le message a été supprimé",
	PROFILE_UPDATED:		"Votre profile a été modifié",
	USER_LOGOUT:			"Utilisateur a été déconnecté"
}

/*
	REGEX
*/
global.regex = {
	username: /^[\w\-]{3,15}$/gmi,
	password: /^.{4,32}$/gmi,
	string_blank: /^\s*$/gi
}

global.limit = {
	msg: 5000,
	desc: 5000,
	title: 100
}

global.blacklist = []

module.exports = global