/**
* 
* File : hotspotEngine.js
* 
* Project : Vanilla - Hot Spot Tool
* 
* Author : Justin Schlumkoski
* 
* Created : 05/11/2015
*
* Last Modified : 06/16/2015
* 
* Description : This is the engine that builds a hot spot activity using a user-created data file.
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
 * activeActivity - Holds whether or not a pop up window is open/active. Boolean.
 * ti - Holds the tab index. Integer.
 * currentAttempts - Holds the number of times the activity has been played. Integer.
 * normalState - Holds the fill/hover parameters for the visual indicator. Object.
 * completeState - Holds the fill parameters for the complete/correct visual indicator. Object.
 * wrongState - Holds the fill paramters for the wronf visual indicator. Object.
 * restartButton - Holds the parameters for the restart button. Object.
 * startButton - Holds the parameters for the start button. Object.
 * nextButton - Holds the parameters for the next button. Object.
 * allCompleted - Holds whether or not each hot spot has been completed. Array.
 * correctCheck - Holds whether or not each hot spot has been answered correctly. Array.
 */
var HotSpotApp = {
	AppData : null,
	sceneNum: 0,
	maxScenes : null,
	containerRef : null,
	mobileDevice : false,
	activeActivity: false,
	ti : 1,
	currentAttempts: 0,
	normalState: null,
	completeState: null,
	wrongState: null,
	restartButton: null,
	startButton: null,
	nextButton: null,
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

	HotSpotApp.buildColourKeys();
	HotSpotApp.buildAppFrame();
	HotSpotApp.loadButtons();

	if (HotSpotApp.AppData.PreActivityText == "none"){
		if (HotSpotApp.AppData.PreActivityMedia == "none"){
			HotSpotApp.buildActivity();
		}
		else {
			HotSpotApp.buildPreActivity();
		}
	}
	else {
		HotSpotApp.buildPreActivity();
	}
}

/**
 * Function: buildColourKeys
 * 
 * Sets up the fill/hover/complete/wrong colour parameters for the visual indicators.
 * 
 */
HotSpotApp.buildColourKeys = function(){
	var fillColour = HotSpotApp.AppData.visibleStyle.colour.substr(1, HotSpotApp.AppData.visibleStyle.colour.length);
	var fillOpacity = (parseInt(HotSpotApp.AppData.visibleStyle.opacity.substr(0, HotSpotApp.AppData.visibleStyle.opacity.length-1)))/100;
	var fillStroke = HotSpotApp.AppData.visibleStyle.stroke;
	var fillStrokeColour = HotSpotApp.AppData.visibleStyle.strokeColour.substr(1, HotSpotApp.AppData.visibleStyle.strokeColour.length);
	var fillStrokeWidth = parseInt(HotSpotApp.AppData.visibleStyle.strokeWidth);

	var highlightColour = HotSpotApp.AppData.highlightStyle.colour.substr(1, HotSpotApp.AppData.highlightStyle.colour.length);
	var highlightOpacity = (parseInt(HotSpotApp.AppData.highlightStyle.opacity.substr(0, HotSpotApp.AppData.highlightStyle.opacity.length-1)))/100;
	var highlightStroke = HotSpotApp.AppData.highlightStyle.stroke;
	var highlightStrokeColour = HotSpotApp.AppData.highlightStyle.strokeColour.substr(1, HotSpotApp.AppData.highlightStyle.strokeColour.length);
	var highlightStrokeWidth = parseInt(HotSpotApp.AppData.highlightStyle.strokeWidth);

	HotSpotApp.normalState = {
		staticState: true,
		highlight: true,
		fade: false,
		fadeDuration: 0
	}

	HotSpotApp.correctState = {
		fillColor: '00FF00',
		fillOpacity: 0.5
	}

	HotSpotApp.wrongState = {
		fillColor: 'FF0000',
		fillOpacity: 0.5
	}

	if (HotSpotApp.AppData.visible == true){
		HotSpotApp.normalState.fillColor = fillColour;
		HotSpotApp.normalState.fillOpacity = fillOpacity;
		HotSpotApp.normalState.stroke = fillStroke;

		if (fillStroke == true){
			HotSpotApp.normalState.strokeColor = fillStrokeColour;
			HotSpotApp.normalState.strokeWidth = fillStrokeWidth;
		}
	}
	else {
		if (HotSpotApp.AppData.highlight == true && HotSpotApp.mobileDevice == true){
			HotSpotApp.normalState.fillColor = highlightColour;
			HotSpotApp.normalState.fillOpacity = highlightOpacity/2;
			HotSpotApp.normalState.stroke = highlightStroke;

			if (highlightStroke == true){
				HotSpotApp.normalState.strokeColor = highlightStrokeColour;
				HotSpotApp.normalState.strokeWidth = highlightStrokeWidth;
				HotSpotApp.normalState.strokeOpacity = 0.5;
			}
		}
		else {
			HotSpotApp.normalState.fillColor = 'FFFFFF';
			HotSpotApp.normalState.fillOpacity = 0;
		}
	}

	if (HotSpotApp.AppData.highlight == true){
		HotSpotApp.normalState.render_highlight = {};

		HotSpotApp.normalState.render_highlight.fillColor = highlightColour;
		HotSpotApp.normalState.render_highlight.fillOpacity = highlightOpacity;
		HotSpotApp.normalState.render_highlight.stroke = highlightStroke;

		if (highlightStroke == true){
			HotSpotApp.normalState.render_highlight.strokeColor = highlightStrokeColour;
			HotSpotApp.normalState.render_highlight.strokeWidth = highlightStrokeWidth;
		}
	}
	else {
		HotSpotApp.normalState.render_highlight = {};

		HotSpotApp.normalState.render_highlight.fillColor = 'FFFFFF';
		HotSpotApp.normalState.render_highlight.fillOpacity = 0;
		HotSpotApp.normalState.render_highlight.stroke = true;
		HotSpotApp.normalState.render_highlight.strokeColor = "00FFFF";
		HotSpotApp.normalState.render_highlight.strokeWidth = 3;
	}
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

	var HS_appContainer = document.createElement("div");
	HS_appContainer.id = "HS_appContainer";
	HS_content.appendChild(HS_appContainer);
}

