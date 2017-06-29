/**
 * Contains all of the functionality for Hot Spot Vanilla.
 *
 * @class HotSpotApp
 */

var D2LDEBUG = false;

var HotSpotApp = {
   AppData: null,
   sceneNum: 0,
   maxScenes: null,
   containerRef: null,
   mobileDevice: false,
   activeActivity: false,
   ti: 1,
   currentAttempts: 0,
   headingLevel: null,
   normalState: null,
   completeState: null,
   wrongState: null,
   restartButton: null,
   startButton: null,
   nextButton: null,
   noPost: false,
   allCompleted: [],
   correctCheck: []
};

var x, y, i, j, theta;
var HS_postActivityText, HS_appContainer, HS_questionContainer, HS_hotSpot, HS_imageMapAreas, HS_question;
var questionFile, validSrc, code, link;

/**
 * Resets specified properties to their default values
 *
 * @method resetActivityData
 */
HotSpotApp.resetActivityData = function() {
   HotSpotApp.allCompleted = [];
   HotSpotApp.correctCheck = [];
};

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

   // Make the screen reader version work properly again in the LE
   $('#HS_screenAlt').click(function() {
      window.location = this.href;
   });
};

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
};

/**
 * Checks if the activity is being accessed on a mobile device, sets up other necessary things for the entire activity.
 *
 * @method buildApp
 */
HotSpotApp.buildApp = function() {
   if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      HotSpotApp.mobileDevice = true;
   }

   if (parseInt(HotSpotApp.AppData.ShowScenes) > HotSpotApp.AppData.Scenes.length) {
      HotSpotApp.maxScenes = HotSpotApp.AppData.Scenes.length;
   } else {
      HotSpotApp.maxScenes = parseInt(HotSpotApp.AppData.ShowScenes);
   }

   HotSpotApp.Scenes = HotSpotApp.AppData.Scenes;
   HotSpotApp.headingLevel = parseInt(HotSpotApp.AppData.HeadingLevel);
   if (HotSpotApp.headingLevel === null ||
      HotSpotApp.headingLevel === undefined ||
      HotSpotApp.headingLevel === 'none' ||
      isNaN(HotSpotApp.headingLevel) ||
      HotSpotApp.headingLevel === '') {
      HotSpotApp.headingLevel = 1;
   } else if (HotSpotApp.headingLevel > 4) {
      HotSpotApp.headingLevel = 4;
   }

   if (HotSpotApp.AppData.Randomize === true) {
      HotSpotApp.shuffle(HotSpotApp.Scenes);
   }

   //Checks if post activity content is needed
   if (HotSpotApp.AppData.PostActivityText === 'none' ||
      HotSpotApp.AppData.PostActivityText === '' ||
      HotSpotApp.AppData.PostActivityText === null ||
      HotSpotApp.AppData.PostActivityText === undefined) {
      if (HotSpotApp.AppData.PostActivityMedia === 'none' ||
         HotSpotApp.AppData.PostActivityMedia === '' ||
         HotSpotApp.AppData.PostActivityMedia === null ||
         HotSpotApp.AppData.PostActivityMedia === undefined) {
         HotSpotApp.noPost = true;
      } else {
         HotSpotApp.noPost = false;
      }
   } else {
      HotSpotApp.noPost = false;
   }

   HotSpotApp.buildColourKeys();
   HotSpotApp.buildAppFrame();
   HotSpotApp.loadButtons();

   if (HotSpotApp.AppData.PreActivityText === 'none' ||
      HotSpotApp.AppData.PreActivityText === '' ||
      HotSpotApp.AppData.PreActivityText === null ||
      HotSpotApp.AppData.PreActivityText === undefined) {
      if (HotSpotApp.AppData.PreActivityMedia === 'none' ||
         HotSpotApp.AppData.PreActivityMedia === '' ||
         HotSpotApp.AppData.PreActivityMedia === null ||
         HotSpotApp.AppData.PreActivityMedia === undefined) {
         HotSpotApp.buildActivity();
      } else {
         HotSpotApp.buildPreActivity();
      }
   } else {
      HotSpotApp.buildPreActivity();
   }

   $(HotSpotApp.containerRef).addClass('rs_preserve');
};

/**
 * Sets up the fill/hover/complete/wrong colour parameters for the visual indicators.
 *
 * @method buildColourKeys
 */
HotSpotApp.buildColourKeys = function() {
   var fillColour = HotSpotApp.AppData.visibleStyle.colour.substr(1, HotSpotApp.AppData.visibleStyle.colour.length);
   var fillOpacity = (parseInt(HotSpotApp.AppData.visibleStyle.opacity.substr(0, HotSpotApp.AppData.visibleStyle.opacity.length - 1))) / 100;
   var fillStroke = HotSpotApp.AppData.visibleStyle.stroke;
   var fillStrokeColour = HotSpotApp.AppData.visibleStyle.strokeColour.substr(1, HotSpotApp.AppData.visibleStyle.strokeColour.length);
   var fillStrokeWidth = parseInt(HotSpotApp.AppData.visibleStyle.strokeWidth);

   var highlightColour = HotSpotApp.AppData.highlightStyle.colour.substr(1, HotSpotApp.AppData.highlightStyle.colour.length);
   var highlightOpacity = (parseInt(HotSpotApp.AppData.highlightStyle.opacity.substr(0, HotSpotApp.AppData.highlightStyle.opacity.length - 1))) / 100;
   var highlightStroke = HotSpotApp.AppData.highlightStyle.stroke;
   var highlightStrokeColour = HotSpotApp.AppData.highlightStyle.strokeColour.substr(1, HotSpotApp.AppData.highlightStyle.strokeColour.length);
   var highlightStrokeWidth = parseInt(HotSpotApp.AppData.highlightStyle.strokeWidth);

   HotSpotApp.normalState = {
      staticState: true,
      highlight: true,
      fade: false,
      fadeDuration: 0
   };

   HotSpotApp.correctState = {
      fillColor: '00FF00',
      fillOpacity: 0.35
   };

   HotSpotApp.wrongState = {
      fillColor: 'FF0000',
      fillOpacity: 0.35
   };

   if (HotSpotApp.AppData.visible === true) {
      HotSpotApp.normalState.fillColor = fillColour;
      HotSpotApp.normalState.fillOpacity = fillOpacity;
      HotSpotApp.normalState.stroke = fillStroke;

      if (fillStroke === true) {
         HotSpotApp.normalState.strokeColor = fillStrokeColour;
         HotSpotApp.normalState.strokeWidth = fillStrokeWidth;
      }
   } else {
      if (HotSpotApp.AppData.highlight === true && HotSpotApp.mobileDevice === true) {
         HotSpotApp.normalState.fillColor = highlightColour;
         HotSpotApp.normalState.fillOpacity = highlightOpacity / 2;
         HotSpotApp.normalState.stroke = highlightStroke;

         if (highlightStroke === true) {
            HotSpotApp.normalState.strokeColor = highlightStrokeColour;
            HotSpotApp.normalState.strokeWidth = highlightStrokeWidth;
            HotSpotApp.normalState.strokeOpacity = 0.5;
         }
      } else {
         HotSpotApp.normalState.fillColor = 'FFFFFF';
         HotSpotApp.normalState.fillOpacity = 0;
      }
   }

   if (HotSpotApp.AppData.highlight === true) {
      HotSpotApp.normalState.render_highlight = {};

      HotSpotApp.normalState.render_highlight.fillColor = highlightColour;
      HotSpotApp.normalState.render_highlight.fillOpacity = highlightOpacity;
      HotSpotApp.normalState.render_highlight.stroke = highlightStroke;

      if (highlightStroke === true) {
         HotSpotApp.normalState.render_highlight.strokeColor = highlightStrokeColour;
         HotSpotApp.normalState.render_highlight.strokeWidth = highlightStrokeWidth;
      }
   } else {
      HotSpotApp.normalState.render_highlight = {};

      HotSpotApp.normalState.render_highlight.fillColor = 'FFFFFF';
      HotSpotApp.normalState.render_highlight.fillOpacity = 0;
      HotSpotApp.normalState.render_highlight.stroke = true;
      HotSpotApp.normalState.render_highlight.strokeColor = '00FFFF';
      HotSpotApp.normalState.render_highlight.strokeWidth = 3;
   }
};

