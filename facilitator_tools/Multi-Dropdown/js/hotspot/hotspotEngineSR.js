/**
* 
* File : hotspotEngineSR.js
* 
* Project : Vanilla - Hot Spot Tool 
* 
* Author : Justin Schlumkoski
* 
* Created : 06/15/2015
*
* Last Modified : 06/16/2015
* 
* Description : This is the engine that builds a hot spot activity using a user-created data file for screen readers.
*
*/

/**
 * Variable: HotSpotApp
 * 
 * Contains HotSpotApp's properties
 * 
 * AppData - Holds the parsed JSON data. Object.
 * sceneNum - Holds the current scene number. Integer.
 * maxScenes - Holds the max number of allowed scenes. Integer.
 * containerRef - Holds the id of the container for the activity. String.
 * mobileDevice - Holds whether or not the activity is being accessed on a mobile device. Boolean.
 * currentAttempts - Holds the number of times the activity has been played. Integer.
 * allCompleted - Holds whether or not each hot spot has been completed. Array.
 * correctCheck - Holds whether or not each hot spot has been answered correctly. Array.
 */
var HotSpotApp = {
	AppData : null,
	sceneNum: 0,
	maxScenes : null,
	containerRef : null,
	mobileDevice : false,
	currentAttempts: 0,
	questionNumber: 1,
	allCompleted: [],
	correctCheck: []
}

/**
 * Function: resetActivityData
 * 
 * Resets specified properties to their default values.
 * 
 */
HotSpotApp.resetActivityData = function(){
	HotSpotApp.allCompleted = [];
	HotSpotApp.correctCheck = [];
}	

/**
 * Function: setupApp
 * 
 * Establishes the JSON text file path, the id of the container that houses the activity, and makes a call to get the activity data.
 * 
 * Parameters:
 * 
 *   file     - String
 *   location - String
 * 
 */
HotSpotApp.setupApp = function(file, location){
	questionFile = file;

	if (document.getElementById(location) !== null)
	{
		HotSpotApp.containerRef = document.getElementById(location);
		HotSpotApp.getAppData(HotSpotApp.buildApp);
	}
	else 
	{
		console.log("Error! Missing Proper DOM object.");
	}
}

/**
 * Function: getAppData
 * 
 * Retrieves the activity data from the JSON text file, passes that data to build the activity.
 * 
 * Parameters:
 * 
 *   callback - Function
 * 
 */
HotSpotApp.getAppData = function(callback) {
  var jqxhr = $.getJSON(questionFile, function(data) {
    HotSpotApp.AppData = data;
    callback(HotSpotApp.AppData)
  });

  // if the json data fails inform the users ang give some data to developers using the debug console.
  jqxhr.fail(function(e){
    console.log("ERROR!!: failed to load data from specified file. Ensure file is at that location and that JSON data is vaild. (tip: use a vaildator like: http://jsonformatter.curiousconcept.com/ )")
    console.log(e)
  });	
}

/**
 * Function: buildApp
 * 
 * Checks if the activity is being accessed on a mobile device, sets up other necessary things for the entire activity.
 * 
 */
HotSpotApp.buildApp = function() {
	if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
 		HotSpotApp.mobileDevice = true;
	}

	if(parseInt(HotSpotApp.AppData.ShowScenes) > HotSpotApp.AppData.Scenes.length) {
		HotSpotApp.maxScenes = HotSpotApp.AppData.Scenes.length;
	}
	else {
		HotSpotApp.maxScenes = parseInt(HotSpotApp.AppData.ShowScenes);
	}
	
	HotSpotApp.Scenes = HotSpotApp.AppData.Scenes;

	HotSpotApp.buildAppFrame();
	HotSpotApp.buildPreActivity();

	for (var i = 0; i < HotSpotApp.Scenes.length; i++){
		HotSpotApp.buildActivity(i);
	}
	HotSpotApp.buildPostActivity();
}

/**
 * Function: buildAppFrame
 * 
 * Sets up the inital containers for the app.
 * 
 */
