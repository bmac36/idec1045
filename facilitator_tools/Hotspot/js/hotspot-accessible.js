/**
* Contains all of the functionality for Hot Spot Accessible Vanilla.
*
* @class HotSpotApp(Accessible)
*/

var D2LDEBUG = false;

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

var a, i, j, k;
var HS_content, HS_activityType, HS_feedback;
var questionFile, validSrc, code, link;

/**
 * Establishes the JSON text file path, the id of the container that houses the activity, and makes a call to get the activity data.
 *
 * @method setupApp
 * @param {String} file
 * @param {String} location
 */
HotSpotApp.setupApp = function(file, location) {
   questionFile = file;

   if (document.getElementById(location) !== null) {
      HotSpotApp.containerRef = document.getElementById(location);
      HotSpotApp.getAppData(HotSpotApp.buildApp);
   } else {
      d2log('ERROR: Missing specified DOM object in HotSpotApp.setupApp().');
   }
}

/**
 * Retrieves the activity data from the JSON text file, passes that data to build the activity.
 *
 * @method getAppData
 * @param {Method} callback
 */
HotSpotApp.getAppData = function(callback) {
   var jqxhr = $.getJSON(questionFile, function(data) {
      HotSpotApp.AppData = data;
      callback(HotSpotApp.AppData);
   });

   // If the json data fails inform the users ang give some data to developers using the debug console.
   jqxhr.fail(function(e) {
      d2log('ERROR: Failed to load data from specified file. Ensure that the file path is correct' +
         ' and that JSON the JSON data is valid. (Use a validator like: http://jsonformatter.curiousconcept.com/ )');
      d2log(e);
   });
}

/**
 * Checks if the activity is being accessed on a mobile device, sets up other necessary things for the entire activity.
 *
 * @method buildApp
 */
HotSpotApp.buildApp = function() {
   if ( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
      HotSpotApp.mobileDevice = true;
   }

   if (parseInt(HotSpotApp.AppData.ShowScenes) > HotSpotApp.AppData.Scenes.length) {
      HotSpotApp.maxScenes = HotSpotApp.AppData.Scenes.length;
   } else {
      HotSpotApp.maxScenes = parseInt(HotSpotApp.AppData.ShowScenes);
   }

   HotSpotApp.Scenes = HotSpotApp.AppData.Scenes;

   if (HotSpotApp.AppData.Randomize === true) {
      HotSpotApp.shuffle(HotSpotApp.Scenes);
   }

   HotSpotApp.buildAppFrame();

   if (HotSpotApp.AppData.PreActivityText === 'none' ||
    HotSpotApp.AppData.PreActivityText === null ||
    HotSpotApp.AppData.PreActivityText === undefined ||
    HotSpotApp.AppData.PreActivityText === '') {
      if (HotSpotApp.AppData.PreActivityMedia === 'none' ||
       HotSpotApp.AppData.PreActivityMedia === null ||
       HotSpotApp.AppData.PreActivityMedia === undefined ||
       HotSpotApp.AppData.PreActivityMedia === '') {
         for (i = 0; i < HotSpotApp.Scenes.length; i++) {
            HotSpotApp.buildActivity(i);
         }
      } else {
         HotSpotApp.buildPreActivity();
      }
   } else {
      HotSpotApp.buildPreActivity();

      for (i = 0; i < HotSpotApp.Scenes.length; i++) {
         HotSpotApp.buildActivity(i);
      }
   }

   if (HotSpotApp.AppData.PostActivityText === 'none' ||
    HotSpotApp.AppData.PostActivityText === null ||
    HotSpotApp.AppData.PostActivityText === undefined ||
    HotSpotApp.AppData.PostActivityText === '') {
      if (HotSpotApp.AppData.PostActivityMedia !== 'none' &&
       HotSpotApp.AppData.PostActivityMedia !== null &&
       HotSpotApp.AppData.PostActivityMedia !== undefined &&
       HotSpotApp.AppData.PostActivityMedia !== '') {
         HotSpotApp.buildPostActivity();
      }
   } else {
      HotSpotApp.buildPostActivity();
   }
}

/**
 * Sets up the inital containers for the app.
 *
 * @method buildAppFrame
 */