/**
 * Sets up the inital containers for the app.
 *
 * @method buildAppFrame
 */
HotSpotApp.buildAppFrame = function() {
   var HS_container = document.createElement('section');
   HS_container.id = 'HS_container';

   var HS_content = document.createElement('section');
   HS_content.id = 'HS_content';

   var HS_header = document.createElement('section');
   HS_header.id = 'HS_header';
   $(HS_header).addClass('bg-dark');
   HS_header.innerHTML = '<h' + HotSpotApp.headingLevel + '>' + HotSpotApp.AppData.ActivityName + '</h' + HotSpotApp.headingLevel + '>';

   HS_container.appendChild(HS_content);
   // HS_content.appendChild(HS_header);
   $(HS_container).appendTo(HotSpotApp.containerRef);

   HS_appContainer = document.createElement('div');
   HS_appContainer.id = 'HS_appContainer';

   $(HS_header).hide().appendTo(HS_content).slideDown(500, 'swing');
   HS_content.appendChild(HS_appContainer);
};

/**
 * Sets up all the parameters for each button and stores them in an object.
 *
 * @method loadButtons
 */
HotSpotApp.loadButtons = function() {
   var HS_restartButton = document.createElement('button');
   HS_restartButton.id = 'HS_restartButton';
   HS_restartButton.setAttribute('class', 'HS_button');
   HS_restartButton.setAttribute('title', 'Restarts the Activity');

   HS_restartButton.onclick = function() {
      // if ($('.d2l-page-title', window.parent.document).length > 0) {
      //    $('body', window.parent.document).animate({
      //       scrollTop: $('.d2l-page-title', window.parent.document).offset().top
      //    }, 1000);
      // }

      HotSpotApp.clearStage();
      HotSpotApp.resetActivityData();
      HotSpotApp.sceneNum = 0;

      if (HotSpotApp.AppData.PreActivityText === 'none' ||
         HotSpotApp.AppData.PreActivityText === '' ||
         HotSpotApp.AppData.PreActivityText === null ||
         HotSpotApp.AppData.PreActivityText === undefined) {
         if (HotSpotApp.AppData.PreActivityMedia === 'none' ||
            HotSpotApp.AppData.PreActivityMedia === '' ||
            HotSpotApp.AppData.PreActivityMedia === null ||
            HotSpotApp.AppData.PreActivityMedia === undefined) {
            HotSpotApp.buildActivity();
         } else {
            HotSpotApp.buildPreActivity();
         }
      } else {
         HotSpotApp.buildPreActivity();
      }
   };

   var HS_restartLabel = document.createElement('span');
   HS_restartLabel.setAttribute('class', 'HS_buttonLabel');
   HS_restartLabel.innerHTML = 'Reset Activity';
   HS_restartButton.appendChild(HS_restartLabel);

   HotSpotApp.restartButton = HS_restartButton;

   var HS_startButton = document.createElement('button');
   HS_startButton.id = 'HS_startButton';
   HS_startButton.setAttribute('class', 'HS_button');
   HS_startButton.setAttribute('title', 'Starts the Activity');

   HS_startButton.onclick = function() {
      // if ($('.d2l-page-title', window.parent.document).length > 0) {
      //    $('body', window.parent.document).animate({
      //       scrollTop: $('.d2l-page-title', window.parent.document).offset().top
      //    }, 1000);
      // }

      HotSpotApp.clearStage();
      HotSpotApp.buildActivity();
   };

   var HS_startLabel = document.createElement('span');
   HS_startLabel.setAttribute('class', 'HS_buttonLabel');
   HS_startLabel.innerHTML = 'Start Activity';
   HS_startButton.appendChild(HS_startLabel);

   HotSpotApp.startButton = HS_startButton;

   var HS_nextButton = document.createElement('button');
   HS_nextButton.id = 'HS_nextButton';
   HS_nextButton.setAttribute('class', 'HS_button');
   HS_nextButton.setAttribute('title', 'Moves to the Next Part of the Activity');

   HS_nextButton.onclick = function() {
      // if ($('.d2l-page-title', window.parent.document).length > 0) {
      //    $('body', window.parent.document).animate({
      //       scrollTop: $('.d2l-page-title', window.parent.document).offset().top
      //    }, 1000);
      // }

      HotSpotApp.clearStage();
      HotSpotApp.sceneNum++;

      if (HotSpotApp.sceneNum < HotSpotApp.maxScenes) {
         HotSpotApp.resetActivityData();
         HotSpotApp.buildActivity();
      } else {
         if (HotSpotApp.noPost === true) {
            HotSpotApp.currentAttempts++;
            HotSpotApp.onComplete();
            HotSpotApp.resetActivityData();
            HotSpotApp.sceneNum = 0;
            HotSpotApp.buildActivity();
         } else {
            HotSpotApp.currentAttempts++;
            HotSpotApp.onComplete();
            HotSpotApp.buildPostActivity();
         }
      }
   };

   var HS_nextLabel = document.createElement('span');
   HS_nextLabel.setAttribute('class', 'HS_buttonLabel');
   HS_nextButton.appendChild(HS_nextLabel);

   HotSpotApp.nextButton = HS_nextButton;
};