/**
 * Function: loadButtons
 * 
 * Sets up all the parameters for each button and stores them in an object.
 * 
 */
HotSpotApp.loadButtons = function() {

	var HS_buttonIcon = document.createElement("div");
	HS_buttonIcon.setAttribute("class", "HS_buttonIcon");

    var HS_restartButton = document.createElement("button");
	HS_restartButton.id = "HS_restartButton";
	HS_restartButton.setAttribute("class", "HS_button");
	HS_restartButton.setAttribute("title", "Restarts the Activity");
	HS_restartButton.onclick = function(){	
	
		if($(".d2l-page-title", window.parent.document).length > 0) {
			$("body", window.parent.document).animate({
				  scrollTop: $(".d2l-page-title", window.parent.document).offset().top
			}, 1000);
		}  
	
		var hintBtn;
		HotSpotApp.clearStage();
		HotSpotApp.resetActivityData();
		HotSpotApp.sceneNum = 0;
		
		if (HotSpotApp.PreActivityText == null || HotSpotApp.PreActivityText == "" || HotSpotApp.PreActivityText == "none"){
			if (HotSpotApp.PreActivityMedia == null || HotSpotApp.PreActivityMedia == "" || HotSpotApp.PreActivityMedia == "none"){
				HotSpotApp.buildActivity();
			}
			else {
				HotSpotApp.buildPreActivity();
			}
		}
		else {
			HotSpotApp.buildPreActivity();
		}
	};

    var HS_restartLabel = document.createElement("span");
	HS_restartLabel.setAttribute("class", "HS_buttonLabel");
	HS_restartLabel.innerHTML = "Restart";
	HS_restartButton.appendChild(HS_buttonIcon);
	HS_restartButton.appendChild(HS_restartLabel);

    HotSpotApp.restartButton = HS_restartButton;


	var HS_buttonIcon = document.createElement("div");
	HS_buttonIcon.setAttribute("class", "HS_buttonIcon");

    var HS_startButton = document.createElement("button");
    HS_startButton.id = "HS_startButton";
    HS_startButton.setAttribute("class", "HS_button");
    HS_startButton.setAttribute("title", "Starts the Activity");
    HS_startButton.onclick = function(){	
	
		if($(".d2l-page-title", window.parent.document).length > 0) {
			$("body", window.parent.document).animate({
				  scrollTop: $(".d2l-page-title", window.parent.document).offset().top
			}, 1000);
		}  
			
			var hintBtn;
	    	HotSpotApp.clearStage();
	    	HotSpotApp.buildActivity();
	    	//HotSpotApp.timerInterval = setInterval(HotSpotApp.timer, 1000);
    };

    var HS_startLabel = document.createElement("span");
    HS_startLabel.setAttribute("class", "HS_buttonLabel");
    HS_startLabel.innerHTML = "Start Activity";
    HS_startButton.appendChild(HS_buttonIcon);
    HS_startButton.appendChild(HS_startLabel);

    HotSpotApp.startButton = HS_startButton;


	var HS_buttonIcon = document.createElement("div");
	HS_buttonIcon.setAttribute("class", "HS_buttonIcon");

    var HS_nextButton = document.createElement("button");
	HS_nextButton.id = "HS_nextButton";
	HS_nextButton.setAttribute("class", "HS_button");
	HS_nextButton.setAttribute("title", "Moves to the Next Part of the Activity");
	HS_nextButton.onclick = function(){	
	
	if($(".d2l-page-title", window.parent.document).length > 0) {
		$("body", window.parent.document).animate({
			  scrollTop: $(".d2l-page-title", window.parent.document).offset().top
		}, 1000);
	}  var hintBtn;
	
		HotSpotApp.clearStage();
		HotSpotApp.sceneNum++;

		if (HotSpotApp.sceneNum < HotSpotApp.maxScenes){
			HotSpotApp.resetActivityData();
			HotSpotApp.buildActivity();
			//console.log(HotSpotApp.sceneNum, HotSpotApp.maxScenes);
		}
		else {
			HotSpotApp.currentAttempts++;
			HotSpotApp.onComplete();
			HotSpotApp.buildPostActivity();
			//console.log(HotSpotApp.sceneNum, HotSpotApp.maxScenes);
		}
	};

    var HS_nextLabel = document.createElement("span");
	HS_nextLabel.setAttribute("class", "HS_buttonLabel");
	HS_nextButton.appendChild(HS_buttonIcon);
	HS_nextButton.appendChild(HS_nextLabel);

    HotSpotApp.nextButton = HS_nextButton;

}

/**
 * Function: buildPreActivity
 * 
 * Builds the pre activity inside of the app container.
 * 
 */