HotSpotApp.buildAppFrame = function() {
   var HS_container = document.createElement('section');
   HS_container.id = 'HS_container';

   HS_content = document.createElement('section');
   HS_content.id = 'HS_content';

   var HS_header  = document.createElement('section');
   HS_header.id = 'HS_header';
   HS_header.innerHTML = '<h1>' + HotSpotApp.AppData.ActivityName + '</h1>';

   HS_container.appendChild(HS_content);
   HS_content.appendChild(HS_header);
   $(HS_container).appendTo(HotSpotApp.containerRef);
}

/**
 * Builds the pre activity inside of the app container.
 *
 * @method buildPreActivity
 */
HotSpotApp.buildPreActivity = function() {
   var HS_pageCont = document.createElement('div');
   HS_pageCont.setAttribute('class', 'HS_pageCont');
   HS_content.appendChild(HS_pageCont);

   var HS_pageHeader = document.createElement('h2');
   HS_pageHeader.setAttribute('class', 'HS_pageHeader');
   HS_pageHeader.innerHTML = 'Pre Activity Page Content';
   HS_pageCont.appendChild(HS_pageHeader);

   if (HotSpotApp.AppData.PreActivityText !== 'none' &&
    HotSpotApp.AppData.PreActivityText !== null &&
    HotSpotApp.AppData.PreActivityText !== undefined &&
    HotSpotApp.AppData.PreActivityText !== '') {
      var HS_preActivityText = document.createElement('p');
      HS_preActivityText.id = 'HS_preActivityText';
      HS_preActivityText.innerHTML = HotSpotApp.AppData.PreActivityText;
      HS_pageCont.appendChild(HS_preActivityText);
   }

   if (HotSpotApp.AppData.PreActivityMedia !== 'none' &&
    HotSpotApp.AppData.PreActivityMedia !== null &&
    HotSpotApp.AppData.PreActivityMedia !== undefined &&
    HotSpotApp.AppData.PreActivityMedia !== '') {
      for (i = 0; i < HotSpotApp.AppData.PreActivityMedia.length; i++) {
         HotSpotApp.EmbedMedia('page', HS_pageCont, HotSpotApp.AppData.PreActivityMedia[i]);
      }
   }
}

/**
 * Builds the post activity inside of the app container.
 *
 * @method buildPostActivity
 */
HotSpotApp.buildPostActivity = function() {
   var HS_pageCont = document.createElement('div');
   HS_pageCont.setAttribute('class', 'HS_pageCont');
   HS_content.appendChild(HS_pageCont);

   var HS_pageHeader = document.createElement('h2');
   HS_pageHeader.setAttribute('class', 'HS_pageHeader');
   HS_pageHeader.innerHTML = 'Post Activity Page Content';
   HS_pageCont.appendChild(HS_pageHeader);

   if (HotSpotApp.AppData.PostActivityText !== 'none' &&
    HotSpotApp.AppData.PostActivityText !== null &&
    HotSpotApp.AppData.PostActivityText !== undefined &&
    HotSpotApp.AppData.PostActivityText !== '') {
      var HS_postActivityText = document.createElement('p');
      HS_postActivityText.id = 'HS_postActivityText';
      HS_postActivityText.innerHTML = HotSpotApp.AppData.PostActivityText;
      HS_pageCont.appendChild(HS_postActivityText);
   }

   if (HotSpotApp.AppData.PostActivityMedia !== 'none' &&
    HotSpotApp.AppData.PostActivityMedia !== null &&
    HotSpotApp.AppData.PostActivityMedia !== undefined &&
    HotSpotApp.AppData.PostActivityMedia !== '') {
      for (i = 0; i < HotSpotApp.AppData.PostActivityMedia.length; i++) {
         HotSpotApp.EmbedMedia('page', HS_pageCont, HotSpotApp.AppData.PostActivityMedia[i]);
      }
   }
}

/**
 * Builds the current activity and adds it to the app container.
 *
 * @method buildActivity
 */
HotSpotApp.buildActivity = function(scene) {
   var HS_pageCont = document.createElement('div');
   HS_pageCont.setAttribute('class', 'HS_pageCont');
   HS_content.appendChild(HS_pageCont);

   var HS_pageHeader = document.createElement('h2');
   HS_pageHeader.setAttribute('class', 'HS_pageHeader');
   HS_pageHeader.innerHTML = 'Activity ' + (scene + 1) + ': ' + HotSpotApp.Scenes[scene].SceneName;
   HS_pageCont.appendChild(HS_pageHeader);

   var HS_pageContext = document.createElement('p');
   HS_pageContext.setAttribute('class', 'HS_pageContext');
   HS_pageContext.innerHTML = '<strong>Original Image: ' + HotSpotApp.Scenes[scene].Background.alt + '</strong>';
   HS_pageCont.appendChild(HS_pageContext);

   for (a = 0; a < HotSpotApp.Scenes[scene].HotSpotContent.length; a++) {
      HotSpotApp.buildSceneContent(scene, a, HS_pageCont);
   }
}