/**
 * Builds the pre activity inside of the app container.
 *
 * @method buildPreActivity
 */
HotSpotApp.buildPreActivity = function() {
   if (HotSpotApp.AppData.PreActivityText !== 'none' &&
      HotSpotApp.AppData.PreActivityText !== '' &&
      HotSpotApp.AppData.PreActivityText !== null &&
      HotSpotApp.AppData.PreActivityText !== undefined) {
      var HS_preActivityText = document.createElement('p');
      HS_preActivityText.id = 'HS_preActivityText';
      HS_preActivityText.innerHTML = HotSpotApp.AppData.PreActivityText;
      $(HS_preActivityText).hide().appendTo(HS_appContainer).fadeIn(500);
      //HS_appContainer.appendChild(HS_preActivityText);
   }

   if (HotSpotApp.AppData.PreActivityMedia !== 'none' &&
      HotSpotApp.AppData.PreActivityMedia !== '' &&
      HotSpotApp.AppData.PreActivityMedia !== null &&
      HotSpotApp.AppData.PreActivityMedia !== undefined) {
      for (i = 0; i < HotSpotApp.AppData.PreActivityMedia.length; i++) {
         HotSpotApp.EmbedMedia('page', HS_appContainer, HotSpotApp.AppData.PreActivityMedia[i]);
      }
   }

   HotSpotApp.buildPreActivityButtons();
};

/**
 * Adds the button(s) for the pre activity into the app container.
 *
 * @method buildPreActivityButtons
 */
HotSpotApp.buildPreActivityButtons = function() {
   var HS_buttonSet = document.createElement('div');
   HS_buttonSet.id = 'HS_buttonSet';

   $(HS_buttonSet).hide().appendTo(HS_appContainer).fadeIn(500);
   // HS_appContainer.appendChild(HS_buttonSet);
   HS_buttonSet.appendChild(HotSpotApp.startButton);
};

/**
 * Builds the post activity inside of the app container.
 *
 * @method buildPostActivity
 */
HotSpotApp.buildPostActivity = function() {
   document.getElementById('HS_header').innerHTML = '<h' + HotSpotApp.headingLevel + '>' + HotSpotApp.AppData.ActivityName + '</h' + HotSpotApp.headingLevel + '>';

   if (HotSpotApp.AppData.PostActivityText !== 'none' &&
      HotSpotApp.AppData.PostActivityText !== '' &&
      HotSpotApp.AppData.PostActivityText !== null &&
      HotSpotApp.AppData.PostActivityText !== undefined) {
      HS_postActivityText = document.createElement('p');
      HS_postActivityText.id = 'HS_postActivityText';
      HS_postActivityText.innerHTML = HotSpotApp.AppData.PostActivityText;
      $(HS_postActivityText).hide().appendTo(HS_appContainer).fadeIn(500);
      //HS_appContainer.appendChild(HS_postActivityText);
   } else {
      HS_postActivityText = document.createElement('p');
      HS_postActivityText.id = 'HS_postActivityText';
      HS_postActivityText.innerHTML = 'You have completed the activity!';
      $(HS_postActivityText).hide().appendTo(HS_appContainer).fadeIn(500);
      //HS_appContainer.appendChild(HS_postActivityText);
   }

   if (HotSpotApp.AppData.PostActivityMedia !== 'none' &&
      HotSpotApp.AppData.PostActivityMedia !== '' &&
      HotSpotApp.AppData.PostActivityMedia !== null &&
      HotSpotApp.AppData.PostActivityMedia !== undefined) {
      for (i = 0; i < HotSpotApp.AppData.PostActivityMedia.length; i++) {
         HotSpotApp.EmbedMedia('page', HS_appContainer, HotSpotApp.AppData.PostActivityMedia[i]);
      }
   }

   HotSpotApp.buildPostActivityButtons();
};

/**
 * Adds the button(s) for the post activity into the app container.
 *
 * @method buildPostActivityButtons
 */
HotSpotApp.buildPostActivityButtons = function() {
   var HS_buttonSet = document.createElement('div');
   HS_buttonSet.id = 'HS_buttonSet';
   $(HS_buttonSet).hide().appendTo(HS_appContainer).fadeIn(500);
   //HS_appContainer.appendChild(HS_buttonSet);

   HS_buttonSet.appendChild(HotSpotApp.restartButton);
};

/**
 * Builds the current activity and adds it to the app container.
 *
 * @method buildActivity
 */