HotSpotApp.buildPreActivity = function() {
	//HotSpotApp.ti = 1;
	if (HotSpotApp.AppData.Randomize == true){
		HotSpotApp.shuffle(HotSpotApp.Scenes);
	}

	if (HotSpotApp.AppData.PreActivityText != "none"){
		var HS_preActivityText = document.createElement("p");
		HS_preActivityText.id = "HS_preActivityText";
		HS_preActivityText.innerHTML = HotSpotApp.AppData.PreActivityText;
		HS_appContainer.appendChild(HS_preActivityText);
	}

	if (HotSpotApp.AppData.PreActivityMedia != "none"){
		for (var i = 0; i < HotSpotApp.AppData.PreActivityMedia.length; i++){
      		HotSpotApp.EmbedMedia("page", HS_appContainer, HotSpotApp.AppData.PreActivityMedia[i]);
		}
	}	

	HotSpotApp.buildPreActivityButtons();

	//$("HS_appContainer").focus();
}

/**
 * Function: buildPreActivityButtons
 * 
 * Adds the button(s) for the pre activity into the app container.
 * 
 */
HotSpotApp.buildPreActivityButtons = function() {
	var HS_buttonSet = document.createElement("div");
	HS_buttonSet.id = "HS_buttonSet";
	HS_appContainer.appendChild(HS_buttonSet);

	HS_buttonSet.appendChild(HotSpotApp.startButton);
	// HotSpotApp.startButton.setAttribute("tabindex", HotSpotApp.ti);
	// HotSpotApp.ti++;
}

/**
 * Function: buildPostActivity
 * 
 * Builds the post activity inside of the app container.
 * 
 */
HotSpotApp.buildPostActivity = function() {
	//HotSpotApp.ti = 1;
	document.getElementById("HS_header").innerHTML = "<h1>" + HotSpotApp.AppData.ActivityName + "</h1>";

	if (HotSpotApp.AppData.PostActivityText != "none"){
		var HS_postActivityText = document.createElement("p");
		HS_postActivityText.id = "HS_postActivityText";
		HS_postActivityText.innerHTML = HotSpotApp.AppData.PostActivityText;
		HS_appContainer.appendChild(HS_postActivityText);
	}
	else {
		var HS_postActivityText = document.createElement("p");
		HS_postActivityText.id = "HS_postActivityText";
		HS_postActivityText.innerHTML = "You have completed the activity!";
		HS_appContainer.appendChild(HS_postActivityText);
	}

	if (HotSpotApp.AppData.PostActivityMedia != "none"){
		for (var i = 0; i < HotSpotApp.AppData.PostActivityMedia.length; i++){
      		HotSpotApp.EmbedMedia("page", HS_appContainer, HotSpotApp.AppData.PostActivityMedia[i]);
		}
	}	

	HotSpotApp.buildPostActivityButtons();

	// $("[tabindex=1]").focus();
}

/**
 * Function: buildPostActivityButtons
 * 
 * Adds the button(s) for the post activity into the app container.
 * 
 */
HotSpotApp.buildPostActivityButtons = function() {
	var HS_buttonSet = document.createElement("div");
	HS_buttonSet.id = "HS_buttonSet";
	HS_appContainer.appendChild(HS_buttonSet);

	HS_buttonSet.appendChild(HotSpotApp.restartButton);
	// HotSpotApp.restartButton.setAttribute("tabindex", HotSpotApp.ti);
	// HotSpotApp.ti++;
}

/**
 * Function: buildActivity
 * 
 * Builds the current activity and adds it to the app container.
 * 
 */
HotSpotApp.buildActivity = function(){
	//HotSpotApp.ti = 1;
	/*
	document.getElementById("HS_header").innerHTML = "<h1>Activity " + (HotSpotApp.sceneNum + 1) + ": " + HotSpotApp.Scenes[HotSpotApp.sceneNum].SceneName + "</h1>"; */
	
	document.getElementById("HS_header").innerHTML = "<h1>Activity: " + HotSpotApp.Scenes[HotSpotApp.sceneNum].SceneName + "</h1>";

	for (var i = 0; i < HotSpotApp.Scenes[HotSpotApp.sceneNum].HotSpots.length; i++){
		HotSpotApp.allCompleted.splice(i, 1, false);
		HotSpotApp.correctCheck.splice(i, 1, false);
	}

	var HS_hotSpot = document.createElement("div");
	HS_hotSpot.id = "HS_hotSpot";
	HS_appContainer.appendChild(HS_hotSpot);

	var HS_instructions = document.createElement("p");
	HS_instructions.id = "HS_instructions";

	if (HotSpotApp.Scenes[HotSpotApp.sceneNum].Instructions != "none"){
		HS_instructions.innerHTML = "Click or tab to each Hot Spot and select it by clicking or hitting the enter key to bring up a pop up activity relevant to the chosen object.<br/>" + HotSpotApp.Scenes[HotSpotApp.sceneNum].Instructions;
		HS_hotSpot.appendChild(HS_instructions);
	}
	else {
		HS_instructions.innerHTML = "Click or tab to each Hot Spot and select it by clicking or hitting the enter key to bring up a pop up activity relevant to the chosen object.<br/>";
		HS_hotSpot.appendChild(HS_instructions);
	}

	var HS_scenetracker = document.createElement("p");
	HS_scenetracker.id = "HS_scenetracker";

	if (HotSpotApp.Scenes.length > 1){
		HS_scenetracker.innerHTML = "<em>You are currently on interactive scene</em> <strong>" + (HotSpotApp.sceneNum+1) + "</strong> <em>of</em> <strong>" + HotSpotApp.Scenes.length + "</strong";
		HS_hotSpot.appendChild(HS_scenetracker);
	}
	else {
	}

	var HS_imageMap = document.createElement("img");
	HS_imageMap.id = "HS_imageMap";
	HS_imageMap.src = HotSpotApp.Scenes[HotSpotApp.sceneNum].Background.src;
	HS_imageMap.alt = HotSpotApp.Scenes[HotSpotApp.sceneNum].Background.alt;
	HS_imageMap.setAttribute("usemap", "#HS_imageMapAreas");
	HS_hotSpot.appendChild(HS_imageMap);

	var HS_imageMapAreas = document.createElement("map");
	HS_imageMapAreas.id = "HS_imageMapAreas";
	HS_imageMapAreas.name = "HS_imageMapAreas";
	HS_hotSpot.appendChild(HS_imageMapAreas);

	var HS_progress = document.createElement("h3");
	HS_progress.id = "HS_progress";
	HS_progress.innerHTML = "Progress: <span id='HS_completed'></span> / <span id='HS_total'>" + HotSpotApp.allCompleted.length + "</span>";
	HS_hotSpot.appendChild(HS_progress);

	HotSpotApp.updateProgress();

	HotSpotApp.buildHotspots();
	 if (HotSpotApp.AppData.VisualStyle == true){
		if ($.browser.mozilla) {
			$('img[usemap]').rwdImageMaps();
			alert("Unfortunately Firefox Version: " + $.browser.version + " doesn't support keyboard accessibility with a Javascript Library used for providing visual feedback in this activity. To access the visual feedback intended by the author, view this activity in another browser (such as Google Chrome or Internet Explorer 9+). Now continuing without visual indicators.");	
		}
		else {
			$("#HS_imageMap").mapster(HotSpotApp.normalState);
		}
	}
	else {
		$('img[usemap]').rwdImageMaps();
	}


	HotSpotApp.fitImage();

	HotSpotApp.buildActivityButtons();
}

