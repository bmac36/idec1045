/**
 * Creative Services Valence Library (CSVal)
 * ------------------------------------------------------------------------------------------------
 *	A library of routines to ease the use of Brightspace Valence APIs for client-side projects. This
 * library will only function within content stored inside the Brightspace Learning Environment,
 * and cannot be served from an external web server or CDN.
 *
 *	More information regarding this library and its use can be found at:
 *		http://xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
 *
 *	Requirements:
 *		- Brightspace LE 10.3.SP16 or greater, unless otherwise indicated in the documentation.
 *		- Brightspace Superagent Session Authentication Library (bundled)
 *
 *	Version: 1.0.alpha (Aquamarine)
 *
 * @namespace
 * @this {CSVal}
 */

var CSVal = CSVal || {};
var APIVersion = '1.7';

// Define all of the Valence API routes which this library interacts with.
CSVal.routes = CSVal.routes || {};
CSVal.routes.get_whoami = '/d2l/api/lp/' + APIVersion + '/users/whoami';
CSVal.routes.get_userProfile = '/d2l/api/lp/' + APIVersion + '/profile/';
CSVal.routes.put_userProfile = '/d2l/api/lp/' + APIVersion + '/profile/';
CSVal.routes.get_toc = '/d2l/api/le/' + APIVersion + '/ORGID/content/toc';
CSVal.routes.get_grades = '/d2l/api/le/' + APIVersion + '/ORGID/grades/values/myGradeValues/';
CSVal.routes.get_news = '/d2l/api/le/' + APIVersion + '/ORGID/news/';
CSVal.routes.get_newsFile = '/d2l/api/le/' + APIVersion + '/ORGID/news/NEWSID/attachments/FILEID';
CSVal.routes.get_calendar = '/d2l/api/le/' + APIVersion + '/ORGID/calendar/events/';
CSVal.routes.get_enrollments = '/d2l/api/lp/' + APIVersion + '/enrollments/myenrollments/'; //*
CSVal.routes.get_roles = '/d2l/api/lp/' + APIVersion + '/roles/';
//CSVal.routes.get_userProfileimg	= '/d2l/api/lp/'+APIVersion+'/profile/USERID/image';

CSVal.routes.get_forums = '/d2l/api/le/' + APIVersion + '/ORGID/discussions/forums/';
CSVal.routes.get_topics = '/d2l/api/le/' + APIVersion + '/ORGID/discussions/forums/FORUMID/topics/';
CSVal.routes.get_posts = '/d2l/api/le/' + APIVersion + '/ORGID/discussions/forums/FORUMID/topics/TOPICID/posts/';
CSVal.routes.post_post = '/d2l/api/le/' + APIVersion + '/ORGID/discussions/forums/FORUMID/topics/TOPICID/posts/';
CSVal.routes.update_post = '/d2l/api/le/' + APIVersion + '/ORGID/discussions/forums/FORUMID/topics/TOPICID/posts/POSTID';

CSVal.init_tracking = function () {
	this.timestamp = null;
	this.lock = false;
	this.page = null;
	this.data = new Array();
};

CSVal.devMode = false;


/*
	CSVal.init
	- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
*/
CSVal.init = function (initReqs) {
	// Define data objects and associated timestamps
	//		context		- current context information
	CSVal.context = CSVal.context || {};
	//		user			- represents the currently logged in user
	CSVal.user = CSVal.user || {};
	CSVal.t_profile = new CSVal.init_tracking();
	//		toc			- table of contents for a given course
	CSVal.toc = CSVal.toc || {};
	CSVal.t_toc = new CSVal.init_tracking();
	//		grades 		- grades for a given course
	CSVal.grades = CSVal.grades || {};
	CSVal.t_grades = new CSVal.init_tracking();
	//		news			- news for given user context
	CSVal.news = CSVal.news || {};
	CSVal.t_news = new CSVal.init_tracking();
	//		calendar		- calendar of events for given user context
	CSVal.calendar = CSVal.calendar || {};
	CSVal.t_calendar = new CSVal.init_tracking();
	//		enrollments	- list of enrolled courses for given user context
	CSVal.enrollments = CSVal.enrollments || {};
	CSVal.t_enrollments = new CSVal.init_tracking();
	//		roles	- list of user roles
	CSVal.roles = CSVal.roles || {};
	CSVal.t_roles = new CSVal.init_tracking();

	//		disc	- discussion forum data
	CSVal.disc = CSVal.disc || {};
	CSVal.tsS_discForums = CSVal.tsE_discForums = CSVal.tsS_discTopics = CSVal.tsE_discTopics = CSVal.tsS_discPosts = CSVal.tsE_discPosts = null;
	CSVal.disc.postLimit = 0;

	// Hard coded limits and declarations for the library
	CSVal.params = CSVal.params || {};
	CSVal.params.profile_strings = {
		Nickname: 128,
		HomeTown: 128,
		Email: 128,
		HomePage: 128,
		HomePhone: 20,
		BusinessPhone: 20,
		MobilePhone: 20,
		FaxNumber: 20,
		Address1: 128,
		Address2: 128,
		City: 128,
		Province: 20,
		PostalCode: 20,
		Country: 20,
		Company: 128,
		JobTitle: 128,
		HighSchool: 128,
		University: 128,
		Hobbies: 10000,
		FavMusic: 10000,
		FavTVShows: 10000,
		FavMovies: 10000,
		FavBooks: 10000,
		FavQuotations: 10000,
		FavWebSites: 10000,
		FutureGoals: 10000,
		FavMemory: 10000,
		Social_Facebook: 128,
		Social_Twitter: 128,
		Social_Google: 128,
		Social_LinkedIn: 128
	}

	// Establish the context (ouID, contentTopicID)	
	var url = window.location.href;
	var contentURL = window.top.location.href;
	var contentParts = contentURL.split("/");
	if (contentURL.indexOf("/m/") > -1) {
		CSVal.context.ouID = contentParts[7];
		CSVal.context.contentTopicID = contentParts[10];
	} else {
		CSVal.context.ouID = contentParts[6];
		CSVal.context.contentTopicID = contentParts[8];
	}
	if (CSVal.context.ouID == undefined) {
		CSVal.context.ouID = parent.ouID;
	}

	// Check for initialization requests and queue them up for processing
	/*
		if ((initReqs !== undefined) && (FilterTags instanceof Array === true)) {
			if (initReqs.indexOf('myprofile') > -1) {
				pubsubz.subscribe('csval/get_whoami', CSVal.get_userProfile);
			}
		}
	*/

	if (CSVal.devMode == true) {
		console.log(CSVal.context);
	}
	
	// Always a call to whoami to kick things off
	CSVal.get_whoami();

	pubsubz.publish('csval/init');

};