HotSpotApp.buildActivity = function() {
   document.getElementById('HS_header').innerHTML = '<h' + HotSpotApp.headingLevel + '>Activity: ' + HotSpotApp.Scenes[HotSpotApp.sceneNum].SceneName + '</h' + HotSpotApp.headingLevel + '>';

   for (i = 0; i < HotSpotApp.Scenes[HotSpotApp.sceneNum].HotSpots.length; i++) {
      HotSpotApp.allCompleted.splice(i, 1, false);
      HotSpotApp.correctCheck.splice(i, 1, false);
   }

   HS_hotSpot = document.createElement('div');
   HS_hotSpot.id = 'HS_hotSpot';
   HS_appContainer.appendChild(HS_hotSpot);

   var HS_instructions = document.createElement('p');
   HS_instructions.id = 'HS_instructions';

   if (HotSpotApp.Scenes[HotSpotApp.sceneNum].Instructions !== 'none' &&
      HotSpotApp.Scenes[HotSpotApp.sceneNum].Instructions !== null &&
      HotSpotApp.Scenes[HotSpotApp.sceneNum].Instructions !== undefined &&
      HotSpotApp.Scenes[HotSpotApp.sceneNum].Instructions !== '') {
      HS_instructions.innerHTML = 'Click or tab to each Hot Spot and select it by clicking or hitting the enter key to bring up a pop up activity relevant to the chosen object.<br/>' + HotSpotApp.Scenes[HotSpotApp.sceneNum].Instructions;
      $(HS_instructions).hide().appendTo(HS_hotSpot).fadeIn();
      //HS_hotSpot.appendChild(HS_instructions);
   } else {
      HS_instructions.innerHTML = 'Click or tab to each Hot Spot and select it by clicking or hitting the enter key to bring up a pop up activity relevant to the chosen object.';
      $(HS_instructions).hide().appendTo(HS_hotSpot).fadeIn();
      //HS_hotSpot.appendChild(HS_instructions);
   }

   var HS_scenetracker = document.createElement('p');
   HS_scenetracker.id = 'HS_scenetracker';

   if (HotSpotApp.Scenes.length > 1) {
      HS_scenetracker.innerHTML = '<em>You are currently on interactive scene</em> <strong>' + (HotSpotApp.sceneNum + 1) + '</strong> <em>of</em> <strong>' + HotSpotApp.AppData.ShowScenes + '</strong';
      $(HS_scenetracker).hide().appendTo(HS_hotSpot).fadeIn(500);
      //HS_hotSpot.appendChild(HS_scenetracker);
   }

   var HS_imageMap = document.createElement('img');
   HS_imageMap.id = 'HS_imageMap';
   HS_imageMap.src = HotSpotApp.Scenes[HotSpotApp.sceneNum].Background.src;
   HS_imageMap.alt = HotSpotApp.Scenes[HotSpotApp.sceneNum].Background.alt;
   HS_imageMap.setAttribute('usemap', '#HS_imageMapAreas');
   $(HS_imageMap).hide().appendTo(HS_hotSpot).fadeIn(500);
   // HS_hotSpot.appendChild(HS_imageMap);

   HS_imageMapAreas = document.createElement('map');
   HS_imageMapAreas.id = 'HS_imageMapAreas';
   HS_imageMapAreas.name = 'HS_imageMapAreas';
   $(HS_imageMapAreas).hide().appendTo(HS_hotSpot).fadeIn(500);
   // HS_hotSpot.appendChild(HS_imageMapAreas);

   var HS_progress = document.createElement('h' + (HotSpotApp.headingLevel + 2));
   HS_progress.id = 'HS_progress';
   HS_progress.innerHTML = 'Progress: <span id=\'HS_completed\'></span> / <span id=\'HS_total\'>' + HotSpotApp.allCompleted.length + '</span>';
   $(HS_progress).hide().appendTo(HS_hotSpot).fadeIn(500);
   // HS_hotSpot.appendChild(HS_progress);

   HotSpotApp.updateProgress();
   HotSpotApp.buildHotspots();

   $('#HS_imageMap').mapster(HotSpotApp.normalState);

   HotSpotApp.fitImage();

   HotSpotApp.buildActivityButtons();
};

/**
 * Adds the button(s) for the current activity into the app container.
 *
 * @method buildActivityButtons
 */
HotSpotApp.buildActivityButtons = function() {
   var HS_buttonSet = document.createElement('div');
   HS_buttonSet.id = 'HS_buttonSetHalf';

   $(HS_buttonSet).hide().appendTo(HS_hotSpot).fadeIn(500);
   // HS_hotSpot.appendChild(HS_buttonSet);

   HS_buttonSet.appendChild(HotSpotApp.nextButton);
   document.getElementById('HS_nextButton').disabled = true;
   $('#HS_nextButton').hide();

   if (HotSpotApp.sceneNum < HotSpotApp.maxScenes - 1) {
      $('.HS_buttonLabel').html('Next Activity');
   } else {
      if (HotSpotApp.noPost === false) {
         $('.HS_buttonLabel').html('Finish Activity');
      } else {
         $('.HS_buttonLabel').html('Reset Activity');
      }
   }
};

/**
 * Clears the app container.
 *
 * @method clearStage
 */
HotSpotApp.clearStage = function() {
   $('#HS_appContainer').empty();
};

/**
 * Builds the hot spots for the current activity and adds them to the app container.
 *
 * @method buildHotspots
 */
HotSpotApp.buildHotspots = function() {
   for (i = 0; i < HotSpotApp.Scenes[HotSpotApp.sceneNum].HotSpots.length; i++) {
      var coordArray = [];
      var coordString = '';

      if (HotSpotApp.Scenes[HotSpotApp.sceneNum].HotSpots[i].shapeType === 'circle') {
         var step = Math.PI / 20;
         var h = parseInt(HotSpotApp.Scenes[HotSpotApp.sceneNum].HotSpots[i].xPos); // X coordinate of the middle of the circle
         var k = parseInt(HotSpotApp.Scenes[HotSpotApp.sceneNum].HotSpots[i].yPos); // Y coordinate of the middle of the circle
         var r = parseInt(HotSpotApp.Scenes[HotSpotApp.sceneNum].HotSpots[i].radius); // Radius of the circle;

         for (theta = 0; theta < 2 * Math.PI; theta += step) {
            x = h + r * Math.cos(theta);
            y = k - r * Math.sin(theta);
            coordArray.push(x);
            coordArray.push(y);
         }

         coordString = coordArray.join();
      } else if (HotSpotApp.Scenes[HotSpotApp.sceneNum].HotSpots[i].shapeType === 'rectangle') {
         var width = parseInt(HotSpotApp.Scenes[HotSpotApp.sceneNum].HotSpots[i].shapeWidth);
         var height = parseInt(HotSpotApp.Scenes[HotSpotApp.sceneNum].HotSpots[i].shapeHeight);

         x = parseInt(HotSpotApp.Scenes[HotSpotApp.sceneNum].HotSpots[i].xPos);
         y = parseInt(HotSpotApp.Scenes[HotSpotApp.sceneNum].HotSpots[i].yPos);

         var x2 = x + width;
         var y2 = y + height;

         coordArray.push(x);
         coordArray.push(y);
         coordArray.push(x2);
         coordArray.push(y);
         coordArray.push(x2);
         coordArray.push(y2);
         coordArray.push(x);
         coordArray.push(y2);

         coordString = coordArray.join();
      } else if (HotSpotApp.Scenes[HotSpotApp.sceneNum].HotSpots[i].shapeType === 'custom') {
         coordString = HotSpotApp.Scenes[HotSpotApp.sceneNum].HotSpots[i].coords;
      }

      var tempArea = document.createElement('area');
      tempArea.setAttribute('class', 'HS_areaMap');
      tempArea.id = HotSpotApp.Scenes[HotSpotApp.sceneNum].HotSpots[i].id;
      tempArea.alt = 'Hot Spot Number ' + (i + 1) + ' Uncompleted. ' + HotSpotApp.Scenes[HotSpotApp.sceneNum].HotSpots[i].desc + ' Opens a pop up window.';
      tempArea.title = 'Uncompleted activity';
      tempArea.setAttribute('role', 'link');
      tempArea.setAttribute('aria-selected', false);
      tempArea.href = 'javascript:;';
      tempArea.coords = coordString;
      tempArea.shape = 'poly';

      tempArea.onfocus = function() {
         if (HotSpotApp.AppData.highlight === false) {
            $(this).addClass('highlightable');
         }
         this.setAttribute('aria-selected', true);
         $(this).mouseover();
      };

      tempArea.onblur = function() {
         if (HotSpotApp.AppData.highlight === false) {
            $(this).removeClass('highlightable');
         }
         this.setAttribute('aria-selected', false);
         $(this).mouseleave();
      };

      tempArea.onclick = function() {
         HotSpotApp.buildPopUp(this);
      };

      tempArea.onmouseleave = function() {
         if (HotSpotApp.AppData.highlight === false) {
            $('.HS_areaMap').each(function() {
               if ($(this).hasClass('highlightable')) {
                  $(this).removeClass('highlightable');
               }
            });
         }
         this.setAttribute('aria-selected', false);
      };

      if (HotSpotApp.AppData.highlight === true) {
         $(tempArea).addClass('highlightable');
      }

      HS_imageMapAreas.appendChild(tempArea);
   }
};