HotSpotApp.buildAppFrame = function(){
	var HS_container = document.createElement("section");
	HS_container.id = "HS_container";
	//HS_container.title = "Activity Container"

	var HS_content = document.createElement("section");
	HS_content.id = "HS_content";
	//HS_content.title = "Activity Content"

	var HS_header  = document.createElement("section");
	HS_header.id = "HS_header";
	//HS_header.title = "Activity Heading";
	HS_header.innerHTML = "<h1>" + HotSpotApp.AppData.ActivityName + "</h1>";

	HS_container.appendChild(HS_content);
	HS_content.appendChild(HS_header);
	$(HS_container).appendTo(HotSpotApp.containerRef);
}

/**
 * Function: buildPreActivity
 * 
 * Builds the pre activity inside of the content container.
 * 
 */
HotSpotApp.buildPreActivity = function() {
	var HS_pageCont = document.createElement("div");
	HS_pageCont.setAttribute("class", "HS_pageCont");
	HS_content.appendChild(HS_pageCont);

	var HS_pageHeader = document.createElement("h2");
	HS_pageHeader.setAttribute("class", "HS_pageHeader");
	HS_pageHeader.innerHTML = "Pre Activity Page Content";
	HS_pageCont.appendChild(HS_pageHeader);

	if (HotSpotApp.AppData.Randomize == true){
		HotSpotApp.shuffle(HotSpotApp.Scenes);
	}

	if (HotSpotApp.AppData.PreActivityText != "none"){
		var HS_preActivityText = document.createElement("p");
		HS_preActivityText.id = "HS_preActivityText";
		HS_preActivityText.innerHTML = HotSpotApp.AppData.PreActivityText;
		HS_pageCont.appendChild(HS_preActivityText);
	}

	if (HotSpotApp.AppData.PreActivityMedia != "none"){
		for (var i = 0; i < HotSpotApp.AppData.PreActivityMedia.length; i++){
      		HotSpotApp.EmbedMedia("page", HS_pageCont, HotSpotApp.AppData.PreActivityMedia[i]);
		}
	}	
}

/**
 * Function: buildPostActivity
 * 
 * Builds the post activity inside of the content container.
 * 
 */
HotSpotApp.buildPostActivity = function() {
	var HS_pageCont = document.createElement("div");
	HS_pageCont.setAttribute("class", "HS_pageCont");
	HS_content.appendChild(HS_pageCont);

	var HS_pageHeader = document.createElement("h2");
	HS_pageHeader.setAttribute("class", "HS_pageHeader");
	HS_pageHeader.innerHTML = "Post Activity Page Content";
	HS_pageCont.appendChild(HS_pageHeader);

	if (HotSpotApp.AppData.PostActivityText != "none"){
		var HS_postActivityText = document.createElement("p");
		HS_postActivityText.id = "HS_postActivityText";
		HS_postActivityText.innerHTML = HotSpotApp.AppData.PostActivityText;
		HS_pageCont.appendChild(HS_postActivityText);
	}

	if (HotSpotApp.AppData.PostActivityMedia != "none"){
		for (var i = 0; i < HotSpotApp.AppData.PostActivityMedia.length; i++){
      		HotSpotApp.EmbedMedia("page", HS_pageCont, HotSpotApp.AppData.PostActivityMedia[i]);
		}
	}	
}

/**
 * Function: buildActivity
 * 
 * Builds each sceme and adds it to the content container.
 * 
 * Parameters:
 * 
 *   scene - Integer.
 */
HotSpotApp.buildActivity = function(scene){
	var HS_pageCont = document.createElement("div");
	HS_pageCont.setAttribute("class", "HS_pageCont");
	HS_content.appendChild(HS_pageCont);

	var HS_pageHeader = document.createElement("h2");
	HS_pageHeader.setAttribute("class", "HS_pageHeader");
	HS_pageHeader.innerHTML = "Activity " + (scene + 1) + ": " + HotSpotApp.Scenes[scene].SceneName;
	HS_pageCont.appendChild(HS_pageHeader);

	var HS_pageContext = document.createElement("p");
	HS_pageContext.setAttribute("class", "HS_pageContext");
	HS_pageContext.innerHTML = "<strong>Original Image: " + HotSpotApp.Scenes[scene].Background.alt + "</strong>";
	HS_pageCont.appendChild(HS_pageContext);

	for (var j = 0; j < HotSpotApp.Scenes[scene].HotSpotContent.length; j++){
		HotSpotApp.buildSceneContent(scene, j, HS_pageCont);
	}
}

/**
 * Function: buildSceneContent
 * 
 * Builds each content piece for each designated scene and adds them to the content container.
 * 
 * Parameters:
 * 
 *   scene - Integer.
 *   content - Integer.
 *   location - Object.
 * 
 */