/*
	CSVal.get_whoami
	- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	- Add results to CSVal.user object
*/
CSVal.get_whoami = function () {
	valence_req
		.get(CSVal.routes.get_whoami)
		.use(valence_auth)
		.end(function (err, response) {
			if (err != null) {
				console.log('csval.get_whoami error:');
				console.log(response);
				errorPrompt(err, CSVal.routes.get_whoami, "alert");
				return false;
			}
			for (var key in response.body) {
				CSVal.user[key] = response.body[key];
			}
			CSVal.user.ID = CSVal.user.Identifier; // more commonly referred to as ID
			pubsubz.publish('csval/get_whoami');
			if (CSVal.devMode == true) {
				console.log('CSVal.user:');
				console.log(CSVal.user);
			}
		});

};



/*
	CSVal.get_userProfile
	- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	- If capturing myProfile data then add to CSVal.user object
	- Return response body to subscribers
*/
CSVal.get_userProfile = function (ProfileID) {
	if (ProfileID == undefined) {
		ProfileID = 'myProfile';
		if (CSVal.t_profile.lock !== false) {
			console.info('CSVal.get_userProfile was called while a previous Profile request is still being processed');
			return false;
		}
		CSVal.t_profile.lock = true;
	}
	valence_req
		.get(CSVal.routes.get_userProfile + ProfileID)
		.use(valence_auth)
		.end(function (err, response) {
			if (err != null) {
				errorPrompt(err, CSVal.routes.get_userProfile, "alert");
				CSVal.t_profile.lock = false;
				return false;
			}
			if (ProfileID == 'myProfile') {
				CSVal.user.profile = {};
				CSVal.user.profile = response.body;
				CSVal.t_profile.timestamp = new Date();
				CSVal.t_profile.lock = false;
				pubsubz.publish('csval/get_userProfile');
			} else {
				pubsubz.publish('csval/get_userProfile', response.body);
			}
			if (CSVal.devMode == true) {
				console.log('CSVal.user.profile:');
				console.log(CSVal.user.profile);
			}
		});
};



/*
	CSVal.put_userProfile
	- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	- Update user profile data based upon updates to the local CSVal.user object, or for
	-   the provided ProfileID and UserProfile object
	- Return response body to subscribers
*/
CSVal.put_userProfile = function (ProfileID, UserProfile) {
	if (ProfileID == undefined) {
		ProfileID = 'myProfile';
		UserProfile = CSVal.user.profile;
		if (CSVal.t_profile.lock !== false) {
			console.info('CSVal.put_userProfile was called while a previous Profile request is still being processed');
			return false;
		}
		CSVal.t_profile.lock = true;
	} else {
		if (UserProfile == undefined) {
			return false;
		}
	}
	valence_req
		.put(CSVal.routes.put_userProfile + ProfileID)
		.send(UserProfile)
		.use(valence_auth)
		.end(function (err, response) {
			if (err != null) {
				errorPrompt(err, CSVal.routes.put_userProfile, "alert");
				return false;
			}
			if (ProfileID == 'myProfile') {
				CSVal.user.profile = response.body;
				CSVal.t_profile.timestamp = new Date();
				CSVal.t_profile.lock = false;
				pubsubz.publish('csval/put_userProfile');
			} else {
				pubsubz.publish('csval/put_userProfile', response.body);
			}
		});
};



/*
	CSVal.get_toc
	- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	- Add results to CSVal.toc object
	- Return response body to subscribers
*/
CSVal.get_toc = function (ouID) {
	var route;
	if (ouID === undefined) {
		if (CSVal.t_toc.lock !== false) {
			console.info('CSVal.get_toc was called while a previous ToC request is still being processed');
			return false;
		}
		CSVal.t_toc.lock = true;
		// Takes the API route with the placeholder and replaces it with the proper ORGID
		route = CSVal.routes.get_toc.replace("ORGID", CSVal.context.ouID);
	} else {
		route = CSVal.routes.get_toc.replace("ORGID", ouID);
	}
	valence_req
		.get(route)
		.use(valence_auth)
		.end(function (err, response) {
			if (err != null) {
				errorPrompt(err, CSVal.routes.get_toc, "alert");
				CSVal.t_toc.lock = false;
				return false;
			}

			if (ouID === undefined) {
				// Parse topic data to determine types of files and links
				CSVal.toc = CSVal.toc_parse(response.body);

				CSVal.t_toc.timestamp = new Date();
				CSVal.t_toc.lock = false;
				pubsubz.publish('csval/get_toc');
				if (CSVal.devMode == true) {
					console.log('CSVal.toc:');
					console.log(CSVal.toc);
				}
			} else {
				pubsubz.publish('csval/get_toc/' + ouID, response.body);
			}
		});
};



/*
	CSVal.get_grades
	- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	- Add results to CSVal.grades object
	- Return response body to subscribers
*/
CSVal.get_grades = function () {
	if (CSVal.t_grades.lock !== false) {
		console.info('CSVal.get_grades was called while a previous Grades request is still being processed');
		return false;
	}
	CSVal.t_grades.lock = true;
	// Takes the API route with the placeholder and replaces it with the proper ORGID
	CSVal.routes.get_grades = CSVal.routes.get_grades.replace("ORGID", CSVal.context.ouID);
	valence_req
		.get(CSVal.routes.get_grades)
		.use(valence_auth)
		.end(function (err, response) {
			if (err != null) {
				errorPrompt(err, CSVal.routes.get_grades, "alert");
				CSVal.t_grades.lock = false;
				return false;
			}

			CSVal.grades = response.body;

			CSVal.t_grades.timestamp = new Date();
			CSVal.t_grades.lock = false;
			pubsubz.publish('csval/get_grades');
			if (CSVal.devMode == true) {
				console.log('CSVal.grades:');
				console.log(CSVal.grades);
			}
		});
};



/*
	CSVal.get_news
	- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	- Add results to CSVal.news object
	- Return response body to subscribers
*/
CSVal.get_news = function () {
	if (CSVal.t_news.lock !== false) {
		console.info('CSVal.get_news was called while a previous News request is still being processed');
		return false;
	}
	CSVal.t_news.lock = true;

	// Takes the API route with the placeholder and replaces it with the proper ORGID
	CSVal.routes.get_news = CSVal.routes.get_news.replace("ORGID", CSVal.context.ouID);
	valence_req
		.get(CSVal.routes.get_news)
		.use(valence_auth)
		.end(function (err, response) {
			if (err != null) {
				errorPrompt(err, CSVal.routes.get_news, "alert");
				CSVal.t_news.lock = false;
				return false;
			}

			CSVal.news = JSON.parse(JSON.stringify(response.body), JSON.dateParser);

			CSVal.t_news.timestamp = new Date();
			CSVal.t_news.lock = false;
			pubsubz.publish('csval/get_news');
			if (CSVal.devMode == true) {
				console.log('CSVal.news:');
				console.log(CSVal.news);
			}
		});
};



/*
	CSVal.get_newsFile					NOT WORKING !!!  >>>
	- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	- Downloads a specified attachment from a news object
*/
CSVal.get_newsFile = function (ouID, newsID, fileID) {
	if (fileID === undefined) {
		return false;
	}

	// Takes the API route with the placeholder and replaces it with the proper ORGID
	fileURL = CSVal.routes.get_newsFile.replace("ORGID", ouID).replace("NEWSID", newsID).replace("FILEID", fileID);
	valence_req
		.get(fileURL)
		.use(valence_auth)
		.end(function (err, response) {
			if (err != null) {
				errorPrompt(err, CSVal.routes.get_news, "alert");
				return false;
			}

			console.log('response from get_newsFile:');
			console.log(response);

		});
};