/**
 * Builds each content piece for each designated scene and adds them to the content container.
 *
 * @method buildSceneContent
 * @param {Integer} scene
 * @param {Integer} content
 * @param {Object} location
 */
HotSpotApp.buildSceneContent = function(scene, content, location) {
   var header;
   var questionNum;
   var correctAnswer;

   // Starts the inital set up of the pop up window by building the window container and adds it to the document
   var HS_questionCont = document.createElement('div');
   HS_questionCont.setAttribute('class', 'HS_questionCont');

   $(HS_questionCont).appendTo(location);

   if (HotSpotApp.Scenes[scene].HotSpotContent[content].popUpName !== 'none' &&
    HotSpotApp.Scenes[scene].HotSpotContent[content].popUpName !== null &&
    HotSpotApp.Scenes[scene].HotSpotContent[content].popUpName !== undefined &&
    HotSpotApp.Scenes[scene].HotSpotContent[content].popUpName !== '') {
      header = 'Interactive Element ' + (content + 1) + ': ' + HotSpotApp.Scenes[scene].HotSpotContent[content].popUpName;
   } else {
      header = 'Pop Up Activity';
   }

   // Builds the container for the pop up's content, and adds it to the pop up
   var HS_question = document.createElement('div');
   HS_question.setAttribute('class', 'HS_question');
   HS_questionCont.appendChild(HS_question);

   var HS_popUpHeader = document.createElement('h3');
   HS_popUpHeader.setAttribute('class', 'HS_popUpHeader');
   HS_popUpHeader.innerHTML = header;
   HS_question.appendChild(HS_popUpHeader);

   var HS_popUpContext = document.createElement('p');
   HS_popUpContext.setAttribute('class', 'HS_popUpContext');
   HS_popUpContext.innerHTML = '<strong>Element Description: ' + HotSpotApp.Scenes[scene].HotSpots[content].desc + '</strong>';
   HS_question.appendChild(HS_popUpContext);

   if (HotSpotApp.Scenes[scene].HotSpotContent[content].activityType === 'presentation') {
      HS_activityType = document.createElement('h4');
      HS_activityType.setAttribute('class', 'HS_activityType');
      HS_activityType.innerHTML = 'Embedded Content:';
      HS_question.appendChild(HS_activityType);

      for (k = 0; k < HotSpotApp.Scenes[scene].HotSpotContent[content].hotSpotMedia.length; k++) {
         HotSpotApp.EmbedMedia('window', HS_question, HotSpotApp.Scenes[scene].HotSpotContent[content].hotSpotMedia[k]);
      }
   }
   // If the content is assessment type, it will build a multiple choice quiz based inside the pop up
   else if (HotSpotApp.Scenes[scene].HotSpotContent[content].activityType === 'assessment') {
      HS_activityType = document.createElement('h4');
      HS_activityType.setAttribute('class', 'HS_activityType');
      HS_activityType.innerHTML = 'Assessment Question:';
      HS_question.appendChild(HS_activityType);

      // Saves the index number of the question to be used later
      questionNum = content;

      // Loads and adds the question for the quiz to the pop up
      var HS_quizText = document.createElement('p');
      HS_quizText.setAttribute('class', 'HS_quizText');
      HS_quizText.innerHTML = HotSpotApp.Scenes[scene].HotSpotContent[content].questionText;
      HS_question.appendChild(HS_quizText);

      // Loads and adds the fieldset for the quiz to the pop up
      var HS_fieldSet = document.createElement('fieldset');
      HS_fieldSet.id = 'HS_fieldSet' + HotSpotApp.questionNumber;
      HS_fieldSet.innerHTML = '<legend>Answers:</legend>';
      HS_question.appendChild(HS_fieldSet);

      // Loads all of the answers for the quiz, builds the inputs for them, and adds them to the pop up
      for (j = 0; j < HotSpotApp.Scenes[scene].HotSpotContent[content].answers.length; j++) {
         // Checks to see which answer is correct, and saves it's index for later
         if (HotSpotApp.Scenes[scene].HotSpotContent[content].answers[j].correct === true) {
            correctAnswer = j;
         }

         var HS_answer = document.createElement('div');
         HS_answer.setAttribute('class', 'HS_answer');

         var HS_input = document.createElement('input');
         HS_input.setAttribute('class', 'HS_input');
         HS_input.setAttribute('type', 'radio');
         HS_input.setAttribute('name', 'qu' + HotSpotApp.questionNumber);
         HS_input.setAttribute('value', j);
         HS_input.id = 'qu' + scene + content + j;

         var HS_label = document.createElement('label');
         HS_label.setAttribute('for', 'qu' + scene + content + j);
         HS_label.setAttribute('class', 'HS_label');
         HS_label.innerHTML = HotSpotApp.Scenes[scene].HotSpotContent[content].answers[j].answerText;

         HS_answer.appendChild(HS_input);
         HS_answer.appendChild(HS_label);
         HS_fieldSet.appendChild(HS_answer);
      }

      // Builds the submit button for the pop up window (only gets built for assessment type pop ups)
      var HS_submitButton = document.createElement('button');
      HS_submitButton.id = 'HS_submitButton' + HotSpotApp.questionNumber;
      HS_submitButton.setAttribute('class', 'HS_popUpButton');
      HS_submitButton.setAttribute('title', 'Submits your answer to the question');
      HS_submitButton.href = '#';
      HS_submitButton.onclick = function() {
         var num = this.id.substr(15);
         HotSpotApp.Eval(num, scene, content, this.parentNode, correctAnswer);
      }

      // Label for the submit button
      var HS_submitLabel = document.createElement('span');
      HS_submitLabel.setAttribute('class', 'HS_buttonLabel');
      HS_submitLabel.innerHTML = 'Submit Answer';

      // Adds the submit button to the pop up
      HS_submitButton.appendChild(HS_submitLabel);
      HS_question.appendChild(HS_submitButton);

      // Builds the reset button for the pop up window (only gets built for assessment type pop ups)
      var HS_resetQuestion = document.createElement('button');
      HS_resetQuestion.id = 'HS_resetQuestion' + HotSpotApp.questionNumber;
      HS_resetQuestion.setAttribute('class', 'HS_popUpButton');
      HS_resetQuestion.setAttribute('title', 'Resets the question');
      HS_resetQuestion.href = '#';
      HS_resetQuestion.onclick = function() {
         var num = this.id.substr(16);
         HotSpotApp.Reset(num);
      }

      // Label for the submit button
      var HS_resetLabel = document.createElement('span');
      HS_resetLabel.setAttribute('class', 'HS_buttonLabel');
      HS_resetLabel.innerHTML = 'Reset Question';

      // Adds the submit button to the pop up
      HS_resetQuestion.appendChild(HS_resetLabel);
      HS_question.appendChild(HS_resetQuestion);
      HS_resetQuestion.disabled = true;

      HotSpotApp.questionNumber++;
   }
}