HotSpotApp.buildSceneContent = function(scene, content, location) {
	var id = HotSpotApp.Scenes[scene].HotSpotContent[content].id;
	var header;
	var questionNum;
	var correctAnswer;

	//starts the inital set up of the pop up window by building the window container and adds it to the document
	var HS_questionCont = document.createElement("div");
	HS_questionCont.setAttribute("class", "HS_questionCont");

	$(HS_questionCont).appendTo(location);
	
	if (HotSpotApp.Scenes[scene].HotSpotContent[content].popUpName != null){
		header = "Interactive Element " + (content + 1) + ": " + HotSpotApp.Scenes[scene].HotSpotContent[content].popUpName;					
	}
	else {
		header = "Pop Up Activity";
	}

	//builds the container for the pop up's content, and adds it to the pop up
	var HS_question = document.createElement("div");
	HS_question.setAttribute("class", "HS_question");
	HS_questionCont.appendChild(HS_question);

	var HS_popUpHeader = document.createElement("h3");
	HS_popUpHeader.setAttribute("class", "HS_popUpHeader");
	HS_popUpHeader.innerHTML = header;
	HS_question.appendChild(HS_popUpHeader);

	var HS_popUpContext = document.createElement("p");
	HS_popUpContext.setAttribute("class", "HS_popUpContext");
	HS_popUpContext.innerHTML = "<strong>Element Description: " + HotSpotApp.Scenes[scene].HotSpots[content].desc + "</strong>";
	HS_question.appendChild(HS_popUpContext);


	if (HotSpotApp.Scenes[scene].HotSpotContent[content].activityType == "presentation"){
		var HS_activityType = document.createElement("h4");
		HS_activityType.setAttribute("class", "HS_activityType");
		HS_activityType.innerHTML = "Embedded Content:";
		HS_question.appendChild(HS_activityType);

		for (var i = 0; i < HotSpotApp.Scenes[scene].HotSpotContent[content].hotSpotMedia.length; i++){
			HotSpotApp.EmbedMedia("window", HS_question, HotSpotApp.Scenes[scene].HotSpotContent[content].hotSpotMedia[i]);
		}
	}
	//if the content is assessment type, it will build a multiple choice quiz based inside the pop up
	else if (HotSpotApp.Scenes[scene].HotSpotContent[content].activityType == "assessment"){
		var HS_activityType = document.createElement("h4");
		HS_activityType.setAttribute("class", "HS_activityType");
		HS_activityType.innerHTML = "Assessment Question:";
		HS_question.appendChild(HS_activityType);

		//saves the index number of the question to be used later
		questionNum = content;

		//loads and adds the question for the quiz to the pop up
		var HS_quizText = document.createElement("p");
		HS_quizText.setAttribute("class", "HS_quizText");
		HS_quizText.innerHTML = HotSpotApp.Scenes[scene].HotSpotContent[content].questionText;
		HS_question.appendChild(HS_quizText);

		//loads and adds the fieldset for the quiz to the pop up
		var HS_fieldSet = document.createElement("fieldset");
		HS_fieldSet.id = "HS_fieldSet" + HotSpotApp.questionNumber;
		HS_fieldSet.innerHTML = "<legend>Answers:</legend>";
		HS_question.appendChild(HS_fieldSet);


		//loads all of the answers for the quiz, builds the inputs for them, and adds them to the pop up
		for (var j = 0; j < HotSpotApp.Scenes[scene].HotSpotContent[content].answers.length; j++){
			//checks to see which answer is correct, and saves it's index for later
			if (HotSpotApp.Scenes[scene].HotSpotContent[content].answers[j].correct == true){
				correctAnswer = j;
			}

			var HS_answer = document.createElement("div");
			HS_answer.setAttribute("class", "HS_answer");

			var HS_input = document.createElement("input");
			HS_input.setAttribute("class", "HS_input");
			HS_input.setAttribute("type", "radio");
			HS_input.setAttribute("name", "qu" + HotSpotApp.questionNumber);
			HS_input.setAttribute("value", j);
			HS_input.id = "qu" + scene + content + j;

			var HS_label = document.createElement("label");
			HS_label.setAttribute("for", "qu" + scene + content + j);
			HS_label.setAttribute("class", "HS_label");
			HS_label.innerHTML = HotSpotApp.Scenes[scene].HotSpotContent[content].answers[j].answerText;

			HS_answer.appendChild(HS_input);
			HS_answer.appendChild(HS_label);
			HS_fieldSet.appendChild(HS_answer);
		}

		//builds the submit button for the pop up window (only gets built for assessment type pop ups)
		var HS_submitButton = document.createElement("button");
		HS_submitButton.id = "HS_submitButton" + HotSpotApp.questionNumber;
		HS_submitButton.setAttribute("class", "HS_popUpButton");
		HS_submitButton.setAttribute("title", "Submits your answer to the question");
		HS_submitButton.href = "#";
		HS_submitButton.onclick = function(){
			var num = this.id.substr(15);
			HotSpotApp.Eval(num, scene, content, this.parentNode, correctAnswer);					
		};

		//label for the submit button
		var HS_submitLabel = document.createElement("span");
    	HS_submitLabel.setAttribute("class", "HS_buttonLabel");
    	HS_submitLabel.innerHTML = "Submit Answer";

    	//adds the submit button to the pop up
    	HS_submitButton.appendChild(HS_submitLabel);
    	HS_question.appendChild(HS_submitButton);

    	//builds the reset button for the pop up window (only gets built for assessment type pop ups)
		var HS_resetQuestion = document.createElement("button");
		HS_resetQuestion.id = "HS_resetQuestion" + HotSpotApp.questionNumber;
		HS_resetQuestion.setAttribute("class", "HS_popUpButton");
		HS_resetQuestion.setAttribute("title", "Resets the question");
		HS_resetQuestion.href = "#";
		HS_resetQuestion.onclick = function(){
			var num = this.id.substr(16);
			HotSpotApp.Reset(num);					
		};

		//label for the submit button
		var HS_resetLabel = document.createElement("span");
    	HS_resetLabel.setAttribute("class", "HS_buttonLabel");
    	HS_resetLabel.innerHTML = "Reset Question";

    	//adds the submit button to the pop up
    	HS_resetQuestion.appendChild(HS_resetLabel);
    	HS_question.appendChild(HS_resetQuestion);
    	HS_resetQuestion.disabled = true;

    	HotSpotApp.questionNumber++;
	}
}