/*
	CSVal.get_calendar
	- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	- Add results to CSVal.calendar object
	- Return response body to subscribers
*/
CSVal.get_calendar = function () {
	if (CSVal.t_calendar.lock !== false) {
		console.info('CSVal.get_calendar was called while a previous Calendar request is still being processed');
		return false;
	}
	CSVal.t_calendar.lock = true;
	// Takes the API route with the placeholder and replaces it with the proper ORGID
	CSVal.routes.get_calendar = CSVal.routes.get_calendar.replace("ORGID", CSVal.context.ouID);
	valence_req
		.get(CSVal.routes.get_calendar)
		.use(valence_auth)
		.end(function (err, response) {
			if (err != null) {
				errorPrompt(err, CSVal.routes.get_calendar, "alert");
				CSVal.t_calendar.lock = false;
				return false;
			}

			// Fill in missing date objects
			for (var i = 0; i < response.body.length; i++) {
				if (response.body[i].StartDay == null) {
					response.body[i].StartDay = response.body[i].StartDateTime;
				} else if (response.body[i].StartDateTime == null) {
					response.body[i].StartDateTime = response.body[i].StartDay;
				}
				if (response.body[i].EndDay == null) {
					response.body[i].EndDay = response.body[i].EndDateTime;
				} else if (response.body[i].EndDateTime == null) {
					response.body[i].EndDateTime = response.body[i].EndDay;
				}

				// If calendar event has associated entity, determine the type
				if (response.body[i].AssociatedEntity !== null) {
					if (response.body[i].AssociatedEntity.AssociatedEntityType == 'D2L.LE.Quizzing.Quiz') {
						response.body[i].AssociatedEntity.Type = 'Quiz';
					}
					if (response.body[i].AssociatedEntity.AssociatedEntityType == 'D2L.LE.Discussions.DiscussionTopic') {
						response.body[i].AssociatedEntity.Type = 'Discussion';
					}
					if (response.body[i].AssociatedEntity.AssociatedEntityType == 'D2L.LE.Dropbox.Dropbox') {
						response.body[i].AssociatedEntity.Type = 'Dropbox';
					}
					if (response.body[i].AssociatedEntity.AssociatedEntityType == 'D2L.LE.Survey.Survey') {
						response.body[i].AssociatedEntity.Type = 'Survey';
					}
					if (response.body[i].AssociatedEntity.AssociatedEntityType == 'D2L.LE.Checklist.ChecklistItem') {
						response.body[i].AssociatedEntity.Type = 'Checklist';
					}
				}
			}

			CSVal.calendar = JSON.parse(JSON.stringify(response.body), JSON.dateParser);

			CSVal.t_calendar.timestamp = new Date();
			CSVal.t_calendar.lock = false;
			pubsubz.publish('csval/get_calendar');
			if (CSVal.devMode == true) {
				console.log('CSVal.calendar:');
				console.log(CSVal.calendar);
			}
		});
};



/*
	CSVal.get_enrollments
	- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	- Add results to CSVal.enrollments object
	- Return response body to subscribers
	- Recursive as the route provides paginated results
*/
CSVal.get_enrollments = function (Recursive) {
	var route = CSVal.routes.get_enrollments;
	if ((CSVal.t_enrollments.lock !== false) && (Recursive === undefined)) {
		console.info('CSVal.get_enrollments was called while a previous Enrollments request is still being processed');
		return false;
	} else if ((Recursive !== undefined) && (CSVal.t_enrollments.page == null)) {
		console.warn('CSVal.get_enrollments was called incorrectly with an argument');
		return false;
	} else if (Recursive !== undefined) {
		route += '?bookmark=' + CSVal.t_enrollments.page;
	}
	CSVal.t_enrollments.lock = true;

	valence_req
		.get(route)
		.use(valence_auth)
		.end(function (err, response) {
			if (err != null) {
				errorPrompt(err, CSVal.routes.get_enrollments, "alert");
				CSVal.t_enrollments.lock = false;
				return false;
			}

			var tempArr = CSVal.t_enrollments.data;
			CSVal.t_enrollments.data = tempArr.concat(JSON.parse(JSON.stringify(response.body.Items), JSON.dateParser));

			if ((response.body.PagingInfo.HasMoreItems == true) && (CSVal.t_enrollments.data.length < 1000)) {
				CSVal.t_enrollments.page = response.body.PagingInfo.Bookmark;
				CSVal.get_enrollments(true);
			} else {
				CSVal.t_enrollments.page = null;
				CSVal.enrollments = CSVal.t_enrollments.data;
				CSVal.t_enrollments.data = new Array();
				CSVal.t_enrollments.timestamp = new Date();
				CSVal.t_enrollments.lock = false;
				pubsubz.publish('csval/get_enrollments');
				if (CSVal.devMode == true) {
					console.log('CSVal.enrollments:');
					console.log(CSVal.enrollments);
				}
			}
		});
};



/*
	CSVal.get_roles
	- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	- If single roleID is defined, return the role details; otherwise add all results to CSVal.roles object
*/
CSVal.get_roles = function (roleID) {
	var route;
	if (roleID === undefined) {
		if (CSVal.t_roles.lock !== false) {
			console.info('CSVal.get_roles was called while a previous Roles request is still being processed');
			return false;
		}
		CSVal.t_roles.lock = true;
		// Takes the API route with the placeholder and replaces it with the proper ORGID
		route = CSVal.routes.get_roles;
	} else {
		route = CSVal.routes.get_roles + roleID;
	}
	valence_req
		.get(route)
		.use(valence_auth)
		.end(function (err, response) {
			if (err != null) {
				errorPrompt(err, CSVal.routes.get_roles, "alert");
				CSVal.t_roles.lock = false;
				return false;
			}

			if (roleID === undefined) {
				CSVal.roles = response.body;
				CSVal.t_roles.timestamp = new Date();
				CSVal.t_roles.lock = false;
				pubsubz.publish('csval/get_roles');
				if (CSVal.devMode == true) {
					console.log('CSVal.roles:');
					console.log(CSVal.roles);
				}
			} else {
				pubsubz.publish('csval/get_roles/' + roleID, response.body);
			}
		});
};



/*
 *	SUPPORTING FUNCTIONS
 *
 */

