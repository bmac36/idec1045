/* Custom Inline Assessment */

var CSVal, pubsubz, valence_req, valence_auth, errorPrompt;
var DiscTitle = ["Personal Reflections","Stop and Reflect"];
var DiscTitleIndex = -1;
var DiscussForID = -1;
var DiscussTopID = -1;

var FeedbackOptions = [];
var FeedbackSelected = -1;

var numTopicPostsChecked = 0;

CSVal.post_post = function(ForID, TopID, postObj) {

   var newroute = CSVal.routes.post_post;
   newroute = newroute.replace("ORGID", CSVal.context.ouID);
   newroute = newroute.replace("TOPICID", TopID);
   newroute = newroute.replace("FORUMID", ForID);

   valence_req
      .post(newroute)
      .send(postObj)
      .use(valence_auth)
      .end(function(err, response) {
         if (err !== null) {
            errorPrompt(err, newroute, "alert");
            return false;
         } else {

            for (var f = 0; f < FeedbackOptions.length; f++) {
               if (ForID === FeedbackOptions[f].ForumId) {
                  if (TopID === FeedbackOptions[f].TopicId) {
                     FeedbackOptions[f].MyPosts.push(response.body);
                  }
               }
            }

            setTimeout(function() {
               $("#feedbackconfirm").html("Saved: " + processDate(response.body.DatePosted));
               submitInit();
               $("#feedbacksubmit").removeClass("disabled");
            }, 2000);
         }
      });
};

CSVal.update_post = function(ForID, TopID, PostID, postObj) {

   var newroute = CSVal.routes.update_post;
   newroute = newroute.replace("ORGID", CSVal.context.ouID);
   newroute = newroute.replace("TOPICID", TopID);
   newroute = newroute.replace("FORUMID", ForID);
   newroute = newroute.replace("POSTID", PostID);

   valence_req
      .put(newroute)
      .send(postObj)
      .use(valence_auth)
      .end(function(err) {
         if (err !== null) {
            errorPrompt(err, newroute, "alert");
            return false;
         } else {
            setTimeout(function() {
               var today = new Date();
               $("#feedbackconfirm").html("Saved: " + processDate(today));
               submitInit();
               $("#feedbacksubmit").removeClass("disabled");
            }, 2000);
         }
      });
};


function submitInit() {
	
   $("#feedbacksubmit").click(function() {
      $("#feedbacksubmit").unbind("click");
      $("#feedbacksubmit").addClass("disabled");
      var newpost;
      var updatepost;
      var isanon;
      var catselected;

      catselected = parseInt($("#feedbackcat option:selected").attr("data-topid"));

      if (catselected > -1) {
         DiscussTopID = catselected;
      }

      if ($("#feedbacktext").val().length > 0) {

         isanon = $("#suggestionanon").prop("checked");

         newpost = {
            "ParentPostId": null,
            "Subject": CSVal.user.FirstName+" "+CSVal.user.LastName+"'s Reflection",
            "Message": {
               "Content": $("#feedbacktext").val(),
               "Type": "Text"
            },
            "IsAnonymous": false
         }

         updatepost = {
            "Subject": CSVal.user.FirstName+" "+CSVal.user.LastName+"'s Reflection",
            "Message": {
               "Content": $("#feedbacktext").val(),
               "Type": "Text"
            },
         }

         var existingPostNum = -1;
         for (var f = 0; f < FeedbackOptions.length; f++) {
            if (DiscussForID === FeedbackOptions[f].ForumId) {
               if (DiscussTopID === FeedbackOptions[f].TopicId) {

                  if (FeedbackOptions[f].MyPosts.length > 0) {
                     FeedbackOptions[f].MyPosts[0].Message.Text = $("#feedbacktext").val();
                     existingPostNum = FeedbackOptions[f].MyPosts[0].PostId;
                  }
               }
            }
         }


         if (existingPostNum > -1) {
            CSVal.update_post(DiscussForID, DiscussTopID, existingPostNum, updatepost);
         } else {
            CSVal.post_post(DiscussForID, DiscussTopID, newpost);
         }

      } else {
         submitInit();
         $("#feedbacksubmit").removeClass("disabled");
      }

   });
}


pubsubz.subscribe('csval/init', function() {

   if (DiscTitle.length > 0) {
      CSVal.get_forums();
   } else {
      $("#inlinefeedback").css("display", "block");
   }

});