/**
 * Function: Eval
 * 
 * Evaluates the current multiple choice question, determines it's correctness, and provides any necessary feedback.
 * 
 * Parameters:
 * 
 *   num - Integer.
 *   scene - Integer.
 *   content - Integer.
 *   location - Object.
 *   correctAnswer - Integer.
 * 
 */
HotSpotApp.Eval = function(num, scene, content, location, correctAnswer){
	var idNum = $("#HS_fieldSet" + num).find('input[type="radio"]:checked').val();

	if (idNum != null){
		//loads the correct and wrong indicators for visual feedback
		var correct = "<img class=\"correct\" src=\"graphics/Right_16.png\" alt=\"right check mark\" disabled/>";
		var wrong = "<img class=\"wrong\" src=\"graphics/Wrong_16.png\" alt=\"wrong x\" disabled/>";

		//disables the submit button to prevent re-submits, and enables the reset question button
		document.getElementById("HS_submitButton" + num).disabled = true;
		document.getElementById("HS_resetQuestion" + num).disabled = false;
		$("#HS_resetQuestion" + num).focus();

		//checks to see if feedback needs to be provided, if so, it loads the feedback associated with the chosen answer and adds it to the pop up
		if (HotSpotApp.Scenes[scene].HotSpotContent[content].feedback == true && HotSpotApp.Scenes[scene].HotSpotContent[content].answers[idNum].feedback != "none"){
			var HS_feedback = document.createElement("p");
			HS_feedback.setAttribute("class", "HS_feedback");
			HS_feedback.innerHTML = "<strong>You Chose: " + HotSpotApp.Scenes[scene].HotSpotContent[content].answers[idNum].answerText +
									"</strong></br><strong>Correct Answer: " + HotSpotApp.Scenes[scene].HotSpotContent[content].answers[correctAnswer].answerText +
									"</strong></br><strong>Feedback: " + HotSpotApp.Scenes[scene].HotSpotContent[content].answers[idNum].feedback + "</strong>";

			location.appendChild(HS_feedback);
		}
		else {
			var HS_feedback = document.createElement("p");
			HS_feedback.setAttribute("class", "HS_feedback");
			HS_feedback.innerHTML = "<strong>You Chose: " + HotSpotApp.Scenes[scene].HotSpotContent[content].answers[idNum].answerText +
									"</strong></br><strong>Correct Answer: " + HotSpotApp.Scenes[scene].HotSpotContent[content].answers[correctAnswer].answerText +
									"</strong>";

			location.appendChild(HS_feedback);
		}

		//assigns the correct and wrong visual indicators
		$("#HS_fieldSet" + num + "> .HS_answer").each(function(index){
			if (index == correctAnswer){
				$(correct).appendTo(this);
			}
			else {
				$(wrong).appendTo(this);
			}
		});
	}
}