/**
 * Function: buildActivityButtons
 * 
 * Adds the button(s) for the current activity into the app container.
 * 
 */
HotSpotApp.buildActivityButtons = function() {
	var HS_buttonSet = document.createElement("div");
	HS_buttonSet.id = "HS_buttonSetHalf";
	HS_hotSpot.appendChild(HS_buttonSet);

	HS_buttonSet.appendChild(HotSpotApp.nextButton);
	// HotSpotApp.nextButton.setAttribute("tabindex", HotSpotApp.ti);
	// HotSpotApp.ti++;

	document.getElementById("HS_nextButton").disabled = true;

	if (HotSpotApp.sceneNum < HotSpotApp.maxScenes - 1){
		$(".HS_buttonLabel").html("Next Activity");
	}
	else {
		$(".HS_buttonLabel").html("Finish Activity");
	}

	//HS_buttonSet.appendChild(HotSpotApp.instructionButton);
}

/**
 * Function: clearStage
 * 
 * Clears the app container.
 * 
 */
HotSpotApp.clearStage = function() {
	$("#HS_appContainer").empty();
}

/**
 * Function: buildHotspots
 * 
 * Builds the hot spots for the current activity and adds them to the app container.
 * 
 */
HotSpotApp.buildHotspots = function(){
	for (var i = 0; i < HotSpotApp.Scenes[HotSpotApp.sceneNum].HotSpots.length; i++){
		var coordArray = [];
		var coordString = "";

		if (HotSpotApp.Scenes[HotSpotApp.sceneNum].HotSpots[i].shapeType == "circle"){
			var step = Math.PI/20;  // see note 1
		    var h = parseInt(HotSpotApp.Scenes[HotSpotApp.sceneNum].HotSpots[i].xPos);  // x coordinate of the middle of the circle
		    var k = parseInt(HotSpotApp.Scenes[HotSpotApp.sceneNum].HotSpots[i].yPos);  // y coordinate of the middle of the circle
		    var r = parseInt(HotSpotApp.Scenes[HotSpotApp.sceneNum].HotSpots[i].radius);;  //radius of the circle;

		    for(var theta=0;  theta < 2*Math.PI; theta+=step)
		    { 
		       var x = h + r*Math.cos(theta);
		       var y = k - r*Math.sin(theta);    //note 2.
		       coordArray.push(x);
		       coordArray.push(y);
		    }

		    coordString = coordArray.join();
		}
		else if (HotSpotApp.Scenes[HotSpotApp.sceneNum].HotSpots[i].shapeType == "rectangle"){
			var width = parseInt(HotSpotApp.Scenes[HotSpotApp.sceneNum].HotSpots[i].shapeWidth);
			var height = parseInt(HotSpotApp.Scenes[HotSpotApp.sceneNum].HotSpots[i].shapeHeight);
			var x = parseInt(HotSpotApp.Scenes[HotSpotApp.sceneNum].HotSpots[i].xPos);
			var y = parseInt(HotSpotApp.Scenes[HotSpotApp.sceneNum].HotSpots[i].yPos);
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
		}

		else if (HotSpotApp.Scenes[HotSpotApp.sceneNum].HotSpots[i].shapeType == "custom"){
			coordString = HotSpotApp.Scenes[HotSpotApp.sceneNum].HotSpots[i].coords;
		}

		var tempArea = document.createElement("area");
		tempArea.setAttribute("class", "HS_areaMap");
		tempArea.id = HotSpotApp.Scenes[HotSpotApp.sceneNum].HotSpots[i].id;
		tempArea.alt = "Hot Spot Number " + (i+1) + " Uncompleted. " + HotSpotApp.Scenes[HotSpotApp.sceneNum].HotSpots[i].desc + " Opens a pop up window.	";
		tempArea.title = "Uncompleted activity";
		tempArea.setAttribute("role", "link");
		tempArea.setAttribute("aria-selected", false);
		tempArea.href = "#";
		tempArea.coords = coordString;
		tempArea.shape = "poly";
		tempArea.onfocus = function(){
			if (HotSpotApp.AppData.highlight == false){
				$(this).addClass("highlightable");
			}
			this.setAttribute("aria-selected", true);
			$(this).mouseover();
		};
		tempArea.onblur = function(){
			if (HotSpotApp.AppData.highlight == false){
				$(this).removeClass("highlightable");
			}
			this.setAttribute("aria-selected", false);
			$(this).mouseleave();
		};
		tempArea.onclick = function(){
			HotSpotApp.buildPopUp(this);
		};
		tempArea.onmouseleave = function(){
			if (HotSpotApp.AppData.highlight == false){
				$(".HS_areaMap").each(function(){
					if ($(this).hasClass("highlightable")){
						$(this).removeClass("highlightable");
					}
				});
			}
			this.setAttribute("aria-selected", false);
		};

		if (HotSpotApp.AppData.highlight == true){
			$(tempArea).addClass("highlightable");
		}

		HS_imageMapAreas.appendChild(tempArea);
	}
}