/**
 * Evaluates the current multiple choice question, determines it's correctness, and provides any necessary feedback.
 *
 * @method Eval
 * @param {Integer} num
 * @param {Integer} scene
 * @param {Integer} content
 * @param {Object} location
 * @param {Integer} correctAnswer
 */
HotSpotApp.Eval = function(num, scene, content, location, correctAnswer) {
   var idNum = parseInt($('#HS_fieldSet' + num).find('input[type="radio"]:checked').val());

   if (idNum !== null) {
      // Loads the correct and wrong indicators for visual feedback
      var correct = '<img class="correct" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAANCAYAAACgu+4kAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyhpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMDE0IDc5LjE1Njc5NywgMjAxNC8wOC8yMC0wOTo1MzowMiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTQgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6Njk0QjdFOUFFQUFGMTFFNDg4MjBGN0M3OURFRTYyRDYiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6Njk0QjdFOUJFQUFGMTFFNDg4MjBGN0M3OURFRTYyRDYiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo2OTRCN0U5OEVBQUYxMUU0ODgyMEY3Qzc5REVFNjJENiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo2OTRCN0U5OUVBQUYxMUU0ODgyMEY3Qzc5REVFNjJENiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PllHhcQAAACASURBVHjaYmIgB2zx7wBjIGAhSzMDQzmUzcBEtmYI4GeiQPMMIM5iokQzg8/G/0xQBYzkaAZxmKCap8FClRTNEANAmhkYMsAKkQ0hQjMsGj8i8UGGINgENIMAIw7bGIjRDPMCA1CyAkh2kqoZYQB2QwhqRngBM+T5idEMAgABBgBezD9OGUJHCwAAAABJRU5ErkJggg==" alt="right check mark" disabled/>';
      var wrong = '<img class="wrong" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAANCAYAAACgu+4kAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyhpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMDE0IDc5LjE1Njc5NywgMjAxNC8wOC8yMC0wOTo1MzowMiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTQgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6REI5RDZEMTdFQUFGMTFFNDg4MjBGN0M3OURFRTYyRDYiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6REI5RDZEMThFQUFGMTFFNDg4MjBGN0M3OURFRTYyRDYiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo2OTRCN0U5Q0VBQUYxMUU0ODgyMEY3Qzc5REVFNjJENiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpEQjlENkQxNkVBQUYxMUU0ODgyMEY3Qzc5REVFNjJENiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PuBTV64AAAC/SURBVHjahJPRDcIwDETtCLEAjARSv/iL0hXoQGUFoi5QCUaCBfgJDnJQmubSSlak691zaqscQqA3n/dENEnNR3reCDwvOl3l6KTsITw+UTP6LoYvUqOaUHhU35T0BJgz7wqShan0/wB67aEGqYSH/DM5zoCZUScv5WrhmFsBAKTaGQIUci86ewn3uScBDJi2K2SHtmM2pu1b21kAwLR7tJ0FoLWq1orzG3Ro2gDy9+/0tFv/QtSlcwrbpH8FGAC2umDxE/BZxwAAAABJRU5ErkJggg==" alt="wrong x" disabled/>';

      // Disables the submit button to prevent re-submits, and enables the reset question button
      document.getElementById('HS_submitButton' + num).disabled = true;
      document.getElementById('HS_resetQuestion' + num).disabled = false;
      $('#HS_resetQuestion' + num).focus();

      // Checks to see if feedback needs to be provided, if so, it loads the feedback associated with the chosen answer and adds it to the pop up
      if (HotSpotApp.Scenes[scene].HotSpotContent[content].feedback === true) {
         if (HotSpotApp.Scenes[scene].HotSpotContent[content].answers[idNum].feedback !== 'none' &&
          HotSpotApp.Scenes[scene].HotSpotContent[content].answers[idNum].feedback !== null &&
          HotSpotApp.Scenes[scene].HotSpotContent[content].answers[idNum].feedback !== undefined &&
          HotSpotApp.Scenes[scene].HotSpotContent[content].answers[idNum].feedback !== '') {
            HS_feedback = document.createElement('p');
            HS_feedback.setAttribute('class', 'HS_feedback');
            HS_feedback.innerHTML = '<strong>You Chose: ' + HotSpotApp.Scenes[scene].HotSpotContent[content].answers[idNum].answerText +
            '</strong></br><strong>Correct Answer: ' + HotSpotApp.Scenes[scene].HotSpotContent[content].answers[correctAnswer].answerText +
            '</strong></br><strong>Feedback: ' + HotSpotApp.Scenes[scene].HotSpotContent[content].answers[idNum].feedback + '</strong>';

            location.appendChild(HS_feedback);
         } else {
            HS_feedback = document.createElement('p');
            HS_feedback.setAttribute('class', 'HS_feedback');
            HS_feedback.innerHTML = '<strong>You Chose: ' + HotSpotApp.Scenes[scene].HotSpotContent[content].answers[idNum].answerText +
            '</strong></br><strong>Correct Answer: ' + HotSpotApp.Scenes[scene].HotSpotContent[content].answers[correctAnswer].answerText +
            '</strong>';

            location.appendChild(HS_feedback);
         }
      } else {
         HS_feedback = document.createElement('p');
         HS_feedback.setAttribute('class', 'HS_feedback');
         HS_feedback.innerHTML = '<strong>You Chose: ' + HotSpotApp.Scenes[scene].HotSpotContent[content].answers[idNum].answerText +
         '</strong></br><strong>Correct Answer: ' + HotSpotApp.Scenes[scene].HotSpotContent[content].answers[correctAnswer].answerText +
         '</strong>';

         location.appendChild(HS_feedback);
      }

      // Assigns the correct and wrong visual indicators
      $('#HS_fieldSet' + num + '> .HS_answer').each(function(index) {
         if (index === correctAnswer) {
            $(correct).appendTo(this);
         } else {
            $(wrong).appendTo(this);
         }
      });
   }
}