/*
	CSVal.toc_parse
	- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	- Parse topics within a TOC (Table of Contents) object in order to determine file/link types
	- Recursive to account for submodules
*/
CSVal.toc_parse = function (Module) {
	if (Module == undefined) Module = CSVal.toc;

	var fileExtPattern = /\.[0-9a-z]+$/i;
	var linkPieces = [];

	// Create the Progress object for the module
	Module.Progress = {
		'Read': 0,
		'Total': 0,
		'Percentage': 0
	}

	// Check for submodules
	if (Module.Modules !== undefined) {
		for (var i = 0; i < Module.Modules.length; i++) {
			Module.Modules[i] = CSVal.toc_parse(Module.Modules[i]);
			Module.Progress.Total += Module.Modules[i].Progress.Total;
			Module.Progress.Read += Module.Modules[i].Progress.Read;
		}
	} else {
		// Create an empty array for Modules if undefined so it won't cause headaches later
		Module.Modules = [];
	}

	// Parse topics to determine type and source
	if (Module.Topics !== undefined) {
		for (var j = 0; j < Module.Topics.length; j++) {
			// Increment the progress counters
			Module.Progress.Total++;
			if (Module.Topics[j].Unread == false) {
				Module.Progress.Read++;
			}
			// TypeIdentifier = 'Link' => check for D2L tool types first
			if ((Module.Topics[j].TypeIdentifier == 'Link') && (Module.Topics[j].Url.substr(0, 4) == '/d2l')) {
				if (Module.Topics[j].Url.indexOf('&type=discuss&') > -1) {
					Module.Topics[j].Type = 'Discussion';
				} else if (Module.Topics[j].Url.indexOf('&type=dropbox&') > -1) {
					Module.Topics[j].Type = 'Dropbox';
				} else if (Module.Topics[j].Url.indexOf('&type=quiz&') > -1) {
					Module.Topics[j].Type = 'Quiz';
				} else if (Module.Topics[j].Url.indexOf('&type=checklist&') > -1) {
					Module.Topics[j].Type = 'Checklist';
				} else if (Module.Topics[j].Url.indexOf('&type=selfassess&') > -1) {
					Module.Topics[j].Type = 'SelfAssessment';
				} else if (Module.Topics[j].Url.indexOf('&type=survey&') > -1) {
					Module.Topics[j].Type = 'Survey';
				}

				Module.Topics[j].Source = 'Internal';
			}
			// TypeIdentifier = 'Link' => check external link types
			else if (Module.Topics[j].TypeIdentifier == 'Link') {
				Module.Topics[j].Type = Module.Topics[j].Url.substr((~-Module.Topics[j].Url.lastIndexOf(".") >>> 0) + 2);
				Module.Topics[j].Source = 'External';
			}
			// TypeIdentifier = 'File' => check the file extension
			else if (Module.Topics[j].TypeIdentifier == 'File') {
				Module.Topics[j].Type = Module.Topics[j].Url.substr((~-Module.Topics[j].Url.lastIndexOf(".") >>> 0) + 2);
				Module.Topics[j].Source = 'Internal';
			} else {
				Module.Topics[j].Type = 'unknown';
				Module.Topics[j].Source = 'unknown';
			}
		}
	} else {
		// Create an empty array for Topics if undefined so it won't cause headaches later
		Module.Topics = [];
	}

	// Update the progress percentage
	Module.Progress.Percentage = (Module.Progress.Total == 0) ? 0 : Module.Progress.Read / Module.Progress.Total * 100;

	return Module;
};



/*
	CSVal.toc_addGrades
	- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	- Add associated grades to the TOC (Table of Contents)
*/
CSVal.toc_addGrades = function (Module) {
	var addToPrimary = false;

	// If no module was specified then clone the primary TOC object
	if (Module == undefined) {
		Module = CSVal.clone_toc();
		addToPrimary = true;
	}

	// If the grades or TOC are still being loaded then delay running this function
	if (CSVal.t_toc.timestamp === null) {
		pubsubz.subscribe('csval/get_toc', CSVal.toc_addGrades);
		CSVal.get_toc();
		return false;
	}
	if (CSVal.t_grades.timestamp === null) {
		pubsubz.subscribe('csval/get_grades', CSVal.toc_addGrades);
		CSVal.get_grades();
		return false;
	}

	// Recursively check submodules
	if (Module.Modules !== undefined) {
		for (var i = 0; i < Module.Modules.length; i++) {
			Module.Modules[i] = CSVal.toc_addGrades(Module.Modules[i]);
		}
	}

	// Checks each topic's name against the name of each grade object
	// Adds Grade property to the topic if the names match 
	if (Module.Topics !== undefined) {
		for (var j = 0; j < Module.Topics.length; j++) {
			for (var k = 0; k < CSVal.grades.length; k++) {
				if (Module.Topics[j].Title == CSVal.grades[k].GradeObjectName) {
					Module.Topics[j].Grade = CSVal.grades[k];
				}
			}
		}
	}

	// if the grades are being added to the primary TOC (default) then do so and return true
	if (addToPrimary) {
		CSVal.toc = Module;
		pubsubz.publish('csval/toc_addGrades');
		return true;
	}
	// else a module was defined so return the module
	else {
		return Module;
	}
};



/*
	CSVal.toc_filter
	- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	- Return a filtered version of the ToC (Table of Contents)
	- FilterMethod can be defined as 'title' or 'type'
	- FilterTags is an array with keywords to be searched for or file types desired
*/
CSVal.toc_filter = function (FilterMethod, FilterTags, Module) {
	if (FilterMethod == undefined) return false;
	if ((FilterTags == undefined) || (typeof FilterTags !== 'object') || (FilterTags instanceof Array !== true))
		return false;
	if (Module == undefined) {
		Module = (JSON.parse(JSON.stringify(CSVal.toc), JSON.dateParser));
		console.warning('no module provided');
	}

	var subModuleCheck = false;
	var filteredTopics = [];
	var searchString = '';
	var targetString = '';

	// Recursively check submodules
	if (Module.Modules !== undefined) {
		for (var i = 0; i < Module.Modules.length; i++) {
			var returned = CSVal.toc_filter(FilterMethod, FilterTags, Module.Modules[i]);
			if (returned !== false) {
				Module.Modules[i] = returned;
				subModuleCheck = true;
			} else {
				Module.Modules.splice(i, 1);
				i--;
			}
		}
	}

	if (Module.Topics !== undefined) {
		for (var j = 0; j < Module.Topics.length; j++) {
			for (var k = 0; k < FilterTags.length; k++) {
				targetString = FilterTags[k].toLowerCase();
				// Filter by title string
				if (FilterMethod.toLowerCase() == 'title') {
					searchString = Module.Topics[j].Title.toLowerCase();
					if (searchString.indexOf(targetString) > -1) {
						filteredTopics.push(Module.Topics[j]);
					}
				}
				// Filter by activity/file type
				else if (FilterMethod.toLowerCase() == 'type') {
					searchString = Module.Topics[j].Type.toLowerCase();
					if (searchString == targetString) {
						filteredTopics.push(Module.Topics[j]);
					}
				}
				// Undefined filter type
				else {
					return false;
				}
			}
		}
	}

	Module.Topics = filteredTopics;

	if ((subModuleCheck == false) && (Module.Topics.length == 0)) {
		return false; // no data to return
	}
	return Module;
};