/**
 * Function: hideHotspots
 * 
 * Makes the hot spots non-selectable while a pop up window is open.
 * 
 */
HotSpotApp.hideHotspots = function(){
	$(".HS_areaMap").each(function(){
		this.setAttribute("tabindex", "-1");
	});
	document.getElementById("HS_nextButton").setAttribute("tabindex", "-1");
}

/**
 * Function: hideHotspots
 * 
 * Makes the hot spots selectable after a pop up window is closed.
 * 
 */
HotSpotApp.showHotspots = function(){
	$(".HS_areaMap").each(function(){
		this.removeAttribute("tabindex");
	});
	document.getElementById("HS_nextButton").removeAttribute("tabindex");
}

/**
 * Function: fitImage
 * 
 * Adjusts the size of the entire hot spot (and the height of pop up YouTube videos) on window resize.
 * 
 */
HotSpotApp.fitImage = function() {
	//gets the width of the hot spot's container
	var width = $("#HS_hotSpot").width();
	var height = $("#HS_hotSpot").height();
	if (width > HotSpotApp.Scenes[HotSpotApp.sceneNum].Background.imgWidth){
		width = HotSpotApp.Scenes[HotSpotApp.sceneNum].Background.imgWidth;
		$("#HS_hotSpot").css("width", width);
	}

	//resizes the hot spot to the size of the container
	$('#HS_imageMap').mapster('resize', width, 0, 0);


	//if a pop up with an embedded video is open, it adjusts the videos height to scale
	if (HotSpotApp.activeActivity == true){
		$(".HS_MediaEmbeddedVideo").each(function(){
//			this.setAttribute('height', $("#HS_imageMap").height() / 2);
			this.setAttribute('height', $(HS_questionContainer).width()*.5625);
		});
	}
}

/**
 * Function: buildPopUp
 * 
 * Builds the pop up for the designated hot spot and adds it to the app container.
 * 
 * Parameters:
 * 
 *   target - Event Target
 * 
 */