/**
 * Makes the hot spots non-selectable while a pop up window is open.
 *
 * @method hideHotspots
 */
HotSpotApp.hideHotspots = function() {
   $('.HS_areaMap').each(function() {
      this.setAttribute('tabindex', '-1');
   });
   document.getElementById('HS_nextButton').setAttribute('tabindex', '-1');
};

/**
 * Makes the hot spots selectable after a pop up window is closed.
 *
 * @method showHotspots
 */
HotSpotApp.showHotspots = function() {
   $('.HS_areaMap').each(function() {
      this.removeAttribute('tabindex');
   });
   document.getElementById('HS_nextButton').removeAttribute('tabindex');
};

/**
 * Adjusts the size of the entire hot spot (and the height of pop up YouTube videos) on window resize.
 *
 * @method fitImage
 */
HotSpotApp.fitImage = function() {
   // Gets the width of the hot spot's container
   var width = $('#HS_hotSpot').width();
   if (width > HotSpotApp.Scenes[HotSpotApp.sceneNum].Background.imgWidth) {
      width = HotSpotApp.Scenes[HotSpotApp.sceneNum].Background.imgWidth;
      $('#HS_hotSpot').css('width', width);
   }

   // Resizes the hot spot to the size of the container
   $('#HS_imageMap').mapster('resize', width, 0, 0);

   // If a pop up with an embedded video is open, it adjusts the videos height to scale
   if (HotSpotApp.activeActivity === true) {
      $('.HS_MediaEmbeddedVideo').each(function() {
         this.setAttribute('height', $(HS_questionContainer).width() * 0.5625);
      });

      // $(HS_questionContainer).css({
      //    'left': '25%',
      //    'right': '25%'
      // });
   }
};

/**
 * Builds the pop up for the designated hot spot and adds it to the app container.
 *
 * @method buildPopUp
 * @param {Object} target
 */