/*
	CSVal.toc_toHTML
	- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	- Return the specified ToC (Table of Contents) module as an unordered list
	- Defaults to root ToC for the given context if no ToC module is specified
*/
CSVal.toc_toHTML = function (Module, recursiveFlag) {
	var topLayer = false;
	if (Module == undefined) {
		if ((CSVal.toc === undefined) || (CSVal.toc.Modules === undefined)) {
			console.error('Table of Contents has not been loaded before calling CSVal.toc_toHTML');
			return "";
		}
		Module = CSVal.toc;
		topLayer = true;
	} else if (recursiveFlag == undefined) {
		topLayer = true;
	}

	var htmlList = "";

	if (topLayer == false) {
		htmlList += '<li class="toc-module toc-module-expanded" data-read="' + Module.Progress.Read + '" data-total="' + Module.Progress.Total + '">';
		if (Module.Title !== undefined) {
			htmlList += '<div class="toc-module-title">' + Module.Title + '</div>';
		}
		htmlList += '\n<ul>\n';
	} else {
		htmlList += '<ul>\n';
	}

	// Recursively format submodules
	if (Module.Modules !== undefined) {
		for (var i = 0; i < Module.Modules.length; i++) {
			if (Module.Modules[i].Title !== undefined) {
				htmlList += CSVal.toc_toHTML(Module.Modules[i], true);
			}
		}
	}

	if (Module.Topics !== undefined) {
		for (var j = 0; j < Module.Topics.length; j++) {
			var target = unread = type = grade = '';
			if (Module.Topics[j].Source == 'External') {
				target = ' target="_blank"';
			}
			if (Module.Topics[j].Unread == true) {
				unread = ' toc-topic-unread';
			}
			if ((Module.Topics[j].TypeIdentifier == 'Link') && (Module.Topics[j].Source == 'Internal')) {
				type = ' toc-type-d2l-' + Module.Topics[j].Type;
			} else if (Module.Topics[j].TypeIdentifier == 'Link') {
				type = ' toc-type-link';
			} else {
				type = ' toc-type-file-' + Module.Topics[j].Type;
			}
			if (Module.Topics[j].Grade !== undefined) {
				grade = '<span class="toc-topic-grade">' + Module.Topics[j].Grade.DisplayedGrade + '</span>';
			}
			htmlList += '<li class="toc-topic' + unread + type + '"><a href="' + Module.Topics[j].Url + '"' + target + '>' + Module.Topics[j].Title + '</a>' + grade + '</li>\n';
		}
	}

	if (topLayer == false) {
		htmlList += '</ul>\n</li>\n';
	} else {
		htmlList += '</ul>\n';
	}

	if (topLayer == true) {
		// search for the first topic with a toc-topic-unread class and mark it as the next unread topic
		htmlList = htmlList.replace('toc-topic-unread', 'toc-topic-unread toc-topic-next');
	}

	if (htmlList.indexOf('toc-topic') == -1) {
		return '';
	} else {
		return htmlList;
	}
};



/*
	CSVal.toc_nextUnread
	- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	- Return the topic details of the next unread item in the ToC, or false if all are read
*/
CSVal.toc_nextUnread = function (Module, startModule) {
	if (Module == undefined) Module = CSVal.toc;

	if (startModule !== undefined) {
		if (typeof startModule !== 'number') {
			return false;
		}
	} else {
		startModule = 0;
	}

	// Recursively check sub-modules
	// Note: At this time we must assume that sub-modules are ordered before topics within the current
	// level as Valence is not able to provide us with ordering details.
	if (Module.Modules !== undefined) {
		for (i = startModule; i < Module.Modules.length; i++) {
			topicID = CSVal.toc_nextUnread(Module.Modules[i]);
			if (topicID !== false) {
				return topicID;
			}
		}
	}

	// Check topics within this module level
	if (Module.Topics !== undefined) {
		for (var j = 0; j < Module.Topics.length; j++) {
			if (Module.Topics[j].Unread == true) {
				return Module.Topics[j];
			}
		}
	}

	// If no unread results can be found return false
	return false;
}




/*
	CSVal.news_toHTML
	- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	- Return the specified News objects as an unordered list
	- Defaults to primary News array for the given context if no input is provided
*/
CSVal.news_toHTML = function (News) {
	if (News == undefined) {
		if ((CSVal.news === undefined) || (CSVal.news.length == 0)) {
			console.warn('News has not been loaded (or no news exists) before calling CSVal.news_toHTML');
			return '';
		}
		News = CSVal.news;
	}

	var htmlList = '<ul>\n';

	// Format each news item
	for (var i = 0; i < News.length; i++) {
		if (News[i].IsHidden == false) {
			var attachments = "";
			if ((News[i].Attachments !== undefined) && (News[i].Attachments.length > 0)) {
				attachments = '<ul class="news-attachments">\n';
				for (var j = 0; j < News[i].Attachments.length; j++) {
					var size = News[i].Attachments[j].Size;
					var sizeText = "";
					if (size / (1024 * 1024 * 1024) > 1) {
						sizeText = Math.round(size / (1024 * 1024 * 1024)) + "GB";
					} else if (size / (1024 * 1024) > 1) {
						sizeText = Math.round(size / (1024 * 1024)) + "MB";
					} else if (size / 1024 > 1) {
						sizeText = Math.round(size / 1024) + "KB";
					} else {
						sizeText = size + " bytes";
					}




					fileURL = 'javascript:CSVal.get_newsFile(' + CSVal.context.ouID + ',' + News[i].Id + ',' + News[i].Attachments[j].FileId + ');'
					attachments += '<li class="news-attachment"><a href="' + fileURL + '">' + News[i].Attachments[j].FileName + '</a> (' + sizeText + ')</li>\n';
				}
				attachments += '</ul>\n';
			}
			htmlList += '<li class="news-item"><div class="news-head"><span class="news-title">' + News[i].Title + '</span><span class="news-date">' + News[i].StartDate.toLocaleDateString() + '</span> <span class="news-time">' + News[i].StartDate.toLocaleTimeString() + '</div>\n<div class="news-body">' + News[i].Body.Html + '</div>\n' + attachments + '</li>\n';


			/*								fileURL = CSVal.routes.get_newsFile.replace("ORGID", CSVal.context.ouID).replace("NEWSID", News[i].Id).replace("FILEID", News[i].Attachments[j].FileId);
								attachments += '<li class="news-attachment"><a href="' + fileURL + '" target="_blank">' + News[i].Attachments[j].FileName + '</a> (' + sizeText + ')</li>\n';
							}
							attachments += '</ul>\n';
						}
						htmlList += '<li class="news-item"><div class="news-head"><span class="news-title">' + News[i].Title + '</span><span class="news-date">' + News[i].StartDate.toLocaleDateString() + '</span> <span class="news-time">' + News[i].StartDate.toLocaleTimeString() + '</div>\n<div class="news-body">' + News[i].Body.Html + '</div>\n' + attachments + '</li>\n';
			*/

			// file links aren't working (above)
			// (10.3 SP13 -- 10.5.3) standard news tool in LE uses following format:
			//		/d2l/le/news/widget/6674/FileProvider?newsId=81&fileId=255
			// need to determine reliability of this route before proceeding



		}
	}

	htmlList += '</ul>\n';

	return htmlList;
};