HotSpotApp.buildPopUp = function(target) {
	//HotSpotApp.ti = 1;
	HotSpotApp.hideHotspots();

	var id = target.id;
	var header;
	var questionNum;
	var correctAnswer;

	//checks to make sure an activity isn't already open(prevents opening another pop up while ones open)
	if (HotSpotApp.activeActivity == false){
		//sets an active indicator so another pop up cannot be opened until this one is closed
		HotSpotApp.activeActivity = true;

		//assigns the pop up it's coordinates based on the hot spot that opened it
		var coordsArr = target.coords.split(",");
		var x = coordsArr[0];
		var y = coordsArr[1];
		var width = $("#HS_imageMap").width() / 2;
		var height = $("#HS_imageMap").height() / 2;

		//sets the amount (in pixels) to shift the pop up in each direction
		var shiftAmt = 10;
		//establishes the offset amounts for the top/bottom of the pop up to account for the margins of the text elements above and below
		var offsetTop = $("#HS_instructions").outerHeight();
		var offsetTopHeightMargins = $("#HS_instructions").outerHeight(true);
		//establishes the offset amounts for the top of the pop up to account for the margins of the text elements above
		var offsetTop = $("#HS_instructions").outerHeight();
		var offsetTopMargins = $("#HS_instructions").outerHeight(true);
		//establishes the offset amounts for the bottom of the pop up to account for the margins of the text elements below
		var offsetBottom = $("#HS_progress").outerHeight();
		var offsetBottomMargins = $("#HS_progress").outerHeight(true);
		//console.log(offsetBottom, offsetBottomMargins);
		//establishes the offset amount for the left/right of the pop up to account for the margins from the image being centered/not taking 100% of the containers width 
		var offsetWidth;
		var offsetWidthMargins = $("#HS_hotSpot").width();

		//height of the container - height of hotspot / 2 to get the height offset for the top
		offsetTopMargins = (offsetTopMargins - offsetTop) / 2;
		offsetTop += offsetTopMargins;

		//height of the container - height of hotspot / 2 to get the height offset for the bottom
		offsetBottomMargins = (offsetBottomMargins - offsetBottom) / 2;
		offsetBottom += offsetBottomMargins;

		//width of the container - width of hotspot / 2 to get the width offset for one side
		offsetWidth = ((offsetWidthMargins) - (width * 2)) / 2;

		//starts the inital set up of the pop up window by building the window container and adds it to the document
		var HS_questionContainer = document.createElement("div");
		HS_questionContainer.id="HS_questionContainer";

/*
		if (x <= width && y <= height){
			$(HS_questionContainer).css("top", offsetTop + shiftAmt + "px");
		    $(HS_questionContainer).css("left", offsetWidth + shiftAmt + "px");
		}
		else if (x > width && y <= height){
			$(HS_questionContainer).css("top", offsetTop + shiftAmt + "px");
			$(HS_questionContainer).css("right", offsetWidth + shiftAmt + "px");	
		}
		else if (x <= width && y > height){
			$(HS_questionContainer).css("bottom", shiftAmt + "px");
			$(HS_questionContainer).css("left", offsetWidth + shiftAmt + "px");	
		}
		else if (x > width && y > height){
			$(HS_questionContainer).css("bottom", shiftAmt + "px");
			$(HS_questionContainer).css("right", offsetWidth + shiftAmt + "px");	
		}
*/

		$(HS_questionContainer).appendTo("#HS_content");
		
		for (var i = 0; i < HotSpotApp.Scenes[HotSpotApp.sceneNum].HotSpotContent.length; i++){
			if (HotSpotApp.Scenes[HotSpotApp.sceneNum].HotSpotContent[i].key == id){
				if (HotSpotApp.Scenes[HotSpotApp.sceneNum].HotSpotContent[i].popUpName != null){
					header = HotSpotApp.Scenes[HotSpotApp.sceneNum].HotSpotContent[i].popUpName;					
				}
				else {
					header = "Pop Up Activity";
				}
			}
		}

		var HS_popUpButtonSet = document.createElement("div");
		HS_popUpButtonSet.id = "HS_popUpButtonSet";
		HS_questionContainer.appendChild(HS_popUpButtonSet);

		//builds the close button
		var close = document.createElement("button");
		close.id = "HS_closeButton";
		close.alt = "Close the pop up window";
		close.setAttribute("title", "Closes the Pop Up Without Finishing");
		// close.setAttribute("tabindex", HotSpotApp.ti);
		// HotSpotApp.ti++;
		close.onclick = function(){
			//removes the window, removes the active indicator, but doesn't mark as completed
			$("#HS_questionContainer").remove();
			HotSpotApp.activeActivity = false;
			HotSpotApp.showHotspots();
		};
		//adds the close button to the pop up window
		HS_popUpButtonSet.appendChild(close);

		//builds the container for the pop up's content, and adds it to the pop up
		var HS_question = document.createElement("div");
		HS_question.id = "HS_question";
		HS_questionContainer.appendChild(HS_question);

		var HS_popUpHeader = document.createElement("h2");
		HS_popUpHeader.id = "HS_popUpHeader";
		HS_popUpHeader.innerHTML = header;
		HS_question.appendChild(HS_popUpHeader);

		var HS_bottomButtonSet = document.createElement("div");
		HS_bottomButtonSet.id = "HS_bottomButtonSet";
		HS_questionContainer.appendChild(HS_bottomButtonSet);

		//builds the finish button for the pop up window
		var HS_finishButton = document.createElement("button");
		HS_finishButton.id = "HS_finishButton";
		HS_finishButton.setAttribute("class", "HS_popUpButton");
		HS_finishButton.setAttribute("title", "Finishes and Closes the Pop Up Window");
		HS_finishButton.href = "#";
		HS_finishButton.onclick = function(){
			//removes the pop up window
			$("#HS_questionContainer").remove();
			HotSpotApp.showHotspots();

			for (var i = 0; i < HotSpotApp.Scenes[HotSpotApp.sceneNum].HotSpotContent.length; i++){
				if (HotSpotApp.Scenes[HotSpotApp.sceneNum].HotSpotContent[i].key == id){
					//if it's an assessment type pop up
					if (HotSpotApp.Scenes[HotSpotApp.sceneNum].HotSpotContent[i].activityType == "assessment"){
						//if the quiz result has been marked as correct
						if (HotSpotApp.correctCheck[i] == true){
							//if the quiz has already been completed(meaning a correctness state already exists)
							if (HotSpotApp.allCompleted[i] == true){
								//clear any existing correctness styles
								$("#"+id).mapster('set', false, HotSpotApp.wrongState);
								$("#"+id).mapster('set', false, HotSpotApp.correctState);

								//apply the correct state, and mark the activity as complete
								$("#"+id).mapster('set', true, HotSpotApp.correctState);
								HotSpotApp.activeActivity = false;
								HotSpotApp.allCompleted.splice(i, 1, true);
							}
							//if the quiz hasn't been completed yet(meaning no correctness state exists)
							else {
								//apply the correct state, and mark the activity as complete
								$("#"+id).mapster('set', true, HotSpotApp.correctState);
								HotSpotApp.activeActivity = false;
								HotSpotApp.allCompleted.splice(i, 1, true);
							}
						}
						//if the quiz result has been marked as wrong
						else {
							//if the quiz has already been completed(meaning a correctness state already exists)
							if (HotSpotApp.allCompleted[i] == true){
								//clear any existing correctness styles
								$("#"+id).mapster('set', false, HotSpotApp.wrongState);
								$("#"+id).mapster('set', false, HotSpotApp.correctState);

								//apply the wrong state, and mark the activity as complete
								$("#"+id).mapster('set', true, HotSpotApp.wrongState);
								HotSpotApp.activeActivity = false;
								HotSpotApp.allCompleted.splice(i, 1, true);
							}
							//if the quiz hasn't been completed(meaning no correctness state exists)
							else {
								//apply the wrong state, and mark the activity as complete
								$("#"+id).mapster('set', true, HotSpotApp.wrongState);
								HotSpotApp.activeActivity = false;
								HotSpotApp.allCompleted.splice(i, 1, true);
							}
						}
					}
					//if it's a presentation type popup, it can only be marked correct for completion
					else {
						//apply the correct state, and mark the activity as complete
						$("#"+id).mapster('set', true, HotSpotApp.correctState);
						HotSpotApp.activeActivity = false;
						HotSpotApp.allCompleted.splice(i, 1, true);
					}
				}
			}

			HotSpotApp.updateProgress();

			var str = document.getElementById(id).alt;
			var res = str.replace("Uncompleted.", "Completed.");
			document.getElementById(id).alt = res;

			document.getElementById(id).title = "Completed activity."
		};

		//label for the finish button
		var HS_finishLabel = document.createElement("span");
    	HS_finishLabel.setAttribute("class", "HS_buttonLabel");
    	HS_finishLabel.innerHTML = "Finish Pop Up";

    	//adds the button to the pop up window
    	HS_finishButton.appendChild(HS_finishLabel);
		HS_bottomButtonSet.appendChild(HS_finishButton);

		//checks all of the hot spot content for the one whose key matches the id of the one you clicked on
		for (var i = 0; i < HotSpotApp.Scenes[HotSpotApp.sceneNum].HotSpotContent.length; i++){
			if (HotSpotApp.Scenes[HotSpotApp.sceneNum].HotSpotContent[i].key == id){
				//if the content is presentation type, it will build each specified media/content piece and put it inside the pop up
				if (HotSpotApp.Scenes[HotSpotApp.sceneNum].HotSpotContent[i].activityType == "presentation"){
					for (var j = 0; j < HotSpotApp.Scenes[HotSpotApp.sceneNum].HotSpotContent[i].hotSpotMedia.length; j++){
	      				HotSpotApp.EmbedMedia("window", HS_question, HotSpotApp.Scenes[HotSpotApp.sceneNum].HotSpotContent[i].hotSpotMedia[j]);
					}

					$(HS_questionContainer).css({
						"left": "25%",
						"right": "25%"
					});
				}
				//if the content is assessment type, it will build a multiple choice quiz based inside the pop up
				else if (HotSpotApp.Scenes[HotSpotApp.sceneNum].HotSpotContent[i].activityType == "assessment"){
					//saves the index number of the question to be used later
					questionNum = i;

					//disables the finish button until the quiz is completed
					document.getElementById("HS_finishButton").disabled = true;

					//loads and adds the question for the quiz to the pop up
					var HS_quizText = document.createElement("p");
					HS_quizText.id = "HS_quizText";
					HS_quizText.innerHTML = HotSpotApp.Scenes[HotSpotApp.sceneNum].HotSpotContent[i].questionText;
					HS_question.appendChild(HS_quizText);

					//loads and adds the fieldset for the quiz to the pop up
					var HS_fieldSet = document.createElement("fieldset");
					HS_fieldSet.id = "HS_fieldSet";
					HS_fieldSet.innerHTML = "<legend>Answers:</legend>";
					HS_question.appendChild(HS_fieldSet);


					//loads all of the answers for the quiz, builds the inputs for them, and adds them to the pop up
					for (var j = 0; j < HotSpotApp.Scenes[HotSpotApp.sceneNum].HotSpotContent[i].answers.length; j++){
						//checks to see which answer is correct, and saves it's index for later
						if (HotSpotApp.Scenes[HotSpotApp.sceneNum].HotSpotContent[i].answers[j].correct == true){
							correctAnswer = j;
						}

	      				var HS_answer = document.createElement("div");
	      				HS_answer.setAttribute("class", "HS_answer");

	      				var HS_input = document.createElement("input");
	      				HS_input.setAttribute("class", "HS_input");
	      				HS_input.setAttribute("type", "radio");
	      				HS_input.setAttribute("name", "qu");
	      				HS_input.setAttribute("value", j);
	      				HS_input.id = "qu" + j;

	      				var HS_label = document.createElement("label");
	      				HS_label.setAttribute("for", "qu" + j);
	      				HS_label.setAttribute("class", "HS_label");
	      				HS_label.innerHTML = HotSpotApp.Scenes[HotSpotApp.sceneNum].HotSpotContent[i].answers[j].answerText;

	      				HS_answer.appendChild(HS_input);
	      				HS_answer.appendChild(HS_label);
	      				HS_fieldSet.appendChild(HS_answer);
					}

					//builds the submit button for the pop up window (only gets built for assessment type pop ups)
					var HS_submitButton = document.createElement("button");
					HS_submitButton.id = "HS_submitButton";
					HS_submitButton.setAttribute("class", "HS_popUpButton");
					HS_submitButton.setAttribute("title", "Submits your answer");
					HS_submitButton.href = "#";
					HS_submitButton.onclick = function(){
						//will evaluate the quiz, passes the question number index, and the correct answer index 
						HotSpotApp.EvaluateScore(questionNum, correctAnswer);
						//$("#HS_finishButton").focus();						
					};

					//label for the submit button
					var HS_submitLabel = document.createElement("span");
			    	HS_submitLabel.setAttribute("class", "HS_buttonLabel");
			    	HS_submitLabel.innerHTML = "Submit Answer";

			    	//adds the submit button to the pop up
			    	HS_submitButton.appendChild(HS_submitLabel);
			    	$(HS_submitButton).prependTo(HS_bottomButtonSet);
					//HS_bottomButtonSet.appendChild(HS_submitButton);

					$(HS_questionContainer).css({
						"left": "35%",
						"right": "35%"
					});
				}
			}
		}
	}
		
	var heightAdjust = (parseInt($("#HS_imageMap").css("height")) - parseInt($(HS_questionContainer).css("height"))) / 2;
	
	if(heightAdjust > 0) {
		$(HS_questionContainer).css({
			"top":$("#HS_imageMap").offset().top + heightAdjust + "px"
		});
	}
	else {
		$(HS_questionContainer).css({
			"top":$("#HS_imageMap").offset().top+"px"
		});
	}

	// $(HS_questionContainer).css({
	// 	"left":((parseInt($("#dbox").css("width")) - parseInt($(HS_questionContainer).css("width"))+parseInt($("#HS_content").css("padding-left")) )/2)+ "px"
	// });

	$("#HS_closeButton").focus()
}