HotSpotApp.buildPopUp = function(target) {
   HotSpotApp.hideHotspots();

   var id = target.id;
   var header;
   var questionNum;
   var correctAnswer;

   // Checks to make sure an activity isn't already open(prevents opening another pop up while ones open)
   if (HotSpotApp.activeActivity === false) {
      // Sets an active indicator so another pop up cannot be opened until this one is closed
      HotSpotApp.activeActivity = true;

      // Assigns the pop up it's coordinates based on the hot spot that opened it
      var coordsArr = target.coords.split(',');

      x = coordsArr[0];
      y = coordsArr[1];

      var width = $('#HS_imageMap').width() / 2;

      // Establishes the offset amounts for the top/bottom of the pop up to account for the margins of the text elements above and below
      var offsetTop = $('#HS_instructions').outerHeight();
      // Establishes the offset amounts for the top of the pop up to account for the margins of the text elements above
      var offsetTopMargins = $('#HS_instructions').outerHeight(true);
      // Establishes the offset amounts for the bottom of the pop up to account for the margins of the text elements below
      var offsetBottom = $('#HS_progress').outerHeight();
      var offsetBottomMargins = $('#HS_progress').outerHeight(true);
      // Establishes the offset amount for the left/right of the pop up to account for the margins from the image being centered/not taking 100% of the containers width
      var offsetWidth;
      var offsetWidthMargins = $('#HS_hotSpot').width();

      // Height of the container - height of hotspot / 2 to get the height offset for the top
      offsetTopMargins = (offsetTopMargins - offsetTop) / 2;
      offsetTop += offsetTopMargins;

      // Height of the container - height of hotspot / 2 to get the height offset for the bottom
      offsetBottomMargins = (offsetBottomMargins - offsetBottom) / 2;
      offsetBottom += offsetBottomMargins;

      // Width of the container - width of hotspot / 2 to get the width offset for one side
      offsetWidth = ((offsetWidthMargins) - (width * 2)) / 2;

      // Starts the inital set up of the pop up window by building the window container and adds it to the document
      HS_questionContainer = document.createElement('div');
      HS_questionContainer.id = 'HS_questionContainer';

      $(HS_questionContainer).hide().appendTo('#HS_content').fadeIn(300);

      for (i = 0; i < HotSpotApp.Scenes[HotSpotApp.sceneNum].HotSpotContent.length; i++) {
         if (HotSpotApp.Scenes[HotSpotApp.sceneNum].HotSpotContent[i].key === id) {
            if (HotSpotApp.Scenes[HotSpotApp.sceneNum].HotSpotContent[i].popUpName !== null) {
               header = HotSpotApp.Scenes[HotSpotApp.sceneNum].HotSpotContent[i].popUpName;
            } else {
               header = 'Pop Up Activity';
            }
         }
      }

      var HS_popUpButtonSet = document.createElement('div');
      HS_popUpButtonSet.id = 'HS_popUpButtonSet';
      HS_questionContainer.appendChild(HS_popUpButtonSet);

      // Builds the close button
      var close = document.createElement('button');
      close.id = 'HS_closeButton';
      close.alt = 'Close the pop up window';
      close.setAttribute('title', 'Closes the Pop Up Without Finishing');

      close.onclick = function() {
         //removes the window, removes the active indicator, but doesn't mark as completed
         $('#HS_questionContainer').remove();
         HotSpotApp.activeActivity = false;
         HotSpotApp.showHotspots();
      };

      // Adds the close button to the pop up window
      HS_popUpButtonSet.appendChild(close);

      // Builds the container for the pop up's content, and adds it to the pop up
      HS_question = document.createElement('div');
      HS_question.id = 'HS_question';
      HS_questionContainer.appendChild(HS_question);

      var HS_popUpHeader = document.createElement('h' + (HotSpotApp.headingLevel + 1));
      HS_popUpHeader.id = 'HS_popUpHeader';
      HS_popUpHeader.innerHTML = header;
      HS_question.appendChild(HS_popUpHeader);

      var HS_bottomButtonSet = document.createElement('div');
      HS_bottomButtonSet.id = 'HS_bottomButtonSet';
      HS_questionContainer.appendChild(HS_bottomButtonSet);

      // Builds the finish button for the pop up window
      var HS_finishButton = document.createElement('button');
      HS_finishButton.id = 'HS_finishButton';
      HS_finishButton.setAttribute('class', 'HS_popUpButton');
      HS_finishButton.setAttribute('title', 'Finishes and Closes the Pop Up Window');

      HS_finishButton.onclick = function() {
         // Removes the pop up window
         $('#HS_questionContainer').fadeOut(300, function() {
            $('#HS_questionContainer').remove();
         });
         HotSpotApp.showHotspots();

         for (i = 0; i < HotSpotApp.Scenes[HotSpotApp.sceneNum].HotSpotContent.length; i++) {
            if (HotSpotApp.Scenes[HotSpotApp.sceneNum].HotSpotContent[i].key === id) {
               // If it's an assessment type pop up
               if (HotSpotApp.Scenes[HotSpotApp.sceneNum].HotSpotContent[i].activityType === 'assessment') {
                  // If the quiz result has been marked as correct
                  if (HotSpotApp.correctCheck[i] === true) {
                     // If the quiz has already been completed(meaning a correctness state already exists)
                     if (HotSpotApp.allCompleted[i] === true) {
                        // Clear any existing correctness styles
                        $('#' + id).mapster('set', false, HotSpotApp.wrongState);
                        $('#' + id).mapster('set', false, HotSpotApp.correctState);

                        // Apply the correct state, and mark the activity as complete
                        $('#' + id).mapster('set', true, HotSpotApp.correctState);
                        HotSpotApp.activeActivity = false;
                        HotSpotApp.allCompleted.splice(i, 1, true);
                     }
                     // If the quiz hasn't been completed yet(meaning no correctness state exists)
                     else {
                        // Apply the correct state, and mark the activity as complete
                        $('#' + id).mapster('set', true, HotSpotApp.correctState);
                        HotSpotApp.activeActivity = false;
                        HotSpotApp.allCompleted.splice(i, 1, true);
                     }
                  }
                  // If the quiz result has been marked as wrong
                  else {
                     // If the quiz has already been completed(meaning a correctness state already exists)
                     if (HotSpotApp.allCompleted[i] === true) {
                        // Clear any existing correctness styles
                        $('#' + id).mapster('set', false, HotSpotApp.wrongState);
                        $('#' + id).mapster('set', false, HotSpotApp.correctState);

                        // Apply the wrong state, and mark the activity as complete
                        $('#' + id).mapster('set', true, HotSpotApp.wrongState);
                        HotSpotApp.activeActivity = false;
                        HotSpotApp.allCompleted.splice(i, 1, true);
                     }
                     // If the quiz hasn't been completed(meaning no correctness state exists)
                     else {
                        // Apply the wrong state, and mark the activity as complete
                        $('#' + id).mapster('set', true, HotSpotApp.wrongState);
                        HotSpotApp.activeActivity = false;
                        HotSpotApp.allCompleted.splice(i, 1, true);
                     }
                  }
               }
               // If it's a presentation type popup, it can only be marked correct for completion
               else {
                  // Apply the correct state, and mark the activity as complete
                  $('#' + id).mapster('set', true, HotSpotApp.correctState);
                  HotSpotApp.activeActivity = false;
                  HotSpotApp.allCompleted.splice(i, 1, true);
               }
            }
         }

         HotSpotApp.updateProgress();

         var str = document.getElementById(id).alt;
         var res = str.replace('Uncompleted.', 'Completed.');
         document.getElementById(id).alt = res;

         document.getElementById(id).title = 'Completed activity.';

         // if ($('.d2l-page-title', window.parent.document).length > 0) {
         //    $('body', window.parent.document).animate({
         //       scrollTop: $('.d2l-page-title', window.parent.document).offset().top
         //    }, 1000);
         // }
      };

      // Label for the finish button
      var HS_finishLabel = document.createElement('span');
      HS_finishLabel.setAttribute('class', 'HS_buttonLabel');
      HS_finishLabel.innerHTML = 'Continue';

      // Adds the button to the pop up window
      HS_finishButton.appendChild(HS_finishLabel);
      HS_bottomButtonSet.appendChild(HS_finishButton);

      // Checks all of the hot spot content for the one whose key matches the id of the one you clicked on
      for (i = 0; i < HotSpotApp.Scenes[HotSpotApp.sceneNum].HotSpotContent.length; i++) {
         if (HotSpotApp.Scenes[HotSpotApp.sceneNum].HotSpotContent[i].key === id) {
            // If the content is presentation type, it will build each specified media/content piece and put it inside the pop up
            if (HotSpotApp.Scenes[HotSpotApp.sceneNum].HotSpotContent[i].activityType === 'presentation') {
               if (HotSpotApp.Scenes[HotSpotApp.sceneNum].HotSpotContent[i].hotSpotMedia !== 'none' &&
                  HotSpotApp.Scenes[HotSpotApp.sceneNum].HotSpotContent[i].hotSpotMedia !== null &&
                  HotSpotApp.Scenes[HotSpotApp.sceneNum].HotSpotContent[i].hotSpotMedia !== undefined &&
                  HotSpotApp.Scenes[HotSpotApp.sceneNum].HotSpotContent[i].hotSpotMedia !== '') {
                  for (j = 0; j < HotSpotApp.Scenes[HotSpotApp.sceneNum].HotSpotContent[i].hotSpotMedia.length; j++) {
                     HotSpotApp.EmbedMedia('window', HS_question, HotSpotApp.Scenes[HotSpotApp.sceneNum].HotSpotContent[i].hotSpotMedia[j]);
                  }
               }
            }
            // If the content is assessment type, it will build a multiple choice quiz based inside the pop up
            else if (HotSpotApp.Scenes[HotSpotApp.sceneNum].HotSpotContent[i].activityType === 'assessment') {
               // Saves the index number of the question to be used later
               questionNum = i;

               // Disables the finish button until the quiz is completed
               document.getElementById('HS_finishButton').disabled = true;
               $('#HS_finishButton').hide();

               // Loads and adds the question for the quiz to the pop up
               var HS_quizText = document.createElement('p');
               HS_quizText.id = 'HS_quizText';
               HS_quizText.innerHTML = HotSpotApp.Scenes[HotSpotApp.sceneNum].HotSpotContent[i].questionText;
               HS_question.appendChild(HS_quizText);

               // Loads and adds the fieldset for the quiz to the pop up
               var HS_fieldSet = document.createElement('fieldset');
               HS_fieldSet.id = 'HS_fieldSet';
               HS_fieldSet.innerHTML = '<legend>Answers:</legend>';
               HS_question.appendChild(HS_fieldSet);

               // Loads all of the answers for the quiz, builds the inputs for them, and adds them to the pop up
               for (j = 0; j < HotSpotApp.Scenes[HotSpotApp.sceneNum].HotSpotContent[i].answers.length; j++) {
                  // Checks to see which answer is correct, and saves it's index for later
                  if (HotSpotApp.Scenes[HotSpotApp.sceneNum].HotSpotContent[i].answers[j].correct === true) {
                     correctAnswer = j;
                  }

                  var HS_answer = document.createElement('div');
                  HS_answer.setAttribute('class', 'HS_answer');
                  $(HS_answer).click(function() {
                     $(this.firstChild).prop('checked', true);
                  });

                  var HS_input = document.createElement('input');
                  HS_input.setAttribute('class', 'HS_input');
                  HS_input.setAttribute('type', 'radio');
                  HS_input.setAttribute('name', 'qu');
                  HS_input.setAttribute('value', j);
                  HS_input.id = 'qu' + j;

                  var HS_label = document.createElement('label');
                  HS_label.setAttribute('for', 'qu' + j);
                  HS_label.setAttribute('class', 'HS_label');
                  HS_label.innerHTML = HotSpotApp.Scenes[HotSpotApp.sceneNum].HotSpotContent[i].answers[j].answerText;

                  HS_answer.appendChild(HS_input);
                  HS_answer.appendChild(HS_label);
                  HS_fieldSet.appendChild(HS_answer);
               }

               // Builds the submit button for the pop up window (only gets built for assessment type pop ups)
               var HS_submitButton = document.createElement('button');
               HS_submitButton.id = 'HS_submitButton';
               HS_submitButton.setAttribute('class', 'HS_popUpButton');
               HS_submitButton.setAttribute('title', 'Submits your answer');
               HS_submitButton.href = '#';

               HS_submitButton.onclick = function() {
                  // Will evaluate the quiz, passes the question number index, and the correct answer index
                  HotSpotApp.EvaluateScore(questionNum, correctAnswer);
               };

               // Label for the submit button
               var HS_submitLabel = document.createElement('span');
               HS_submitLabel.setAttribute('class', 'HS_buttonLabel');
               HS_submitLabel.innerHTML = 'Submit Answer';

               // Adds the submit button to the pop up
               HS_submitButton.appendChild(HS_submitLabel);
               $(HS_submitButton).prependTo(HS_bottomButtonSet);
            }
         }
      }
   }

   // var heightAdjust = (parseInt($('#HS_imageMap').css('height')) - parseInt($(HS_questionContainer).css('height'))) / 2;

   // if (heightAdjust > 0) {
   //    $(HS_questionContainer).css({
   //       'top': $('#HS_imageMap').offset().top + heightAdjust + 'px'
   //    });
   // } else {
   $(HS_questionContainer).css({
      'top': $('#HS_imageMap').offset().top + 'px'
   });
   // }

   // $(HS_questionContainer).css({
   //    'left': '25%',
   //    'right': '25%'
   // });

   HotSpotApp.fitImage();
   $('#HS_closeButton').focus();
};