/*
	CSVal.calendar_toHTML
	- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	- Return the specified Calendar objects as an unordered list
	- Defaults to primary Calendar array for the given context if no input is provided
*/
CSVal.calendar_toHTML = function (Calendar) {
	if (Calendar == undefined) {
		if ((CSVal.calendar === undefined) || (CSVal.calendar.length == 0)) {
			console.warn('Calendar has not been loaded (or no events exist) before calling CSVal.calendar_toHTML');
			return '';
		}
		Calendar = CSVal.calendar;
	}

	var monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	var htmlList = '<ul>\n';
	var linkType = '';

	// Format each news item
	for (var i = 0; i < Calendar.length; i++) {
		if (Calendar[i].AssociatedEntity !== null) {
			linkType = ' calendar-type-d2l-' + Calendar[i].AssociatedEntity.Type;
		} else {
			linkType = '';
		}
		htmlList += '<li class="calendar-item' + linkType + ' cf"><div class="calendar-day"><span class="calendar-month">' + monthsShort[Calendar[i].EndDateTime.getMonth()] + '</span><span class="calendar-date">' + Calendar[i].EndDateTime.getDate() + '</span></div><div class="calendar-details"><div class="calendar-title">' + Calendar[i].Title + '</div><div class="calendar-description">' + Calendar[i].Description + '</div><div class="calendar-type"></div></div></li>\n';
	}

	htmlList += '</ul>\n';

	return htmlList;
};








/*
	CSVal.calendar_filter
	- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	- Return a filtered version of the Calendar
	- Range represents how far backward (default: 0 days) and forward (default: 90 days) events should be from current day
	- FilterTags is an array with keywords to be searched for
	- FilterTypes is an array of event types to be searched for
*/
CSVal.calendar_filter = function (Range, FilterTags, FilterTypes, Calendar) {
	if ((FilterTags === undefined) || (typeof FilterTags !== 'object') || (FilterTags instanceof Array !== true)) {
		Range = [0, 90];
	}
	if ((FilterTags === undefined) || (typeof FilterTags !== 'object') || (FilterTags instanceof Array !== true)) {
		FilterTags = [];
	}
	if (Calendar === undefined) {
		if (CSVal.tsE_calendar === null) {
			return false;
			console.warn('CSVal.calendar_filter was called without first loading calendar information');
		}
		Calendar = (JSON.parse(JSON.stringify(CSVal.calendar), JSON.dateParser));
	}

	var filteredAge = filteredTags = filteredEvents = [];
	var now = new Date();
	var startDate = new Date(now.getTime() - (Range[0] * 86400000));
	var endDate = new Date(now.getTime() + (Range[1] * 86400000));

	// Filter by age of event
	for (var i = 0; i < Calendar.length; i++) {
		if (((Calendar[i].StartDateTime >= startDate) && (Calendar[i].StartDateTime < endDate)) ||
			((Calendar[i].EndDateTime > startDate) && (Calendar[i].EndDateTime <= endDate)) ||
			((Calendar[i].StartDateTime < startDate) && (Calendar[i].EndDateTime > endDate))) {
			filteredAge.push(Calendar[i]);
		}
	}

	// Filter by strings (tags) in the event name itself
	for (i = 0; i < filteredAge.length; i++) {
		for (var j = 0; j < FilterTags.length; j++) {
			if (filteredAge[i].Title.toLowerCase().indexOf(FilterTags[j].toLowerCase()) > -1) {
				filteredTags.push(filteredAge[i]);
			}
		}
	}

	for (i = 0; i < filteredTags.length; i++) {
		if (filteredTags[i].AssociatedEntity !== null) {
			for (j = 0; j < FilterTypes.length; j++) {
				if (filteredTags[i].AssociatedEntity.Type.toLowerCase() == FilterTypes[j].toLowerCase()) {
					filteredEvents.push(filteredTags[i]);
				}
			}
		}
	}

	return filteredEvents;
};



/*
	CSVal.news_filter
	- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	- Return a filtered version of the News
	- Age is the number of days of posts to display; default is 14
	- FilterTags is an array with keywords to be searched for
*/
CSVal.news_filter = function (Age, FilterTags, News) {
	if (Age === undefined) {
		Age = 14;
	}
	if ((FilterTags === undefined) || (typeof FilterTags !== 'object') || (FilterTags instanceof Array !== true)) {
		FilterTags = [];
	}
	if (News === undefined) {
		if (CSVal.tsE_news === null) {
			return false;
			console.warn('CSVal.news_filter was called without first loading news information');
		}
		News = (JSON.parse(JSON.stringify(CSVal.news), JSON.dateParser));
	}

	var filteredAge = filteredNews = [];
	var now = new Date();
	var testDate = new Date(now.getTime() - (Age * 86400000));

	// Filter by age of news entry, making sure not to display any news that has yet to be released or is hidden
	for (var i = 0; i < News.length; i++) {
		if ((News[i].StartDate >= testDate) && (News[i].StartDate <= now) && (News[i].IsHidden === false) && (News[i].IsPublished === true)) {
			filteredAge.push(News[i]);
		}
	}

	// Filter by entry title
	for (i = 0; i < FilterTags.length; i++) {
		for (var j = 0; j < filteredAge.length; j++) {
			if (filteredAge[j].Title.toLowerCase().indexOf(FilterTags[i].toLowerCase()) > -1) {
				filteredNews.push(filteredAge[j]);
			}
		}
	}

	return filteredNews;
};



/*
	CSVal.profile_edit
	- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	- Used to edit a field within the current user's profile
*/
CSVal.profile_edit = function (Field, Val) {
	var i;
	if (Field === undefined || Val === undefined) {
		console.warn('CSVal.profile_edit was called without providing enough data');
		return false;
	} else if (Field == 'Birthday') {
		if ((Val instanceof Array !== true) || (Val.length !== 2)) {
			console.warn('CSVal.profile_edit was called with invalid data');
			return false;
		}
		if ((((Val[0] == 4) || (Val[0] == 6) || (Val[0] == 9) || (Val[0] == 11)) && (Val[1] > 30)) ||
			((Val[0] == 2) && (Val[1] > 29)) ||
			(Val[0] < 1) || (Val[0] > 12) || (Val[1] > 31) || (Val[1] < 1)) {
			console.warn('CSVal.profile_edit was called with an invalid birthday value');
			return false;
		}
		CSVal.user.profile.Birthday.Month = Val[0];
		CSVal.user.profile.Birthday.Day = Val[1];
	} else if ((Field == 'Social_Facebook') && (Val.length < CSVal.params.profile_strings.Social_Facebook)) {
		for (i = 0; i < CSVal.user.profile.SocialMediaUrls; i++) {
			if (CSVal.user.profile.SocialMediaUrls[i].Name == 'Facebook') {
				CSVal.user.profile.SocialMediaUrls[i].Url = Val;
			}
		}
	} else if ((Field == 'Social_Twitter') && (Val.length < CSVal.params.profile_strings.Social_Twitter)) {
		for (i = 0; i < CSVal.user.profile.SocialMediaUrls; i++) {
			if (CSVal.user.profile.SocialMediaUrls[i].Name == 'Twitter') {
				CSVal.user.profile.SocialMediaUrls[i].Url = Val;
			}
		}
	} else if ((Field == 'Social_Google') && (Val.length < CSVal.params.profile_strings.Social_Google)) {
		for (i = 0; i < CSVal.user.profile.SocialMediaUrls; i++) {
			if (CSVal.user.profile.SocialMediaUrls[i].Name == 'Google') {
				CSVal.user.profile.SocialMediaUrls[i].Url = Val;
			}
		}
	} else if ((Field == 'Social_LinkedIn') && (Val.length < CSVal.params.profile_strings.Social_LinkedIn)) {
		for (i = 0; i < CSVal.user.profile.SocialMediaUrls; i++) {
			if (CSVal.user.profile.SocialMediaUrls[i].Name == 'LinkedIn') {
				CSVal.user.profile.SocialMediaUrls[i].Url = Val;
			}
		}
	} else if ((Field in CSVal.params.profile_strings) && (Val.length <= CSVal.params.profile_strings[Field])) {
		CSVal.user.profile[Field] = Val;
	} else {
		console.warn('CSVal.profile_edit was called with invalid data');
		return false;
	}
	return true;
};