/**
 * Function: EvaluateScore
 * 
 * Handles the results of a multiple choice question by determining if your answer was correct, displaying correct/wrong indicators, hightlighting your answer and displaying any designated feedback.
 * 
 * Parameters:
 * 
 *   questionNum   - [type/description]
 *   correctAnswer - [type/description]
 * 
 */
HotSpotApp.EvaluateScore = function(questionNum, correctAnswer) {
	//gets the value associated with the answer that you chose
	var idNum = $('input[name=qu]:checked').val();
	//selects the container for the chosen answer
	var questionCont = document.getElementById("qu" + idNum).parentNode;
	//loads the correct and wrong indicators for visual feedback
	var correct = "<img class=\"correct\" src=\"../css/graphics/Right_16.png\" alt=\"right check mark\" disabled/>";
	var wrong = "<img class=\"wrong\" src=\"../css/graphics/Wrong_16.png\" alt=\"wrong x\" disabled/>";

	//disables the submit button to prevent re-submits, and enables the finish button
	document.getElementById("HS_submitButton").disabled = true;
	document.getElementById("HS_finishButton").disabled = false;

	//styles the container of the answer that was chosen
	questionCont.setAttribute("style", "background:#D8D8D8;");

	//checks to see if feedback needs to be provided, if so, it loads the feedback associated with the chosen answer and adds it to the pop up
	if (HotSpotApp.Scenes[HotSpotApp.sceneNum].HotSpotContent[questionNum].feedback == true && HotSpotApp.Scenes[HotSpotApp.sceneNum].HotSpotContent[questionNum].answers[idNum].feedback != "none"){
		var HS_feedback = document.createElement("p");
		HS_feedback.id = "HS_feedback";
		HS_feedback.innerHTML = "<strong>Feedback: " + HotSpotApp.Scenes[HotSpotApp.sceneNum].HotSpotContent[questionNum].answers[idNum].feedback + "</strong>";

		HS_question.appendChild(HS_feedback);
	}

	//compares the chosen answer to the correct one, and assign's a correctness value accordingly
	if (idNum == correctAnswer){
		HotSpotApp.correctCheck[questionNum] = true;
	}
	else {
		HotSpotApp.correctCheck[questionNum] = false;
	}

	//assigns the correct and wrong visual indicators
	$(".HS_answer").each(function(index){
		if (index == correctAnswer){
			$(correct).appendTo(this);
		}
		else {
			$(wrong).appendTo(this);
		}
	});
}