/**
 * Description
 *
 * @method EvaluateScore
 * @param {Integer} questionNum
 * @param {Integer} correctAnswer
 */
HotSpotApp.EvaluateScore = function(questionNum, correctAnswer) {
   // Gets the value associated with the answer that you chose
   var idNum = parseInt($('input[name=qu]:checked').val());
   // Selects the container for the chosen answer
   var questionCont = document.getElementById('qu' + idNum).parentNode;
   // Loads the correct and wrong indicators for visual feedback
   var correct = '<img class="correct" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAANCAYAAACgu+4kAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyhpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMDE0IDc5LjE1Njc5NywgMjAxNC8wOC8yMC0wOTo1MzowMiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTQgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6Njk0QjdFOUFFQUFGMTFFNDg4MjBGN0M3OURFRTYyRDYiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6Njk0QjdFOUJFQUFGMTFFNDg4MjBGN0M3OURFRTYyRDYiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo2OTRCN0U5OEVBQUYxMUU0ODgyMEY3Qzc5REVFNjJENiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo2OTRCN0U5OUVBQUYxMUU0ODgyMEY3Qzc5REVFNjJENiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PllHhcQAAACASURBVHjaYmIgB2zx7wBjIGAhSzMDQzmUzcBEtmYI4GeiQPMMIM5iokQzg8/G/0xQBYzkaAZxmKCap8FClRTNEANAmhkYMsAKkQ0hQjMsGj8i8UGGINgENIMAIw7bGIjRDPMCA1CyAkh2kqoZYQB2QwhqRngBM+T5idEMAgABBgBezD9OGUJHCwAAAABJRU5ErkJggg==" alt="right check mark" disabled/>';
   var wrong = '<img class="wrong" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAANCAYAAACgu+4kAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyhpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMDE0IDc5LjE1Njc5NywgMjAxNC8wOC8yMC0wOTo1MzowMiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTQgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6REI5RDZEMTdFQUFGMTFFNDg4MjBGN0M3OURFRTYyRDYiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6REI5RDZEMThFQUFGMTFFNDg4MjBGN0M3OURFRTYyRDYiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo2OTRCN0U5Q0VBQUYxMUU0ODgyMEY3Qzc5REVFNjJENiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpEQjlENkQxNkVBQUYxMUU0ODgyMEY3Qzc5REVFNjJENiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PuBTV64AAAC/SURBVHjahJPRDcIwDETtCLEAjARSv/iL0hXoQGUFoi5QCUaCBfgJDnJQmubSSlak691zaqscQqA3n/dENEnNR3reCDwvOl3l6KTsITw+UTP6LoYvUqOaUHhU35T0BJgz7wqShan0/wB67aEGqYSH/DM5zoCZUScv5WrhmFsBAKTaGQIUci86ewn3uScBDJi2K2SHtmM2pu1b21kAwLR7tJ0FoLWq1orzG3Ro2gDy9+/0tFv/QtSlcwrbpH8FGAC2umDxE/BZxwAAAABJRU5ErkJggg==" alt="wrong x" disabled/>';

   // Disables the submit button to prevent re-submits, and enables the finish button
   document.getElementById('HS_submitButton').disabled = true;
   document.getElementById('HS_finishButton').disabled = false;
   $('#HS_finishButton').fadeIn(500);
   $('#HS_submitButton').fadeOut(250);

   // Styles the container of the answer that was chosen
   $(questionCont).addClass('HS_userSelected');

   // Checks to see if feedback needs to be provided, if so, it loads the feedback associated with the chosen answer and adds it to the pop up
   if (HotSpotApp.Scenes[HotSpotApp.sceneNum].HotSpotContent[questionNum].feedback === true) {
      if (HotSpotApp.Scenes[HotSpotApp.sceneNum].HotSpotContent[questionNum].answers[idNum].feedback !== 'none' &&
         HotSpotApp.Scenes[HotSpotApp.sceneNum].HotSpotContent[questionNum].answers[idNum].feedback !== null &&
         HotSpotApp.Scenes[HotSpotApp.sceneNum].HotSpotContent[questionNum].answers[idNum].feedback !== undefined &&
         HotSpotApp.Scenes[HotSpotApp.sceneNum].HotSpotContent[questionNum].answers[idNum].feedback !== '') {
         var HS_feedback = document.createElement('div');
         HS_feedback.id = 'HS_feedback';
         $(HS_feedback).addClass('bg-light');
         HS_feedback.innerHTML = '<p class="HS_feedbackText"><strong class="HS_feedbackTitle">Feedback:  </strong><br>' + HotSpotApp.Scenes[HotSpotApp.sceneNum].HotSpotContent[questionNum].answers[idNum].feedback + '</p>';

         $(HS_feedback).hide().appendTo(HS_question).slideDown(500);
         // HS_question.appendChild(HS_feedback);
      }
   }

   // Compares the chosen answer to the correct one, and assign's a correctness value accordingly
   if (idNum === correctAnswer) {
      HotSpotApp.correctCheck[questionNum] = true;
   } else {
      HotSpotApp.correctCheck[questionNum] = false;
   }

   // Assigns the correct and wrong visual indicators
   $('.HS_answer').each(function(index) {
      if (index === correctAnswer) {
         $(correct).hide().appendTo(this).fadeIn(500);
         // $(correct).appendTo(this);
      } else {
         $(wrong).hide().appendTo(this).fadeIn(500);
         // $(wrong).appendTo(this);
      }
   });
};

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
   mediaDomObj.setAttribute('class', 'HS_Media');

   switch (mediaData.type) {
      case 'link':
         mediaDomContent = document.createElement('a');
         mediaDomContent.setAttribute('class', 'HS_MediaLink');
         mediaDomContent.setAttribute('href', mediaData.src);
         mediaDomContent.setAttribute('target', '_blank');

         if (mediaData.description) {
            mediaDomContent.innerHTML = mediaData.description;
         } else {
            mediaDomContent.innerHTML = 'Link';
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
            mediaDomContent.setAttribute('width', '100%');
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

         if (mediaData.mediaLink !== 'none' &&
            mediaData.mediaLink !== null &&
            mediaData.mediaLink !== undefined &&
            mediaData.mediaLink !== '') {
            mediaDomObj.appendChild(mediaDomContent);
         } else {
            mediaDomLink.appendChild(mediaDomContent);
            mediaDomObj.appendChild(mediaDomLink);
         }

         break;

      case 'YouTubeVideo':
         validSrc = HotSpotApp.validateYouTubeLink(mediaData.src);
         if (validSrc) {
            mediaDomContent = document.createElement('iframe');
            mediaDomContent.setAttribute('class', 'HS_MediaEmbeddedVideo');

            if (type === 'window') {
               mediaDomContent.setAttribute('width', '100%');
               mediaDomContent.setAttribute('height', ($(HS_questionContainer).width() * 0.5625));
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

            mediaDomContent.setAttribute('frameborder', '0');
            mediaDomContent.setAttribute('allowfullscreen', 'true');
            mediaDomContent.setAttribute('style', 'padding-bottom: 10px 0px;');

            mediaDomContent.setAttribute('src', validSrc);
            mediaDomObj.setAttribute('style', 'text-align:center;');

            if (mediaData.description) {
               mediaDomContent.setAttribute('alt', mediaData.description);
            }

            mediaDomObj.appendChild(mediaDomContent);

            mediaDomLink = document.createElement('a');
            mediaDomLink.setAttribute('class', 'HS_MediaAltLink');
            mediaDomLink.setAttribute('href', mediaData.altLink);
            mediaDomLink.setAttribute('target', '_blank');
            mediaDomLink.innerHTML = 'Alternate Link.';

            mediaDomObj.appendChild(mediaDomLink);
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

   $(mediaDomObj).hide().appendTo(containerRef).fadeIn(500);
   // containerRef.appendChild(mediaDomObj);
};

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
};

/**
 * Checks to see if all the hot spots have been completed, and if so, it allows access to either the next activity or the post activity content.
 *
 * @method updateProgress
 */
HotSpotApp.updateProgress = function() {
   var completed = 0;

   for (i = 0; i < HotSpotApp.allCompleted.length; i++) {
      if (HotSpotApp.allCompleted[i] === true) {
         completed++;
      }
   }

   if (completed === HotSpotApp.allCompleted.length) {
      //enables the continue button after all the activities are completed
      document.getElementById('HS_nextButton').disabled = false;
      $('#HS_nextButton').fadeIn(500);
   }

   document.getElementById('HS_completed').innerHTML = completed;
};

/**
 * Takes the passed array and shuffles it into a random order.
 *
 * @method shuffle
 * @param {Array} array
 * @return {Array} array(shuffled)
 */
HotSpotApp.shuffle = function(array) {
   var m = array.length,
      t, i;

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
   // Custom code will go here
};

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