/**
 * Function: Reset
 * 
 * Resets the designated question and removes any feedback.
 * 
 * Parameters:
 * 
 *   num - Integer.
 * 
 */
HotSpotApp.Reset = function(num){
	//assigns the correct and wrong visual indicators
	$("#HS_fieldSet" + num + "> .HS_answer").each(function(){
		$(this.lastChild).remove();
		$(this.firstChild).removeAttr("checked");
	});

	var lastChild = document.getElementById("HS_fieldSet" + num).parentNode.lastChild;

	if($(lastChild).hasClass("HS_feedback")){
		lastChild.remove();
	}

	//disables the reset question button to prevent re-submits, and enables the submit question button
	document.getElementById("HS_submitButton" + num).disabled = false;
	document.getElementById("HS_resetQuestion" + num).disabled = true;
	$("#HS_submitButton" + num).focus();
}

/**
 * Function: EmbedMedia
 * 
 * Takes the passed object data and embeds it according to it's type and whether it's a pop up or pre/post activity content. 
 * 
 * Parameters:
 * 
 *   type         - String.
 *   containerRef - String.
 *   mediaData    - Object.
 * 
 */
HotSpotApp.EmbedMedia = function(type, containerRef, mediaData) {
    var mediaDomObj = document.createElement("div");
    mediaDomObj.setAttribute('class', 'HS_Media')

    switch(mediaData.type) {
      case "link":
          var mediaDomContent = document.createElement("a");
          mediaDomContent.setAttribute('class', 'HS_MediaLink');
          mediaDomContent.setAttribute('href', mediaData.src);
          mediaDomContent.setAttribute('target', "_blank");

          if(mediaData.description)
          {
            mediaDomContent.innerHTML = mediaData.description
          } else {
            mediaDomContent.innerHTML = "Link"
          }
          mediaDomObj.appendChild(mediaDomContent)
          break;

      case "audio":
      	  var mediaDomContent = document.createElement("audio");
      	  mediaDomContent.id = mediaData.id;
          mediaDomContent.setAttribute('class', 'HS_MediaAudio');
          mediaDomContent.setAttribute('target', "_blank");

          mediaDomContent.innerHTML = "<source src=\"" + mediaData.mp3 + "\" type=\"audio/mpeg\">" + 
          							  "<source src=\"" + mediaData.ogg + "\" type=\"audio/ogg\">" +
          							  "<source src=\"" + mediaData.wav + "\" type=\"audio/wav\"> Your browser does not support the audio tag.";
     	  mediaDomObj.appendChild(mediaDomContent);

     	  var HS_audioButton = document.createElement("button");
     	  HS_audioButton.setAttribute("class", "HS_audioButton");
     	  HS_audioButton.setAttribute("title", "Play Audio Button");
     	  HS_audioButton.onclick = function(){
     	  	var audioClip = document.getElementById(mediaData.id);
     	  	audioClip.play();
     	  };
     	  mediaDomObj.appendChild(HS_audioButton);
     	  break;

      case "image":
          if(mediaData.mediaLink != "none"){
            var mediaDomLink = document.createElement("a");
            mediaDomLink.setAttribute('class', 'HS_MediaImage');
            mediaDomLink.setAttribute('href', mediaData.mediaLink);
            mediaDomLink.setAttribute('target', "_blank");
          }

          var mediaDomContent = document.createElement("img");

          if(mediaData.mediaLink  == "none"){
            mediaDomContent.setAttribute('class', 'HS_MediaImage');
          }

          mediaDomContent.setAttribute('src', mediaData.src);

          if (type == "window"){
          	mediaDomContent.setAttribute('width', '50%');
          }
          else {
          	if(mediaData.width != "none"){
            	mediaDomContent.setAttribute('width', mediaData.width);
          	}
          	else {
	            mediaDomContent.setAttribute('width', '420');
	        }

          	if(mediaData.height != "none"){
            	mediaDomContent.setAttribute('height', mediaData.height);
          	}
          	else {
	              mediaDomContent.setAttribute('height', '315');
	        }
          }

          mediaDomObj.setAttribute('style', 'text-align:center;');

          if(mediaData.description)
          {
            mediaDomContent.setAttribute('alt', mediaData.description)
          } 
          if(mediaData.mediaLink  == "none"){
            mediaDomObj.appendChild(mediaDomContent)
          } else {
            mediaDomLink.appendChild(mediaDomContent)
            mediaDomObj.appendChild(mediaDomLink)
          }
          
          break;

      case "YouTubeVideo":
      //https://www.youtube.com/watch?v=OZBWfyYtYQY
      //<iframe width="420" height="315" src="https://www.youtube.com/embed/OZBWfyYtYQY" frameborder="0" allowfullscreen></iframe>
          validSrc = HotSpotApp.validateYouTubeLink(mediaData.src)
          if(validSrc){
            var mediaDomContent = document.createElement("iframe");
            mediaDomContent.setAttribute('class', 'HS_MediaEmbeddedVideo');

            if (type == "window"){
            	mediaDomContent.setAttribute('width', '420');
	            mediaDomContent.setAttribute('height', '315');
            }
            else {
	              mediaDomContent.setAttribute('width', '420');
	              mediaDomContent.setAttribute('height', '315');
            }

            mediaDomContent.setAttribute('frameborder', '0');
            mediaDomContent.setAttribute('allowfullscreen', 'true');
            mediaDomContent.setAttribute('style', 'padding-bottom: 10px 0px;')

            mediaDomContent.setAttribute('src', validSrc);
            mediaDomObj.setAttribute('style', 'text-align:center;');

            if(mediaData.description)
            {
              mediaDomContent.setAttribute('alt', mediaData.description)
            } 

            mediaDomObj.appendChild(mediaDomContent)

            var mediaDomLink = document.createElement("a");
            mediaDomLink.setAttribute('class', 'HS_MediaAltLink');
            mediaDomLink.setAttribute('href', mediaData.altLink);
            mediaDomLink.setAttribute('target', "_blank");
            mediaDomLink.innerHTML = "Alternate Link."

            mediaDomObj.appendChild(mediaDomLink)
          }
          break;

      case "text":
      	  var mediaDomContent = document.createElement("p");
          mediaDomContent.setAttribute('class', 'HS_MediaText');
          mediaDomContent.setAttribute('target', "_blank");
          mediaDomContent.innerHTML = mediaData.content;
          mediaDomObj.appendChild(mediaDomContent)
          break;

      default:
          break;
    }
    containerRef.appendChild(mediaDomObj);
}