/**
 * Function: EmbedMedia
 * 
 * Takes the passed object data and embeds it according to it's type and whether it's a pop up or pre/post activity content. 
 * 
 * Parameters:
 * 
 *   type         - String
 *   containerRef - String
 *   mediaData    - Object
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
          // mediaDomContent.setAttribute('tabindex', HotSpotApp.ti);
          // HotSpotApp.ti++
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
          //mediaDomContent.setAttribute('controls', 'controls');
          // mediaDomContent.setAttribute('tabindex', HotSpotApp.ti);
          // HotSpotApp.ti++

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
            // mediaDomLink.setAttribute('tabindex', HotSpotApp.ti);
            // HotSpotApp.ti++;
            mediaDomLink.setAttribute('target', "_blank");
          }

          var mediaDomContent = document.createElement("img");

          if(mediaData.mediaLink  == "none"){
            mediaDomContent.setAttribute('class', 'HS_MediaImage');
          }

          mediaDomContent.setAttribute('src', mediaData.src);

          if (type == "window"){
          	mediaDomContent.setAttribute('width', '100%');
          	mediaDomContent.setAttribute('height', $("#HS_imageMap").height() / 2);
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
            	mediaDomContent.setAttribute('width', '100%');
				mediaDomContent.setAttribute('height', ($(HS_questionContainer).width()*.5625));
//            	mediaDomContent.setAttribute('height', $("#HS_imageMap").height() / 2);
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
            // mediaDomLink.setAttribute('tabindex', HotSpotApp.ti);
            // HotSpotApp.ti++;
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
 * Function: accDisplay
 * 
 * A visual display of the name of the hot spot you have selected. CURRENTLY NOT IN USE.
 * 
 * Parameters:
 * 
 *   target - Event Target
 * 
 */
HotSpotApp.accDisplay = function(target){
	//assigns the current target display it's coordinates based on the hot spot that opened it
	var coordsArr = target.coords.split(",");
	var x = coordsArr[0] + "px";
	var y = coordsArr[1] + "px";

	var HS_currentTarget = document.createElement("div");
	HS_currentTarget.id = "HS_currentTarget";
	HS_currentTarget.innerHTML = "<p>Currently Selected: " + target.id +"</p>";
	$(HS_currentTarget).css("position", "absolute");
	$(HS_currentTarget).css("top", y);
	$(HS_currentTarget).css("left", x);
	$("#HS_hotSpot").append(HS_currentTarget);
}

/**
 * Function: updateProgress
 * 
 * Checks to see if all the hot spots have been completed, and if so, it allows access to either the next activity or the post activity content.
 * 
 */
HotSpotApp.updateProgress = function(){
	var completed = 0;

	for (var i = 0; i < HotSpotApp.allCompleted.length; i++){
		if (HotSpotApp.allCompleted[i] == true){
			completed++;
		}
	}

	if (completed == HotSpotApp.allCompleted.length){
		//enables the continue button after all the activities are completed
		document.getElementById("HS_nextButton").disabled = false;
	}

	document.getElementById("HS_completed").innerHTML = completed;
};

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