/**
* Resets the designated question and removes any feedback.
*
* @method Reset
* @param {Integer} num
*/
HotSpotApp.Reset = function(num) {
   // Assigns the correct and wrong visual indicators
   $('#HS_fieldSet' + num + '> .HS_answer').each(function() {
      $(this.lastChild).remove();
      $(this.firstChild).removeAttr('checked');
   });

   var lastChild = document.getElementById('HS_fieldSet' + num).parentNode.lastChild;

   if ($(lastChild).hasClass('HS_feedback')) {
      lastChild.remove();
   }

   // Disables the reset question button to prevent re-submits, and enables the submit question button
   document.getElementById('HS_submitButton' + num).disabled = false;
   document.getElementById('HS_resetQuestion' + num).disabled = true;
   $('#HS_submitButton' + num).focus();
}

/**
 * Takes the passed object data and embeds it based on type.
 *
 * @method EmbedMedia
 * @param {String} type
 * @param {String} containerRef
 * @param {Object} mediaData
 */
HotSpotApp.EmbedMedia = function(type, containerRef, mediaData) {
   var mediaDomObj = document.createElement('div');
   var mediaDomLink, mediaDomContent;
   mediaDomObj.setAttribute('class', 'HS_Media')

   switch (mediaData.type) {
      case 'link':
         mediaDomContent = document.createElement('a');
         mediaDomContent.setAttribute('class', 'HS_MediaLink');
         mediaDomContent.setAttribute('href', mediaData.src);
         mediaDomContent.setAttribute('target', '_blank');

         if (mediaData.description) {
            mediaDomContent.innerHTML = mediaData.description
         } else {
            mediaDomContent.innerHTML = 'Link'
         }

         mediaDomObj.appendChild(mediaDomContent);

         break;

      case 'audio':
         mediaDomContent = document.createElement('audio');
         mediaDomContent.id = mediaData.id;
         mediaDomContent.setAttribute('class', 'HS_MediaAudio');
         mediaDomContent.setAttribute('target', '_blank');

         mediaDomContent.innerHTML = '<source src="' + mediaData.mp3 + '" type="audio/mpeg">' +
         '<source src="' + mediaData.ogg + '" type="audio/ogg">' +
         '<source src="' + mediaData.wav + '" type="audio/wav"> Your browser does not support the audio tag.';
         mediaDomObj.appendChild(mediaDomContent);

         var HS_audioButton = document.createElement('button');
         HS_audioButton.setAttribute('class', 'HS_audioButton');
         HS_audioButton.setAttribute('title', 'Play Audio Button');
         HS_audioButton.onclick = function() {
            var audioClip = document.getElementById(mediaData.id);
            audioClip.play();
         };
         mediaDomObj.appendChild(HS_audioButton);

         break;

      case 'image':
         if (mediaData.mediaLink !== 'none' &&
          mediaData.mediaLink !== null &&
          mediaData.mediaLink !== undefined &&
          mediaData.mediaLink !== '') {
            mediaDomLink = document.createElement('a');
            mediaDomLink.setAttribute('class', 'HS_MediaImage');
            mediaDomLink.setAttribute('href', mediaData.mediaLink);
            mediaDomLink.setAttribute('target', '_blank');
         }

         mediaDomContent = document.createElement('img');

         if (mediaData.mediaLink === 'none' ||
          mediaData.mediaLink === null ||
          mediaData.mediaLink === undefined ||
          mediaData.mediaLink === '') {
            mediaDomContent.setAttribute('class', 'HS_MediaImage');
         }

         mediaDomContent.setAttribute('src', mediaData.src);

         if (type === 'window') {
            mediaDomContent.setAttribute('width', '50%');
         } else {
            if (mediaData.width !== 'none' &&
             mediaData.width !== null &&
             mediaData.width !== undefined &&
             mediaData.width !== '') {
               mediaDomContent.setAttribute('width', mediaData.width);
            } else {
               mediaDomContent.setAttribute('width', '420');
            }

            if (mediaData.height !== 'none' &&
             mediaData.height !== null &&
             mediaData.height !== undefined &&
             mediaData.height !== '') {
               mediaDomContent.setAttribute('height', mediaData.height);
            } else {
               mediaDomContent.setAttribute('height', '315');
            }
         }

         mediaDomObj.setAttribute('style', 'text-align:center;');

         if (mediaData.description) {
            mediaDomContent.setAttribute('alt', mediaData.description);
         }

         if (mediaData.mediaLink  === 'none' ||
          mediaData.mediaLink  === null ||
          mediaData.mediaLink  === undefined ||
          mediaData.mediaLink  === '') {
            mediaDomObj.appendChild(mediaDomContent);
         } else {
            mediaDomLink.appendChild(mediaDomContent);
            mediaDomObj.appendChild(mediaDomLink);
         }

         break;

      case 'YouTubeVideo':
         validSrc = HotSpotApp.validateYouTubeLink(mediaData.src)
         if (validSrc) {
            mediaDomContent = document.createElement('iframe');
            mediaDomContent.setAttribute('class', 'HS_MediaEmbeddedVideo');

            if (type === 'window') {
               mediaDomContent.setAttribute('width', '420');
               mediaDomContent.setAttribute('height', '315');
            } else {
               mediaDomContent.setAttribute('width', '420');
               mediaDomContent.setAttribute('height', '315');
            }

            mediaDomContent.setAttribute('frameborder', '0');
            mediaDomContent.setAttribute('allowfullscreen', 'true');
            mediaDomContent.setAttribute('style', 'padding-bottom: 10px 0px;')

            mediaDomContent.setAttribute('src', validSrc);
            mediaDomObj.setAttribute('style', 'text-align:center;');

            if (mediaData.description) {
               mediaDomContent.setAttribute('alt', mediaData.description)
            }

            mediaDomObj.appendChild(mediaDomContent)

            mediaDomLink = document.createElement('a');
            mediaDomLink.setAttribute('class', 'HS_MediaAltLink');
            mediaDomLink.setAttribute('href', mediaData.altLink);
            mediaDomLink.setAttribute('target', '_blank');
            mediaDomLink.innerHTML = 'Alternate Link.'

            mediaDomObj.appendChild(mediaDomLink)
         }

         break;

      case 'text':
         mediaDomContent = document.createElement('p');
         mediaDomContent.setAttribute('class', 'HS_MediaText');
         mediaDomContent.setAttribute('target', '_blank');
         mediaDomContent.innerHTML = mediaData.content;
         mediaDomObj.appendChild(mediaDomContent);

         break;

      default:
         break;
   }

   containerRef.appendChild(mediaDomObj);
}