/**
 * Function: validateYouTubeLink
 * 
 * Takes the passed string and checks to see if it is a valid YouTube link.
 * 
 * Parameters:
 * 
 *   src - String
 * 
 * Returns:
 * 
 *   A valid Youtube link(if it validates).
 */
HotSpotApp.validateYouTubeLink = function(src){
  if(src.indexOf("www.youtube.com") !== -1){
    if(src.indexOf("</iframe>") == -1){
      if(src.indexOf("watch?v=") != -1){
        code = src.slice(src.indexOf("?v=")+3)
        return "https://www.youtube.com/embed/"+code
      } else {
        return false
      }
    } else {
      // they grabbed the embed code probably
      if(src.indexOf("https://www.youtube.com/embed/") !== -1){
        return link.slice(link.indexOf("src")+5, link.indexOf("\"", link.indexOf("src")+5))
      } else {
        return false
      }
    }
  } else {
    return false
  }
}

/**
 * Function: shuffle
 * 
 * Takes the passed array and shuffles it into a random order.
 * 
 * Parameters:
 * 
 *   o - Array
 * 
 * Returns:
 * 
 *   Shuffled array.
 */
HotSpotApp.shuffle = function(o) { //v1.0
    for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};

/**
 * Function: onComplete
 * 
 * A custom function that gets called when the activity is complete.
 * 
 */
HotSpotApp.onComplete = function(){
	//custom code will go here
}