/*
	CSVal.clone_toc
	- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	- Return a copy of the CSVal.toc object
*/
CSVal.clone_toc = function () {
	return (JSON.parse(JSON.stringify(CSVal.toc), JSON.dateParser));
}

/*
	CSVal.clone_grades
	- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	- Return a copy of the CSVal.grades object
*/
CSVal.clone_grades = function () {
	return (JSON.parse(JSON.stringify(CSVal.grades), JSON.dateParser));
}

/*
	CSVal.clone_news
	- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	- Return a copy of the CSVal.news object
*/
CSVal.clone_news = function () {
	return (JSON.parse(JSON.stringify(CSVal.news), JSON.dateParser));
}

/*
	CSVal.clone_calendar
	- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	- Return a copy of the CSVal.calendar object
*/
CSVal.clone_calendar = function () {
	return (JSON.parse(JSON.stringify(CSVal.calendar), JSON.dateParser));
}

/*
	CSVal.clone_profile
	- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	- Return a copy of the CSVal.user.profile object
*/
CSVal.clone_profile = function () {
	return (JSON.parse(JSON.stringify(CSVal.user.profile), JSON.dateParser));
}







/*
	CSVal.get_forums
	- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	- Add results to CSVal.disc object
	- Do not return data, but rather establish a subscription for the subsequent get_topics function
*/
CSVal.get_forums = function () {
	if (CSVal.tsS_discForums != null) return false;
	CSVal.tsS_discForums = new Date();

	// Takes the API route with the placeholder and replaces it with the proper ORGID
	CSVal.routes.get_forums = CSVal.routes.get_forums.replace("ORGID", CSVal.context.ouID);

	// This function will be followed by CSVal.get_topics
	pubsubz.subscribe('csval/get_forums', CSVal.get_topics);

	valence_req
		.get(CSVal.routes.get_forums)
		.use(valence_auth)
		.end(function (err, response) {
			if (err != null) {
				errorPrompt(err, CSVal.routes.get_forums, "alert");
				return false;
			}

			CSVal.disc.Forums = response.body;
			CSVal.disc.ForumsLoaded = 0;
			CSVal.disc.ForumsCalled = 0;

			CSVal.tsE_discForums = new Date();
			pubsubz.publish('csval/get_forums');
		});
}



/*
	CSVal.get_topics
	- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	- Add results to CSVal.disc object
	- Once all topic listings for all forums have been loaded publish event completion
	- Posts are not loaded by default to avoid LE stress should the post count be too high without filtering
*/
CSVal.get_topics = function () {
	// If no forums have been loaded yet, then start that sequence and attempt again
	if (CSVal.tsE_discForums === null) {
		pubsubz.subscribe('csval/get_forums', CSVal.get_topics);
		return false;
	}
	CSVal.tsS_discTopics = new Date();

	// Return a console warning if there are no forums
	if (CSVal.disc.Forums.length === 0) {
		console.warning('CSVal: There are no Discussion Forums associated with the current context.');
		return false;
	}

	var baseURL = CSVal.routes.get_topics.replace("ORGID", CSVal.context.ouID);
	var topicsURL;

	for (var i = 0; i < CSVal.disc.Forums.length; i++) {
		CSVal.disc.ForumsCalled++;
		CSVal.disc.Forums[i].Topics = new Array();
		topicsURL = baseURL.replace("FORUMID", CSVal.disc.Forums[i].ForumId);
		valence_req
			.get(topicsURL)
			.use(valence_auth)
			.end(function (err, response) {
				if (err != null) {
					errorPrompt(err, topicURL, "alert");
					return false;
				}

				// Add the Topics to the associated Forum object
				var holdTopics = response.body;
				if (holdTopics.length > 0) {
					var forumID = holdTopics[0].ForumId;
					for (var j = 0; j < CSVal.disc.Forums.length; j++) {
						if (CSVal.disc.Forums[j].ForumId == forumID) {
							CSVal.disc.Forums[j].Topics = holdTopics;
							for (var k = 0; k < CSVal.disc.Forums[j].Topics.length; k++) {
								// If IgnorePosts is true, get_posts will not pull posts for this topic
								//		- Default to true, assuming some filtering will take place, or get_postsAll will be called
								CSVal.disc.Forums[j].Topics[k].IgnorePosts = true;
								CSVal.disc.Forums[j].Topics[k].UserPosts = 0;
								CSVal.disc.Forums[j].Topics[k].Posts = new Array();
								// PostsPage is used for keeping track of paginated results when getting posts
								CSVal.disc.Forums[j].Topics[k].PostsPage = 0;
							}
							break;
						}
					}
				}
				CSVal.disc.ForumsLoaded++;

				if ((CSVal.disc.ForumsCalled === CSVal.disc.Forums.length) && (CSVal.disc.ForumsCalled === CSVal.disc.ForumsLoaded) && (CSVal.tsE_discTopics === null)) {
					CSVal.tsE_discTopics = new Date();
					pubsubz.publish('csval/get_topics');
				}
			});
	}
}