/**
 * Takes a string and checks if it's a valid YouTube link.
 *
 * @method validateYouTubeLink
 * @param {String} src
 * @return {Boolean|String} Functioning YouTube link or False
 */
HotSpotApp.validateYouTubeLink = function(src) {
   if (src.indexOf('www.youtube.com') !== -1) {
      if (src.indexOf('</iframe>') === -1) {
         if (src.indexOf('watch?v=') !== -1) {
            code = src.slice(src.indexOf('?v=') + 3);
            return 'https://www.youtube.com/embed/' + code;
         } else {
            return false;
         }
      } else {
         // They grabbed the embed code probably
         if (src.indexOf('https://www.youtube.com/embed/') !== -1) {
            return link.slice(link.indexOf('src') + 5, link.indexOf('"', link.indexOf('src') + 5));
         } else {
            return false;
         }
      }
   } else {
      return false;
   }
}

/**
 * Takes the passed array and shuffles it into a random order.
 *
 * @method shuffle
 * @param {Array} array
 * @return {Array} array(shuffled)
 */
HotSpotApp.shuffle = function(array) {
   var m = array.length, t, i;

   // While there remain elements to shuffle
   while (m) {
      // Pick a remaining element
      i = Math.floor(Math.random() * m--);

      // And swap it with the current element
      t = array[m];
      array[m] = array[i];
      array[i] = t;
   }

   return array;
};

/**
 * A custom function that gets called when the activity is complete.
 *
 * @method onComplete
 */
HotSpotApp.onComplete = function() {
   //custom code will go here
}

/**
 * Generic D2L logging method. Used to try and prevent large amounts of console logging in production.
 *
 * @method d2log
 * @param {string} m
 * @return {} Console logs m
 */
function d2log(m) {
   if (typeof D2LDEBUG !== 'undefined') {
      if (D2LDEBUG) {
         console.log(m);
      }
   }
}