pubsubz.subscribe('csval/get_topics', function() {
   var forumindex = -1;
   var topicindex = -1;
   for (var i = 0; i < CSVal.disc.Forums.length; i++) {
	   for(var d=0; d<DiscTitle.length; d++) {
		   if(CSVal.disc.Forums[i].Name === DiscTitle[d]) {

			    DiscTitleIndex = d;
			   	forumindex = i;			   
		   }
		  
	   }
	  if(DiscTitleIndex > -1) {
		 DiscussForID = CSVal.disc.Forums[i].ForumId;
		 for (var j = 0; j < CSVal.disc.Forums[i].Topics.length; j++) {
			if (CSVal.disc.Forums[i].Topics[j].Name === window.parent.$(".d2l-page-header .d2l-page-title").text()) {
			   topicindex = j;
			   pubsubz.subscribe('csval/get_posts/' + DiscussForID + '/' + CSVal.disc.Forums[i].Topics[j].TopicId, function(ReturnObj) {
				  numTopicPostsChecked += 1;
				  var MyPosts = []
				  for (var p = 0; p < ReturnObj.PostsObj.length; p++) {
					 if (CSVal.user.Identifier === (String(ReturnObj.PostsObj[p].PostingUserId)) && !(ReturnObj.PostsObj[p].IsDeleted)) {
						MyPosts.push(ReturnObj.PostsObj[p]);
					 }
				  }

				  for (var f = 0; f < FeedbackOptions.length; f++) {
					 if (FeedbackOptions[f].ForumId === ReturnObj.ForumId) {
						if (FeedbackOptions[f].TopicId === ReturnObj.TopicId) {
						   FeedbackOptions[f].MyPosts = MyPosts;
						}
					 }
				  }

				  populateFeedback(FeedbackSelected);

			   });

			   CSVal.get_posts(DiscussForID, CSVal.disc.Forums[i].Topics[j].TopicId);

			   if (FeedbackSelected === -1) {
				  FeedbackSelected = CSVal.disc.Forums[i].Topics[j].TopicId;
			   }

			   var newFeedbackOption = { ForumId: DiscussForID, TopicId: CSVal.disc.Forums[i].Topics[j].TopicId, MyPosts: [] };
			   FeedbackOptions.push(newFeedbackOption);
			   $("#feedbackcat").append('<option data-topid="' + CSVal.disc.Forums[i].Topics[j].TopicId + '">' + CSVal.disc.Forums[i].Topics[j].Name + '</option>');

			}

		 }

	  } 

   }

   if (forumindex > -1 && topicindex > -1) {
	  $(".reflect-fallback").css("display", "none");
      $("#feedbackcat").css("display", "none");
      $("#feedbacktitle").html(DiscTitle[DiscTitleIndex]);   
      $("#discdesc").html(CSVal.disc.Forums[forumindex].Description.Html + CSVal.disc.Forums[forumindex].Topics[topicindex].Description.Html);
      $("#inlinefeedback").css("display", "block");
      submitInit();
   } else {
	  $(".reflect-fallback").css("display", "block");
      $("#inlinefeedback").css("display", "none");
   }

});


function populateFeedback(TopicId) {
   if (TopicId === null) {
      if (FeedbackOptions[0].MyPosts.length > 0) {
         $("#feedbacktext").val(FeedbackOptions[0].MyPosts[0].Message.Html.replace(/(<([^>]+)>)/ig, ""));
      }
   } else {
      var findex = -1;
      for (var f = 0; f < FeedbackOptions.length; f++) {
         if (FeedbackOptions[f].TopicId === TopicId) {
            findex = f;
         }
      }

      if (findex > -1) {
         if (FeedbackOptions[findex].MyPosts.length > 0) {

            if (FeedbackOptions[findex].MyPosts[0].Message.Text !== "") {
               $("#feedbacktext").val(FeedbackOptions[findex].MyPosts[0].Message.Text);
            } else {
               $("#feedbacktext").val(FeedbackOptions[findex].MyPosts[0].Message.Html.replace(/(<([^>]+)>)/ig, ""));
            }

            if (FeedbackOptions[findex].MyPosts[0].LastEditDate !== null) {
               $("#feedbackconfirm").html("Saved: " + processDate(FeedbackOptions[findex].MyPosts[0].LastEditDate));
            } else {
               $("#feedbackconfirm").html("Saved: " + processDate(FeedbackOptions[findex].MyPosts[0].DatePosted));
            }


         } else {
            $("#feedbacktext").val("");
         }
      } else {
         $("#feedbacktext").val("");
      }
   }

}


$("#feedbackcat").change(function() {
   FeedbackSelected = parseInt($("#feedbackcat option:selected").attr("data-topid"));
   populateFeedback(FeedbackSelected);
});



// Process Date String
function processDate(dateString) {

   var dayArray = [];
   dayArray[0] = 'Sun';
   dayArray[1] = 'Mon';
   dayArray[2] = 'Tue';
   dayArray[3] = 'Wed';
   dayArray[4] = 'Thu';
   dayArray[5] = 'Fri';
   dayArray[6] = 'Sat';
   var monthArray = [];
   monthArray[0] = 'January';
   monthArray[1] = 'February';
   monthArray[2] = 'March';
   monthArray[3] = 'April';
   monthArray[4] = 'May';
   monthArray[5] = 'June';
   monthArray[6] = 'July';
   monthArray[7] = 'August';
   monthArray[8] = 'September';
   monthArray[9] = 'October';
   monthArray[10] = 'November';
   monthArray[11] = 'December';

   var postDateObj = new Date(dateString);
   var weekDay = dayArray[postDateObj.getDay()];
   var month = monthArray[postDateObj.getMonth()];
   var monthDay = postDateObj.getDate();
   var year = postDateObj.getFullYear();
   var minutes = postDateObj.getMinutes();

   if (minutes < 10) {
      minutes = "0" + minutes;
   }

   var hours;
   var amPm;

   if (postDateObj.getHours() > 11) {
      hours = postDateObj.getHours() - 12;
      if (hours === 0) {
      	hours = 12;
      }
      amPm = 'pm';
   } else {
      hours = postDateObj.getHours();
      amPm = 'am';
   }

   if (hours === 0) {
      hours = 12;
   }
   var postDate = weekDay + ' ' + month + ' ' + monthDay + ', ' + year + ' | ' + hours + ':' + minutes + amPm;
   return postDate;

}

CSVal.init();