/*
	CSVal.topic_filter
	- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	- Used to determine the forum/topics posts will be retrieved for based upon filter inputs
*/
CSVal.topic_filter = function (forumIDs, forumTitles, topicTitles) {
	if ((forumIDs === undefined) || (forumTitles === undefined) || (topicTitles === undefined)) {
		console.warn('CSVal.disc_filter was called without the proper parameters');
		return false;
	}
	// If no topics have been loaded yet, then start that sequence and return false
	// As get_topics will kickstart a request for missing forums, we do not need to test for those
	if (CSVal.tsE_discTopics === null) {
		pubsubz.subscribe('csval/get_topics', function (forumIDs, forumTitles, topicTitles) {
			CSVal.get_topics(forumIDs, forumTitles, topicTitles);
		});
		return false;
	}

	var i = j = x = 0;
	var searchString = targetString = "";

	for (i = 0; i < CSVal.disc.Forums.length; i++) {
		// Search for matching forumIDs
		for (x = 0; x < forumIDs.length; x++) {
			if (CSVal.disc.Forums[i].ForumId === forumIDs[x]) {
				for (j = 0; j < CSVal.disc.Forums[i].Topics.length; j++) {
					CSVal.disc.Forums[i].Topics[j].IgnorePosts = false;
				}
			}
		}
		// Search for forum title containing the specified patterns
		for (x = 0; x < forumTitles.length; x++) {
			searchString = CSVal.disc.Forums[i].Name.toLowerCase();
			targetString = forumTitles[x].toLowerCase();
			if (seachString.indexOf(targetString) > -1) {
				for (j = 0; j < CSVal.disc.Forums[i].Topics.length; j++) {
					CSVal.disc.Forums[i].Topics[j].IgnorePosts = false;
				}
			}
		}
		// Search for topic titles containing the specified patterns
		for (j = 0; j < CSVal.disc.Forums[i].Topics.length; j++) {
			searchString = CSVal.disc.Forums[i].Topics[j].Name.toLowerCase();
			for (x = 0; x < topicTitles.length; x++) {
				targetString = topicTitles[x].toLowerCase();
				if (searchString.indexOf(targetString) > -1) {
					CSVal.disc.Forums[i].Topics[j].IgnorePosts = false;
				}
			}
		}
	}
	return true;
}




/*
	CSVal.get_posts
	- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	- Add results to CSVal.disc object
	- Once all posts for all topics (that do not have IgnorePosts == true value) have been loaded publish event completion
	- Posts are grabbed in batches of 1,000 per topic, unless a cap has been specified
*/
CSVal.get_posts = function (ForumId, TopicId) {
	
	CSVal.tsS_discPosts = new Date();

	// If the postLimit is greater than 1,000 then default the pageSize to 1,000 posts
	var pageSize = ((CSVal.disc.postLimit > 0) && (CSVal.disc.postLimit < 1000)) ? CSVal.disc.postLimit : 1000;

	var baseURL = CSVal.routes.get_posts.replace("ORGID", CSVal.context.ouID);
	var postsURL = baseURL.replace("FORUMID", ForumId).replace("TOPICID", TopicId);

	valence_req
		.get(postsURL)
		.use(valence_auth)
		.end(function (err, response) {
			if (err != null) {
				errorPrompt(err, postsURL, "alert");
				return false;
			}
			else {
				pubsubz.publish('csval/get_posts/'+ForumId+'/'+TopicId, {ForumId:ForumId, TopicId:TopicId, PostsObj:response.body});
			}
			
		});


}



/*
	CSVal.set_postLimit
	- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	- Set a limit for the number of posts which will be retrieve for each topic
	- The default is 0 (unlimited) which will gather all posts within a topic
*/
CSVal.set_postLimit = function (newLimit) {
	if ((newLimit === undefined) || (typeof newLimit !== 'number') || (newLimit < 0)) {
		newLimit = 0;
	}
	CSVal.disc.postLimit = Math.round(newLimit);
}




CSVal.disc_toHTML = function (age, limit, forumIDs, forumTitles, topicTitles) {
	// If no topics have been loaded yet, then start that sequence and return false
	if (CSVal.tsE_discTopics === null) {
		pubsubz.subscribe('csval/get_topics', CSVal.get_posts);
		return false;
	}



	var i = j = x = 0;
	var searchString = targetString = "";

	for (i = 0; i < CSVal.disc.Forums.length; i++) {
		// Search for matching forumIDs
		for (x = 0; x < forumIDs.length; x++) {
			if (CSVal.disc.Forums[i].ForumId === forumIDs[x]) {
				for (j = 0; j < CSVal.disc.Forums[i].Topics.length; j++) {
					CSVal.disc.Forums[i].Topics[j].IgnorePosts = false;
				}
			}
		}
		// Search for forum title containing the specified patterns
		for (x = 0; x < forumTitles.length; x++) {
			searchString = CSVal.disc.Forums[i].Name.toLowerCase();
			targetString = forumTitles[x].toLowerCase();
			if (seachString.indexOf(targetString) > -1) {
				for (j = 0; j < CSVal.disc.Forums[i].Topics.length; j++) {
					CSVal.disc.Forums[i].Topics[j].IgnorePosts = false;
				}
			}
		}
		// Search for topic titles containing the specified patterns
		for (j = 0; j < CSVal.disc.Forums[i].Topics.length; j++) {
			searchString = CSVal.disc.Forums[i].Topics[j].Name.toLowerCase();
			for (x = 0; x < topicTitles.length; x++) {
				targetString = topicTitles[x].toLowerCase();
				if (searchString.indexOf(targetString) > -1) {
					CSVal.disc.Forums[i].Topics[j].IgnorePosts = false;
				}
			}
		}
	}




}

CSVal.disc_latestToHTML = function (limit, forumIDs, forumTitles, topicTitles) {
	// If no topics have been loaded yet, then start that sequence and return false
	if (CSVal.tsE_discTopics === null) {
		pubsubz.subscribe('csval/get_topics', CSVal.get_posts);
		return false;
	}

}



/*!
 * Pub/Sub implementation
 * http://addyosmani.com/
 * Licensed under the GPL
 * http://jsfiddle.net/LxPrq/
 *
 * Note: This code has been minified
 */

! function (n) {
	var u = {},
		t = -1,
		r = {};
	r.publish = function (n, t) {
		if (CSVal.devMode == true) {
			console.log('published: ' + n);
		}
		return u[n] ? (setTimeout(function () {
			for (var r = u[n], e = r ? r.length : 0; e--;) r[e].func(t)
		}, 0), !0) : !1
	}, r.subscribe = function (n, r) {
		u[n] || (u[n] = []);
		var e = (++t).toString();
		return u[n].push({
			token: e,
			func: r
		}), e
	}, r.unsubscribe = function (n) {
		for (var t in u)
			if (u[t])
				for (var r = 0, e = u[t].length; e > r; r++)
					if (u[t][r].token === n) return u[t].splice(r, 1), n;
		return !1
	}, getPubSubz = function () {
		return r
	}, n.pubsubz = getPubSubz()
}(this, this.document);


/*
 * JSON Date Extensions - JSON date parsing extensions
 * Version 1.2.1
 * https://github.com/RickStrahl/json.date-extensions
 * (c) 2013-2015 Rick Strahl, West Wind Technologies
 *
 * Released under MIT License
 * http://en.wikipedia.org/wiki/MIT_License
 */
if (window.JSON && !window.JSON.dateParser) {
	var reISO = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*))(?:Z|(\+|-)([\d|:]*))?$/;

	JSON.dateParser = function (key, value) {
		if (typeof value === 'string') {
			var a = reISO.exec(value);
			if (a)
				return new Date(value);
		}
		return value;
	};
}
