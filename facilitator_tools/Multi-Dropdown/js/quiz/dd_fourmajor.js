var DragAndDropApp = {
    mobileDevice: false,
    ActivityType : null,
      waitingOnSetup: false,
    AppData : null,
    currentAttempts : 0,
    sessionTimer : 0,
    timerInterval : null,
    ti : 1,
    containerRef : null,
    hLightingEffect : false,
    qCols : 1,
    aCols : 1,
    curQCol : 1,
    qColMinWidth : 1000,
    accDndCont : "div",
    questionData : null,
    AnsSlotData : null,
    alreadySelected : false,
    heightSet : false,
    finishedQuiz : false,
    allAnswered : false,
    interval : null,
    continueButton : null,
    backButton : null,
    checkAnswersButton : null,
    resetWrongButton : null,
    resetButton : null,
    restartButton : null,
    submitButton : null,
    postQuizButton : null,
    instructionButton : null,
    origPos : [],
    aMatch : [],
    qMatch : [],
    matchAmount : [],
    selectedElements : [],
    scoreEval : [],
    savedElements : [],
    savedAnswers : [],
    savedCorrectAnswers : [],
    savedBackgrounds : []
}

DragAndDropApp.resetQuizData = function() {
    DragAndDropApp.sessionTimer = 0
    DragAndDropApp.alreadySelected = false;
    DragAndDropApp.heightSet = false;
    DragAndDropApp.finishedQuiz = false;
    DragAndDropApp.allAnswered = false;
    DragAndDropApp.interval = null;
    DragAndDropApp.origPos = [];
    DragAndDropApp.aMatch = [];
    DragAndDropApp.qMatch = [];
    DragAndDropApp.matchAmount = [];
    DragAndDropApp.selectedElements = [];
    DragAndDropApp.scoreEval = [];
    DragAndDropApp.savedElements = [];
    DragAndDropApp.savedAnswers = [];
    DragAndDropApp.savedCorrectAnswers = [];
}

DragAndDropApp.setupApp = function(file, location)
{
    questionFile = file;

    if (document.getElementById(location) !== null)
    {
        DragAndDropApp.containerRef = document.getElementById(location);
        DragAndDropApp.getAppData(DragAndDropApp.buildApp);
    }
    else
    {
        console.log("Error! Missing Proper DOM object.");
    }
}

DragAndDropApp.getAppData = function(callback) {
  var jqxhr = $.getJSON(questionFile, function(data) {
    DragAndDropApp.AppData = data
    callback(DragAndDropApp.AppData)
  });

  // if the json data fails inform the users ang give some data to developers using the debug console.
  jqxhr.fail(function(e){
    console.log("ERROR!!: failed to load data from specified file. Ensure file is at that location and that JSON data is vaild. (tip: use a vaildator like: http://jsonformatter.curiousconcept.com/ )")
    console.log(e)
  });
}

DragAndDropApp.buildApp = function() {
    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
         DragAndDropApp.mobileDevice = true;
    }

    DragAndDropApp.questionData = DragAndDropApp.AppData.QuestionNodes;
    DragAndDropApp.AnsSlotData = DragAndDropApp.AppData.AnswerNodes;
    DragAndDropApp.ActivityType = DragAndDropApp.AppData.ActivityType;

    DragAndDropApp.qCols = parseInt(DragAndDropApp.AppData.QuestionColums);
    DragAndDropApp.aCols = parseInt(DragAndDropApp.AppData.AnsSlotColums);

    DragAndDropApp.hLightingEffect = DragAndDropApp.AppData.HighlightEffect;

    DragAndDropApp.buildAppFrame();
    DragAndDropApp.loadButtons();
    DragAndDropApp.buildPreQuiz();
}

DragAndDropApp.autoSelect = function(selectTarget) {
 // IE
    var browserName=navigator.appName;
    if (browserName == "Microsoft Internet Explorer") {
        document.selection.empty();
        var range = document.body.createTextRange();
        range.moveToElementText(selectTarget);
        range.select();
    }
}

DragAndDropApp.buildAppFrame = function() {
    var DND_container = document.createElement("div");
    DND_container.id = "DND_container";

    var DND_content = document.createElement("div");
    DND_content.id = "DND_content";



    //var DND_header  = document.createElement("section");
    //DND_header.id = "DND_header";
    //DND_header.innerHTML = "<h1>" + DragAndDropApp.AppData.QuizName + "</h1>";

    DND_container.appendChild(DND_content);
    //DND_content.appendChild(DND_header);
    $(DND_container).appendTo(DragAndDropApp.containerRef);

    $('<div/>', {
        id: 'AccMessageDisp',
        'class': "AccMessage",
        text: 'Stuff',
    }).appendTo('body');

    var DND_appContainer = document.createElement("div");
    DND_appContainer.id = "DND_appContainer";
    DND_content.appendChild(DND_appContainer);
}

DragAndDropApp.loadButtons = function() {
    var DND_buttonIcon = document.createElement("div");
    DND_buttonIcon.setAttribute("class", "DND_buttonIcon");

    var DND_checkButton = document.createElement("button");
    DND_checkButton.id = "DND_checkButton";
    DND_checkButton.setAttribute("class", "DND_button");
    DND_checkButton.setAttribute("title", "Check Answers");
    DND_checkButton.onclick = function(){
        DragAndDropApp.checkAnswers();
    };

    var DND_checkLabel = document.createElement("span");
    DND_checkLabel.setAttribute("class", "DND_buttonLabel");
    DND_checkLabel.innerHTML = "Check Answers";
    DND_checkButton.appendChild(DND_buttonIcon);
    DND_checkButton.appendChild(DND_checkLabel);

    DragAndDropApp.checkAnswersButton = DND_checkButton;


    var DND_buttonIcon = document.createElement("div");
    DND_buttonIcon.setAttribute("class", "DND_buttonIcon");

    var DND_resetWrongButton = document.createElement("button");
    DND_resetWrongButton.id = "DND_resetWrongButton";
    DND_resetWrongButton.setAttribute("class", "DND_button");
    DND_resetWrongButton.setAttribute("title", "Reset Wrong Answers");
    DND_resetWrongButton.onclick = function(){
        DragAndDropApp.resetWrong();
    };

    var DND_resetWrongLabel = document.createElement("span");
    DND_resetWrongLabel.setAttribute("class", "DND_buttonLabel");
    DND_resetWrongLabel.innerHTML = "Reset Wrong";
    DND_resetWrongButton.appendChild(DND_buttonIcon);
    DND_resetWrongButton.appendChild(DND_resetWrongLabel);
    DND_resetWrongButton.disabled = true;

    DragAndDropApp.resetWrongButton = DND_resetWrongButton;


    var DND_buttonIcon = document.createElement("div");
    DND_buttonIcon.setAttribute("class", "DND_buttonIcon");

    var DND_resetButton = document.createElement("button");
    DND_resetButton.id = "DND_resetButton";
    DND_resetButton.setAttribute("class", "DND_button");
    DND_resetButton.setAttribute("title", "reset all button");
    DND_resetButton.onclick = function(){
        DragAndDropApp.reset()
    };

    var DND_resetLabel = document.createElement("span");
    DND_resetLabel.setAttribute("class", "DND_buttonLabel");
    DND_resetLabel.innerHTML = "Reset All";
    DND_resetButton.appendChild(DND_buttonIcon);
    DND_resetButton.appendChild(DND_resetLabel);

    DragAndDropApp.resetButton = DND_resetButton;


    var DND_buttonIcon = document.createElement("div");
    DND_buttonIcon.setAttribute("class", "DND_buttonIcon");

    var DND_restartButton = document.createElement("button");
    DND_restartButton.id = "DND_restartButton";
    DND_restartButton.setAttribute("class", "DND_button");
    DND_restartButton.setAttribute("title", "restart button");
    DND_restartButton.onclick = function(){
        DragAndDropApp.clearStage();
        DragAndDropApp.resetQuizData();
        DragAndDropApp.buildPreQuiz();
    };

    var DND_restartLabel = document.createElement("span");
    DND_restartLabel.setAttribute("class", "DND_buttonLabel");
    DND_restartLabel.innerHTML = "Restart";
    DND_restartButton.appendChild(DND_buttonIcon);
    DND_restartButton.appendChild(DND_restartLabel);

    DragAndDropApp.restartButton = DND_restartButton;


    var DND_buttonIcon = document.createElement("div");
    DND_buttonIcon.setAttribute("class", "DND_buttonIcon");

    var DND_continueButton = document.createElement("button");
    DND_continueButton.id = "DND_continueButton";
    DND_continueButton.setAttribute("class", "DND_button");
    DND_continueButton.onclick = function(){
        DragAndDropApp.clearStage();
        DragAndDropApp.buildActivity();
        DragAndDropApp.timerInterval = setInterval(DragAndDropApp.timer, 1000);
    };

    var DND_continueLabel = document.createElement("span");
    DND_continueLabel.setAttribute("class", "DND_buttonLabel");
    DND_continueButton.setAttribute("title", "Continue Activity");
    DND_continueLabel.innerHTML = "Continue";
    DND_continueButton.appendChild(DND_buttonIcon);
    DND_continueButton.appendChild(DND_continueLabel);

    DragAndDropApp.continueButton = DND_continueButton;


    var DND_buttonIcon = document.createElement("div");
    DND_buttonIcon.setAttribute("class", "DND_buttonIcon");

    var DND_postQuizButton = document.createElement("button");
    DND_postQuizButton.id = "DND_postQuizButton";
    DND_postQuizButton.setAttribute("class", "DND_button");
    DND_postQuizButton.setAttribute("title", "post quiz button");
    DND_postQuizButton.onclick = function(){
        DragAndDropApp.clearStage();
        DragAndDropApp.buildPostQuiz();
    };

    var DND_postQuizLabel = document.createElement("span");
    DND_postQuizLabel.setAttribute("class", "DND_buttonLabel");
    DND_postQuizLabel.innerHTML = "Move On";
    DND_postQuizButton.appendChild(DND_buttonIcon);
    DND_postQuizButton.appendChild(DND_postQuizLabel);

    DragAndDropApp.postQuizButton = DND_postQuizButton;


    var DND_buttonIcon = document.createElement("div");
    DND_buttonIcon.setAttribute("class", "DND_buttonIcon");

    var DND_instructionButton = document.createElement("button");
    DND_instructionButton.id = "DND_instructionButton";
    DND_instructionButton.setAttribute("class", "DND_button");
    DND_instructionButton.setAttribute("title", "How to use this activity");
    DND_instructionButton.innerHTML = "<span class='sr-only'>How to use this activity</span>";
    DND_instructionButton.onclick = function(){
        DragAndDropApp.toggleInstructions();
    };

    var DND_instructionLabel = document.createElement("span");
    DND_instructionLabel.setAttribute("class", "DND_buttonLabel");
    DND_instructionButton.appendChild(DND_buttonIcon);
    DND_instructionButton.appendChild(DND_instructionLabel);

    DragAndDropApp.instructionButton = DND_instructionButton;

}

DragAndDropApp.buildProgress = function() {
    var DND_progress = document.createElement("div");
    DND_progress.id = "DND_progress";
    DND_appContainer.appendChild(DND_progress);

}

DragAndDropApp.buildDirections = function() {
    DragAndDropApp.ti = 1;

    if (DragAndDropApp.AppData.PreQuizText != "none"){
        var DND_preQuizText = document.createElement("p");
        DND_preQuizText.id = "DND_preQuizText";
        DND_preQuizText.innerHTML = DragAndDropApp.AppData.PreQuizText;
        DND_appContainer.appendChild(DND_preQuizText);
    }

    if (DragAndDropApp.AppData.PreQuizMedia != "none"){
        for (var i = 0; i < DragAndDropApp.AppData.PreQuizMedia.length; i++){
              DragAndDropApp.EmbedMedia(DND_appContainer, DragAndDropApp.AppData.PreQuizMedia[i]);
        }
    }

   $("[tabindex=0]").focus();


}

DragAndDropApp.buildPreQuiz = function() {


    DragAndDropApp.ti = 1;

    if (DragAndDropApp.AppData.PreQuizText != "none"){
        var DND_preQuizText = document.createElement("p");
        DND_preQuizText.id = "DND_preQuizText";
        DND_preQuizText.innerHTML = DragAndDropApp.AppData.PreQuizText;
        DND_appContainer.appendChild(DND_preQuizText);
        DragAndDropApp.buildPreQuizButtons();
    }

    if (DragAndDropApp.AppData.PreQuizMedia != "none"){
        for (var i = 0; i < DragAndDropApp.AppData.PreQuizMedia.length; i++){
              DragAndDropApp.EmbedMedia(DND_appContainer, DragAndDropApp.AppData.PreQuizMedia[i]);
        }
    }

    if (DragAndDropApp.AppData.PreQuizText = "none"){
        DragAndDropApp.buildActivity();
    }

    $("[tabindex=0]").focus();
}

DragAndDropApp.buildPreQuizButtons = function() {
    var DND_buttonSet = document.createElement("div");
    DND_buttonSet.id = "DND_buttonSet";
    DND_appContainer.appendChild(DND_buttonSet);

    DND_buttonSet.appendChild(DragAndDropApp.continueButton);
    DragAndDropApp.continueButton.setAttribute("tabindex", DragAndDropApp.ti);
    DragAndDropApp.ti++;
}

DragAndDropApp.buildPostQuiz = function() {
    DragAndDropApp.ti = 1;

    if (DragAndDropApp.AppData.PostQuizText != "none"){
        var DND_postQuizText = document.createElement("p");
        DND_postQuizText.id = "DND_postQuizText";
        DND_postQuizText.innerHTML = DragAndDropApp.AppData.PostQuizText;
        DND_appContainer.appendChild(DND_postQuizText);
    }

    if (DragAndDropApp.AppData.PostQuizMedia != "none"){
        for (var i = 0; i < DragAndDropApp.AppData.PostQuizMedia.length; i++){
              DragAndDropApp.EmbedMedia(DND_appContainer, DragAndDropApp.AppData.PostQuizMedia[i]);
        }
    }

    DragAndDropApp.buildPostQuizButtons();

    $("[tabindex=1]").focus();
}

DragAndDropApp.buildPostQuizButtons = function() {
    var DND_buttonSet = document.createElement("div");
    DND_buttonSet.id = "DND_buttonSet";
    DND_appContainer.appendChild(DND_buttonSet);

    DND_buttonSet.appendChild(DragAndDropApp.restartButton);
    DragAndDropApp.restartButton.setAttribute("tabindex", DragAndDropApp.ti);
    DragAndDropApp.ti++;
}

DragAndDropApp.buildActivity = function() {
    DragAndDropApp.ti = 1;

    for(var i = 0; i < DragAndDropApp.questionData.length; i++){
        DragAndDropApp.origPos.push(null);

        var temp = DragAndDropApp.questionData[i].answer;
        DragAndDropApp.qMatch.push(temp);
    }

    for (var j = 0; j < DragAndDropApp.AnsSlotData.length; j++){
        var temp = DragAndDropApp.AnsSlotData[j].key;
        DragAndDropApp.aMatch.push(temp);

        if (DragAndDropApp.ActivityType == "sort"){
            var matches = 0;

            for (var k = 0; k < DragAndDropApp.questionData.length; k++){
                if (DragAndDropApp.questionData[k].answer == DragAndDropApp.AnsSlotData[j].key){
                    matches++;
                }
            }

            DragAndDropApp.matchAmount.push(matches);
        }
    }
    DragAndDropApp.buildDirections()
    DragAndDropApp.buildQuestionCols();
    DragAndDropApp.buildAnswerSlots();
    DragAndDropApp.buildActivityButtons();
    DragAndDropApp.buildInstructions();
    DragAndDropApp.buildProgress();
    DragAndDropApp.initAccDnd();
    DragAndDropApp.assignOrigPos();


    if (DragAndDropApp.AppData.FeedbackType == "report"){
        DragAndDropApp.interval = setInterval(DragAndDropApp.checkAllAnswered, 100);
        document.getElementById("DND_checkButton").disabled = true;
    }

    $("#DND_instructions").attr("tabindex", DragAndDropApp.ti);

    $("[tabindex=0]").focus();
}

DragAndDropApp.buildActivityButtons = function() {
    var DND_buttonSet = document.createElement("div");
    DND_buttonSet.id = "DND_buttonSet";
    DND_appContainer.appendChild(DND_buttonSet);

    DND_buttonSet.appendChild(DragAndDropApp.checkAnswersButton);

    if (DragAndDropApp.AppData.FeedbackType == "continuous"){
        DND_buttonSet.appendChild(DragAndDropApp.resetWrongButton);
        DragAndDropApp.resetWrongButton.setAttribute("tabindex", DragAndDropApp.ti);
        DragAndDropApp.ti++;
    }
    else {
        DND_buttonSet.appendChild(DragAndDropApp.resetButton);
        DragAndDropApp.resetButton.setAttribute("tabindex", DragAndDropApp.ti);
        DragAndDropApp.ti++;
    }

    DND_buttonSet.appendChild(DragAndDropApp.instructionButton);

    DragAndDropApp.checkAnswersButton.setAttribute("tabindex", DragAndDropApp.ti);
    DragAndDropApp.ti++;
}

DragAndDropApp.buildReport = function(){
    DragAndDropApp.ti = 1;

    DragAndDropApp.findCorrectAnswers();

    var correct = "<img class=\"correct\" src=\"../img/Right_24.png\" alt=\"right check mark\" />";
    var wrong = "<img class=\"wrong\" src=\"../img/Wrong_24.png\" alt=\"wrong x\" />";

    var score = DragAndDropApp.calculateScore();

    var DND_report = document.createElement("div");
    DND_report.id = "DND_report";

    var scoreHeader = document.createElement("h3");
    scoreHeader.innerHTML = "You scored " + score + "/" + DragAndDropApp.questionData.length + "!";
    DND_report.appendChild(scoreHeader);

    for(var i = 0; i < DragAndDropApp.AnsSlotData.length; i++){
        var tempMiniReport = document.createElement("div");
        tempMiniReport.setAttribute("class", "DND_miniReport");

        var tempHeader = document.createElement("p");
        tempHeader.innerHTML = DragAndDropApp.AnsSlotData[i].title;
        tempMiniReport.appendChild(tempHeader);
        DND_report.appendChild(tempMiniReport);


        var tempMiniReportContent = document.createElement("ul");
        tempMiniReportContent.setAttribute("class", "DND_miniReportContent");

        tempMiniReport.appendChild(tempMiniReportContent);

        for (var j = 0; j < DragAndDropApp.savedElements.length; j++){
            if (DragAndDropApp.AnsSlotData[i].key == DragAndDropApp.savedAnswers[j]){
                var tempMatch = document.createElement("li");
                var tempFeedback = document.createElement("p");

                switch(DragAndDropApp.scoreEval[j]){
                    case 1:
                        tempMatch.innerHTML = DragAndDropApp.savedElements[j];
                        tempMiniReportContent.appendChild(tempMatch);
                        $(tempMatch).append(correct);

                        if (DragAndDropApp.AppData.CorrectFeedback == true){
                            if (DragAndDropApp.questionData[j].correct != "none"){
                                tempFeedback.innerHTML = DragAndDropApp.questionData[j].correct;
                                tempMiniReportContent.appendChild(tempFeedback);
                            }
                        }
                        break;

                    default:
                        tempMatch.innerHTML = DragAndDropApp.savedElements[j] + " (Correct Answer: " + DragAndDropApp.savedCorrectAnswers[j] + ")";
                        tempMiniReportContent.appendChild(tempMatch);
                        $(tempMatch).append(wrong);

                        if (DragAndDropApp.AppData.WrongFeedback == true){
                            if (DragAndDropApp.questionData[j].wrong != "none"){
                                tempFeedback.innerHTML = DragAndDropApp.questionData[j].wrong;
                                tempMiniReportContent.appendChild(tempFeedback);
                            }
                        }
                        break;
                }
            }
        }
    }

    $("#DND_appContainer").append(DND_report);
    DragAndDropApp.buildReportButtons();

    $("[tabindex=1]").focus();
}

DragAndDropApp.buildReportButtons = function() {
    var DND_buttonSet = document.createElement("div");
    DND_buttonSet.id = "DND_buttonSet";
    DND_appContainer.appendChild(DND_buttonSet);

    if (DragAndDropApp.AppData.IncludePostPage == true){
        DND_buttonSet.appendChild(DragAndDropApp.postQuizButton);
    }

    DND_buttonSet.appendChild(DragAndDropApp.restartButton);
    DragAndDropApp.restartButton.setAttribute("tabindex", DragAndDropApp.ti);
    DragAndDropApp.ti++;

    DragAndDropApp.postQuizButton.setAttribute("tabindex", DragAndDropApp.ti);
    DragAndDropApp.ti++;
}

DragAndDropApp.clearStage = function() {
    $("#DND_appContainer").empty();

    clearInterval(DragAndDropApp.interval);
}

DragAndDropApp.findCorrectAnswers = function() {
    for (var i = 0; i < DragAndDropApp.questionData.length; i++){
        for (var j = 0; j < DragAndDropApp.AnsSlotData.length; j++){
            if (DragAndDropApp.questionData[i].answer == DragAndDropApp.AnsSlotData[j].key){
                DragAndDropApp.savedCorrectAnswers.push(DragAndDropApp.AnsSlotData[j].title);
            }
        }
    }
}

DragAndDropApp.toggleInstructions = function(item){
    $("#DND_instructions").toggle();

    $("#DND_instructions").focus();
}

DragAndDropApp.buildQuestionCols = function() {
    var DND_qColContainer = document.createElement("div");
    DND_qColContainer.id = "DND_qColContainer";
    DND_qColContainer.className = "DND_questions";
    DND_qColContainer.setAttribute("ondrop", "DragAndDropApp.revert(event);");
    DND_qColContainer.setAttribute("ondragover", "DragAndDropApp.allowDrop(event);");
    DND_appContainer.appendChild(DND_qColContainer);

    for(var c = 0; c < DragAndDropApp.qCols; c++)
    {
        var tempContDiv = $('<div/>', {
            id: 'qColum_'+(c+1),
            //style: 'width: ' + 100/DragAndDropApp.qCols + '%;',
            'class': 'MI_qColum'
        });

        $('<div/>', {
            id: 'unsorted_'+(c+1),
        }).appendTo(tempContDiv);

        $("#DND_qColContainer").append(tempContDiv);
    }

    var tempArr = new Array();

    for(var i = 0; i < DragAndDropApp.questionData.length; i++)
    {
        if (DragAndDropApp.questionData[i].type == "text"){
            if (DragAndDropApp.mobileDevice == true){
                tempArr[i] = "<div id=\"drag"+i+"\" onclick=\"DragAndDropApp.setMobileSelect(this);\" ontouchmove=\"DragAndDropApp.touchDrag(event);\" class=\"dragableTextNode\" >" + DragAndDropApp.questionData[i].question + "</div>";

            }
            else {
                tempArr[i] = "<div id=\"drag"+i+"\" draggable=\"true\" aria-hidden=\"false\" aria-grabbed=\"false\" onclick=\"DragAndDropApp.setMobileSelect(this);\" ondragstart=\"DragAndDropApp.drag(event);\" ondrop=\"DragAndDropApp.drop(event);\" onmousedown=\"DragAndDropApp.autoSelect(this);\" onmouseover=\"DragAndDropApp.hLightEffect(this, true)\" onmouseout=\"DragAndDropApp.hLightEffect(this, false)\" class=\"dragableTextNode\" >"+ DragAndDropApp.questionData[i].question+"</div>";
            }
        }
        if (DragAndDropApp.questionData[i].type == "image"){
            if (DragAndDropApp.mobileDevice == true){
                tempArr[i] = "<div id=\"drag"+i+"\" onclick=\"DragAndDropApp.setMobileSelect(this);\" ontouchmove=\"DragAndDropApp.touchDrag(event);\" class=\"dragableTextNode\" ><img class=\"draggableImage\" src=\"" + DragAndDropApp.questionData[i].src + "\" alt=\"" + DragAndDropApp.questionData[i].alt + "\"/></div>";

            }
            else {
                tempArr[i] = "<div id=\"drag"+i+"\" draggable=\"true\" aria-hidden=\"false\" aria-grabbed=\"false\" onclick=\"DragAndDropApp.setMobileSelect(this);\" ondragstart=\"DragAndDropApp.drag(event);\" ondrop=\"DragAndDropApp.drop(event);\" onmousedown=\"DragAndDropApp.autoSelect(this);\" onmouseover=\"DragAndDropApp.hLightEffect(this, true)\" onmouseout=\"DragAndDropApp.hLightEffect(this, false)\" class=\"dragableTextNode\"  ><img class=\"draggableImage\" src=\"" + DragAndDropApp.questionData[i].src + "\" alt=\"" + DragAndDropApp.questionData[i].alt + "\"/></div>";
            }
        }
    }

    if (DragAndDropApp.AppData.Randomize == true){
        tempArr.sort(function() { return 0.5 - Math.random() });
    }

    for(var j = 0; j < DragAndDropApp.questionData.length; j++)
    {
        if(DragAndDropApp.curQCol > DragAndDropApp.qCols)
        {
            DragAndDropApp.curQCol = 1;
        }

        $('#unsorted_'+DragAndDropApp.curQCol).append(tempArr[j]);
        DragAndDropApp.curQCol++;
    }

    $(".dragableTextNode").each(function(){
        this.setAttribute("tabindex", DragAndDropApp.ti);
        DragAndDropApp.ti++;
    });

    DragAndDropApp.curQCol = 1;
}

DragAndDropApp.buildAnswerSlots = function() {
    var DND_ansSlotContainer = document.createElement("div");
    DND_ansSlotContainer.id = "DND_ansSlotContainer";
    DND_ansSlotContainer.className = "DND_answers";
    DND_appContainer.appendChild(DND_ansSlotContainer);

    for(var c = 0; c < DragAndDropApp.AnsSlotData.length; c++)
    {
        var slotColor;
        var slotBackground;
        var style;

        if (DragAndDropApp.AnsSlotData[c].color === "default")
        {
            slotColor ='#00a1af'
        } else {
            slotColor = DragAndDropApp.AnsSlotData[c].color
        }

        if (DragAndDropApp.AnsSlotData[c].src != "none"){
            slotBackground = DragAndDropApp.AnsSlotData[c].src;
            DragAndDropApp.savedBackgrounds[c] = slotBackground;

            style = "border: " + slotColor + " 1px dashed; background-image: url(" + slotBackground + ");";
        }
        else {
            DragAndDropApp.savedBackgrounds[c] = DragAndDropApp.AnsSlotData[c].src;
        }

        var tempContDiv = $('<div/>', {
            id: 'aSlotCont_'+(c),
            'class': 'MI_aSlot'
        });

        $('<div/>', {
            id: DragAndDropApp.AnsSlotData[c].key,
            'class': "connect_box dropzone",
            title: DragAndDropApp.AnsSlotData[c].title + " Drop Zone",
            ondrop: "DragAndDropApp.drop(event)",
            ondragover: "DragAndDropApp.allowDrop(event)",
            onmouseup: "DragAndDropApp.HandleMobileDrop(this)",
            onkeyup: "DragAndDropApp.checkAccDrop(this)",
            style: style
        }).appendTo(tempContDiv);

        $("#DND_ansSlotContainer").append(tempContDiv);

        var tempTitleContDiv = $('<div/>', {
            id: DragAndDropApp.AnsSlotData[c].key+"_title",
            'class': 'dropzoneTitle'
        }).appendTo(tempContDiv);

        if (DragAndDropApp.ActivityType == "sort"){
 $('<p/>').html(DragAndDropApp.AnsSlotData[c].title).appendTo(tempTitleContDiv);
        }
        else {
            $('<p/>').html(DragAndDropApp.AnsSlotData[c].title).appendTo(tempTitleContDiv);
        }
    }

    // if (DragAndDropApp.AnsSlotData.length > 2){
    //     $("MI_aSlot").css("width", "250px")
    // }
}

DragAndDropApp.buildInstructions = function() {
    var instructions;

    if (DragAndDropApp.mobileDevice == true){
        if (DragAndDropApp.ActivityType == "match"){
            if (DragAndDropApp.AppData.FeedbackType == "report"){
                instructions = "Match each item to the appropriate category. Tap on 'Check Answers' to see your results."
            }
            else {
                instructions = "Match each item to the appropriate category. Tap on 'Check Answers' to see your progress."
            }
        }
        else{
            if (DragAndDropApp.AppData.FeedbackType == "report"){
                instructions = "Sort each item into the appropriate category. Tap on 'Check Answers' to see your results."
            }
            else {
                instructions = "Sort each item into to the appropriate category. Tap on 'Check Answers' to see your progress."
            }
        }
    }
    else {
        if (DragAndDropApp.ActivityType == "match"){
            if (DragAndDropApp.AppData.FeedbackType == "report"){
                instructions = "Match each item to the appropriate category. For keybord only users, use the tab key to select an answer from the list and use the tilde(~) key to select it. Use tab again the select the correct dropzone and then hit the tilde key(~) to confirm your answer. Use the 'Check Answers' button to get your results."
            }
            else {
                instructions = "Match each item to the appropriate category. For keybord only users, use the tab key to select an answer from the list and use the tilde(~) key to select it. Use tab again the select the correct dropzone and then hit the tilde key(~) to confirm your answer. Use the 'Check Answers' to get your progress."
            }
        }
        else{
            if (DragAndDropApp.AppData.FeedbackType == "report"){
                instructions = "Sort each item into the appropriate category. For keybord only users, use the tab key to select an answer from the list and use the tilde(~) key to select it. Use tab again the select the correct dropzone and then hit the tilde key(~) to confirm your answer. Use the 'Check Answers' button to get your results."
            }
            else {
                instructions = "Sort each item into the appropriate category. For keybord only users, use the tab key to select an answer from the list and use the tilde(~) key to select it. Use tab again the select the correct dropzone and then hit the tilde key(~) to confirm your answer. Use the 'Check Answers' to get your progress."
            }
        }
    }

    var DND_instructions = document.createElement("div");
    DND_instructions.id = "DND_instructions";
    DND_instructions.setAttribute("class", "toggledOff");
    DND_appContainer.appendChild(DND_instructions);

    var DND_instructionText = document.createElement("p");
    DND_instructionText.id = "DND_instructionText";
    //DND_instructionText.setAttribute("class", "tooltip");
    DND_instructionText.innerHTML = instructions;
    DND_instructions.appendChild(DND_instructionText);

    $("#DND_instructions").toggle();
}

DragAndDropApp.assignOrigPos = function() {
    for (var i = 0; i < DragAndDropApp.questionData.length; i++){
        var temp = document.getElementById("drag" + i);
        var tempPos = temp.parentNode;

        DragAndDropApp.origPos.splice(i, 1, tempPos);
    }
}

DragAndDropApp.hLightEffect = function(target, on)
{
    if ($(target).hasClass("dropped") == false){
        if(DragAndDropApp.hLightingEffect == true){
            if (DragAndDropApp.alreadySelected != true){
                if(on)
                {
                    $('#'+target.id).css("background-color" , "#FF9");
                    $('#'+target.id).css("color", "#000");
                } else {
                    $('#'+target.id).removeAttr("style");
                }
            }
        }
         return false;
     }
}

DragAndDropApp.allowDrop = function(ev)
{
    ev.preventDefault();
}

DragAndDropApp.checkDropzone = function(target) {
    for (i=0; i < DragAndDropApp.questionData.length; i++) {
        if (target.className.search("dropzone") != -1) {
            return true;
        }
    }
}

DragAndDropApp.checkParentDropzone = function(target) {
    for (i=0; i < DragAndDropApp.questionData.length; i++) {
        if (target.parentNode.className.search("dropzone") != -1) {
            return true;
        }
    }
}

DragAndDropApp.drag = function(ev)
{
    DragAndDropApp.setHeight();

    if ($(ev.target).hasClass("dropped") == false){
        var browserName=navigator.appName;
        if (browserName == "Microsoft Internet Explorer") {
            ev.dataTransfer.setData("text", ev.currentTarget.id);
        }
        else{
            ev.dataTransfer.setData("Text", ev.target.id);
        }

        ev.target.setAttribute('aria-grabbed', 'true');
        ev.target.setAttribute('aria-dropeffect', 'move');
    }
}

DragAndDropApp.drop = function(ev)
{
    var browserName=navigator.appName;
    if (browserName == "Microsoft Internet Explorer") {
        var data=ev.dataTransfer.getData("text");
    }
    else{
        var data=ev.dataTransfer.getData("Text");
    }

    var dropItem = document.getElementById(data);
    var dropParId;
    var idNum;
    var numCheck;
    var numElements;

    ev.preventDefault();

    if (DragAndDropApp.checkDropzone(ev.target) && data.substr(0,4) == "drag") {
    dropParId = ev.target.parentNode.id;
    idNum = parseInt(dropParId.substr(10));
    numCheck = DragAndDropApp.matchAmount[idNum];
    numElements = $(ev.target).children().length + 1;

        if (DragAndDropApp.ActivityType == "match"){
            if ($(ev.target).is(":empty")){
                dropItem.setAttribute('aria-grabbed', 'false');
                dropItem.removeAttribute('aria-dropeffect');
                ev.target.appendChild(dropItem);
                DragAndDropApp.HandleMobileDrop();
            }
        }
        else {
            if (numElements <= numCheck){
                dropItem.setAttribute('aria-grabbed', 'false');
                dropItem.removeAttribute('aria-dropeffect');
                ev.target.appendChild(dropItem);
                DragAndDropApp.HandleMobileDrop();
            }
        }
    }
    else if (DragAndDropApp.checkParentDropzone(ev.target) && data.substr(0,4) == "drag") {
        dropParId = ev.target.parentNode.parentNode.id;
        idNum = parseInt(dropParId.substr(10));
        numCheck = DragAndDropApp.matchAmount[idNum];
        numElements = $(ev.target.parentNode).children().length + 1;

        if (DragAndDropApp.ActivityType == "match"){
            if ($(ev.target.parentNode).is(":empty")){
                dropItem.setAttribute('aria-grabbed', 'false');
                dropItem.removeAttribute('aria-dropeffect');
                ev.target.parentNode.appendChild(dropItem);
                DragAndDropApp.HandleMobileDrop();
            }
        }
        else {
            if (numElements <= numCheck){
                dropItem.setAttribute('aria-grabbed', 'false');
                dropItem.removeAttribute('aria-dropeffect');
                ev.target.parentNode.appendChild(dropItem);
                DragAndDropApp.HandleMobileDrop();
            }
        }
    }
}

DragAndDropApp.revert = function(ev){
    var data=ev.dataTransfer.getData("Text");
    var revert = parseInt(data.substr(4, data.length));
    var revertPos = DragAndDropApp.origPos[revert];

    ev.preventDefault();

    (document.getElementById(data)).setAttribute('aria-grabbed', 'false');
    (document.getElementById(data)).removeAttribute('aria-dropeffect');
    revertPos.appendChild(document.getElementById(data));
}

DragAndDropApp.evaluateScore = function(){
    var correct = "<img class=\"correct\" src=\"../img/Right_16.png\" alt=\"right check mark\" disabled/>";
    var wrong = "<img class=\"wrong\" src=\"../img/Wrong_16.png\" alt=\"wrong x\" disabled/>";

    if (DragAndDropApp.AppData.FeedbackType == "continuous"){
        $(".correct").remove();
        $(".wrong").remove();
    }

    if (DragAndDropApp.AppData.FeedbackType == "continuous"){
        for (var i = 0; i < DragAndDropApp.questionData.length; i++){
            var temp = document.getElementById("drag" + i);
            var tempPar = temp.parentNode.parentNode;
            var tempComp = tempPar.id;
            var ans = parseInt(tempComp.substr(10));

            if (DragAndDropApp.qMatch[i] == DragAndDropApp.aMatch[ans]){
                
                DragAndDropApp.scoreEval.push(1);
                $(temp).append(correct);
                $(temp).css("background-color", "#EFE");
                $(temp).css("color", "#000");
                if ($(temp).hasClass("dropped") == false){
                    $(temp).toggleClass("dropped");
                }
                $(temp).closest('.MI_aSlot').addClass("reveal");     
            }
            else {
                DragAndDropApp.scoreEval.push(0);
                $(temp).append(wrong);
            }
        }
    }
    else {
        for (var i = 0; i < DragAndDropApp.questionData.length; i++){
            var temp = document.getElementById("drag" + i);
            var tempPar = temp.parentNode.parentNode;

            var tempComp = tempPar.id;
            var ans = parseInt(tempComp.substr(10));

            DragAndDropApp.savedElements.push(temp.innerHTML);
            DragAndDropApp.savedAnswers.push(temp.parentNode.id);

            if (DragAndDropApp.qMatch[i] == DragAndDropApp.aMatch[ans]){
                DragAndDropApp.scoreEval.push(1);
            }
            else {
                DragAndDropApp.scoreEval.push(0);
            }
        }
        if (DragAndDropApp.AppData.FeedbackType == "report"){
            clearInterval(DragAndDropApp.timerInterval);
            DragAndDropApp.currentAttempts++;
            DragAndDropApp.onComplete();
            DragAndDropApp.clearStage();
            DragAndDropApp.buildReport();
        }
    }
}

DragAndDropApp.calculateScore = function(){
    var score = 0;

    for (var i = 0; i < DragAndDropApp.questionData.length; i++){
        switch(DragAndDropApp.scoreEval[i]){
            case 1:
                score += 1;
                break;

            default:
                score = score;
                break;
        }
    }

    return score;
}

DragAndDropApp.checkAnswers = function() {
    DragAndDropApp.evaluateScore();

    var score = DragAndDropApp.calculateScore();

    $('#DND_progress').html("<p><strong>You currently have " + score + " items in the correct category.</strong></p>");
    $('#DND_progress').css('color', 'red');
    if (score === DragAndDropApp.questionData.length) {
        DragAndDropApp.finishedQuiz = true;
        if (DragAndDropApp.AppData.FeedbackType == "continuous"){
            $("#DND_resetWrongButton").remove();
            $("#DND_buttonSet").append(DragAndDropApp.resetButton);
        }
        $('#DND_progress').css('color', 'green');
        $('#DND_progress').html("<p><strong>Congratulations, you have successfully matched all "+ DragAndDropApp.questionData.length +" items with their correct category. Please proceed to the next topic in the course.</strong></p>");
    }

    DragAndDropApp.scoreEval = [];
    if (DragAndDropApp.finishedQuiz == false){
        if (DragAndDropApp.AppData.FeedbackType == "continuous"){
            document.getElementById("DND_resetWrongButton").disabled = false;
        }
    }
}

DragAndDropApp.checkAllAnswered = function() {
    tempArr = [];

    for(var c = 1; c <= DragAndDropApp.qCols; c++){
        temp = document.getElementById("unsorted_" + c);

        if ($(temp).children().length > 0 ) {
             tempArr.push(1);
             DragAndDropApp.allAnswered = false;
        }
        else {
            tempArr.push(0);
        }
    }

    if ($.inArray(1, tempArr) == -1) {
        DragAndDropApp.allAnswered = true;
    }

    if (DragAndDropApp.allAnswered == true){
        document.getElementById("DND_checkButton").disabled = false;
    }
    else {
        document.getElementById("DND_checkButton").disabled = true;
    }
}

DragAndDropApp.reset = function() {
    DragAndDropApp.ti = 1;

    $(".correct").remove();
    $(".wrong").remove();

    DragAndDropApp.scoreEval = [];

    for (var i = 0; i < DragAndDropApp.questionData.length; i++){
        var temp = document.getElementById("drag" + i);

        if ($(temp).hasClass("dropped") == true){
            $(temp).toggleClass("dropped");
            $(temp).css("background-color", "#FFF");
        }

        DragAndDropApp.origPos[i].appendChild(temp);
    }

    $(".dragableTextNode").each(function(){
        this.setAttribute("tabindex", DragAndDropApp.ti);
        DragAndDropApp.ti++;
    });

    $('#DND_progress').html("Click the 'Check Answers' button to check your progress");
    $('#DND_progress').css('color', 'black');
    DragAndDropApp.HandleMobileDrop();

    if (DragAndDropApp.AppData.FeedbackType == "continuous"){
        DragAndDropApp.finishedQuiz = false;
        $("#DND_resetButton").remove();
        $("#DND_buttonSet").append(DragAndDropApp.resetWrongButton);
        DragAndDropApp.sessionTimer = 0;
        DragAndDropApp.currentAttempts++;
        DragAndDropApp.onComplete();
    }

    $("[tabindex=1]").focus();
}

DragAndDropApp.resetWrong = function() {
    DragAndDropApp.ti = 1;

    DragAndDropApp.scoreEval = [];

    for (var i = 0; i < DragAndDropApp.questionData.length; i++){
        var temp = document.getElementById("drag" + i);

        if ($(temp.lastChild).hasClass("wrong")){
            DragAndDropApp.origPos[i].appendChild(temp);
        }
    }

    $(".dragableTextNode").each(function(){
        this.setAttribute("tabindex", DragAndDropApp.ti);
        DragAndDropApp.ti++;
    });

    $(".wrong").remove();
    document.getElementById("DND_resetWrongButton").disabled = true;

    $('#DND_progress').html("Click the 'Check Answers' button to check your progress");
    $('#DND_progress').css('color', 'black');
    DragAndDropApp.HandleMobileDrop();

    $("[tabindex=1]").focus();
}

DragAndDropApp.setMobileSelect = function(target) {
    DragAndDropApp.setHeight();

    if (DragAndDropApp.alreadySelected == false) {
        DragAndDropApp.alreadySelected = true;
        $(target).addClass("dragMe");
        $(target).css("border", "thin dashed #74167E");
        $(target).css('background-color', '#E8D8F5');
        $(target).css('color', '#000');
        target.setAttribute('aria-grabbed', 'true');

        DragAndDropApp.initMobileSelect(target);
    }
    else {
        if ($(target).hasClass('dragMe') == true){
            $(target).removeClass("dragMe");
            $(target).removeAttr( "style" );
            target.setAttribute('aria-grabbed', 'false');

            DragAndDropApp.alreadySelected = false;
            DragAndDropApp.HandleMobileDrop();
        }
        else {
            DragAndDropApp.HandleMobileDrop();
            DragAndDropApp.alreadySelected = false;
            $(target).addClass("dragMe");
            $(target).css("border", "thin dashed #74167E");
            $(target).css('background-color', '#E8D8F5');
            $(target).css('color', '#000');
            target.setAttribute('aria-grabbed', 'true');

            DragAndDropApp.alreadySelected = true;
            DragAndDropApp.initMobileSelect(target);
        }
    }
}

DragAndDropApp.initMobileSelect = function(target) {
    var temp = target.innerHTML;
    var message = "";
    DragAndDropApp.selectedElements.push(temp);

    for (var i = 0; i < DragAndDropApp.selectedElements.length; i++){
        if (i > 0){
            message += (", " + DragAndDropApp.selectedElements[i]);
        }
        else {
            message += (DragAndDropApp.selectedElements[i]);
        }
    }

    DragAndDropApp.ShowAccMessage("Selected: " + message);
}

DragAndDropApp.HandleMobileDrop = function(target){
    DragAndDropApp.selectedElements = [];

    var dropItem = $(".dragMe");
    var dropParId;
    var idNum;
    var numCheck;
    var numElements;
    if (target != null){
        dropParId = target.parentNode.id;
        idNum = parseInt(dropParId.substr(10));
        numCheck = DragAndDropApp.matchAmount[idNum];
        numElements = $(target).children().length + 1;
    }

    if (DragAndDropApp.ActivityType == "match"){
        if ($(target).is(":empty")){
            $(target).append($(dropItem));
        }
    }
    else {
        if (numElements <= numCheck){
            $(target).append($(dropItem));
        }
    }

    $(dropItem).removeClass("dragMe");
    $(dropItem).removeAttr("style");
    $(dropItem).attr('aria-grabbed', 'false');

    DragAndDropApp.HideAccMessage();

    DragAndDropApp.alreadySelected = false;
}

DragAndDropApp.initAccDnd = function() {
    // Call accDND() to use the default settings.
    var containers = $(DragAndDropApp.accDndCont + '.dragableTextNode')
    containers.keyup(function(ev){
        if ($(ev.target).hasClass("dropped")){
            ev.preventDefault();
        }
        else {
            //var ev = ev ? ev : window.event;
            // Simply adjusts the select size to reflect the number of listed items after each keypress of `.
            if (ev.which == 192) {
                $(this).click();
                DragAndDropApp.EnterAcessDropMode();
            }
        }
    });
}

DragAndDropApp.checkAccDrop = function(ev) {
    if (ev.which == 192)
    {
        DragAndDropApp.HandleMobileDrop(ev.target);
    }
}

DragAndDropApp.ShowAccMessage = function(message)
{
    $("#AccMessageDisp").html(message);
    $("#AccMessageDisp").css("visibility", "visible");
}

DragAndDropApp.HideAccMessage = function()
{
    $("#AccMessageDisp").html("");
    $("#AccMessageDisp").css("visibility", "hidden");
}

DragAndDropApp.EnterAcessDropMode = function()
{
    DragAndDropApp.setHeight();

    $(".dragableTextNode").each(function(){
        this.setAttribute("draggable", "false");
        this.setAttribute("tabindex", "-1");
        this.setAttribute("aria-hidden", "true");
    });

    $(".DND_button").each(function(){
        this.setAttribute("tabindex", "-1");
    });

    ti = 1;
    $('.dropzone').each(function(){
        this.setAttribute("tabindex", ti);
        ti++
    });

    $('.dropzone').focus(DragAndDropApp.HandleAccessDropzoneFocus);
    $('.dropzone').blur(DragAndDropApp.HandleAccessDropzoneBlur);

    $('.dropzone')[0].focus();
}

DragAndDropApp.HandleAccessDropzoneBlur = function(ev){
    ansId = parseInt(this.parentNode.id.substr(10));

    if (DragAndDropApp.savedBackgrounds[ansId] == "none"){
        $(this).css('background-color', '#FFFFFF');
    }
    else {
        $(this).css('background-image', "url(" + DragAndDropApp.savedBackgrounds[ansId] + ")");
    }

    $(this).unbind("keyup", DragAndDropApp.HandleAccessDropRequest);
}

DragAndDropApp.HandleAccessDropzoneFocus = function(ev){
    ansId = parseInt(this.parentNode.id.substr(10));

    if (DragAndDropApp.savedBackgrounds[ansId] == "none"){
        $(this).css('background-color', '#E8D8F5');
    }
    else {
        $(this).css('background-color', '#E8D8F5');
        $(this).css('background-image', "none");
    }

    $(this).keyup(DragAndDropApp.HandleAccessDropRequest);
}


DragAndDropApp.HandleAccessDropRequest = function(ev){
    // Simply adjusts the select size to reflect the number of listed items after each keypress of `.
    if (ev.which == 192)
    {
        $(this).mouseup();
        DragAndDropApp.ExitAcessDropMode();
    }
}

DragAndDropApp.ExitAcessDropMode = function() {
    DragAndDropApp.ti = 1;

    $(".dragableTextNode").each(function(){
        this.setAttribute("tabindex", DragAndDropApp.ti);
        this.setAttribute("draggable", "true");
        this.setAttribute("aria-hidden", "false");
        DragAndDropApp.ti++;
    });

    if (DragAndDropApp.AppData.FeedbackType == "continuous"){
        DragAndDropApp.resetWrongButton.setAttribute("tabindex", DragAndDropApp.ti);
        DragAndDropApp.ti++;
    }
    else {
        DragAndDropApp.resetButton.setAttribute("tabindex", DragAndDropApp.ti);
        DragAndDropApp.ti++;
    }
    DragAndDropApp.checkAnswersButton.setAttribute("tabindex", DragAndDropApp.ti);
    DragAndDropApp.ti++;
    DragAndDropApp.instructionButton.setAttribute("tabindex", DragAndDropApp.ti);
    DragAndDropApp.ti++;
    $("#DND_instructions").attr("tabindex", DragAndDropApp.ti);

    $('.dropzone').unbind("focus", DragAndDropApp.HandleAccessDropzoneFocus);
    $('.dropzone').unbind("blur", DragAndDropApp.HandleAccessDropzoneBlur);

    $('.dropzone').each(function(){
        ansId = parseInt(this.parentNode.id.substr(10));

        this.setAttribute("tabindex", -1);

        if (DragAndDropApp.savedBackgrounds[ansId] == "none"){
            $(this).css('background-color', '#FFFFFF');
        }
        else {
            $(this).css('background-image', "url(" + DragAndDropApp.savedBackgrounds[ansId] + ")");
        }
        $(this).unbind("keyup", DragAndDropApp.HandleAccessDropRequest);
        this.blur()
    });

    DragAndDropApp.HideAccMessage();

    $("[tabindex=1]").focus();
}

DragAndDropApp.touchDrag = function(evt) {

    var draggable = evt.target;
    var revertPos = draggable.id;
    var revert = parseInt(revertPos.substr(4, revertPos.length));
    var wrapper = DragAndDropApp.origPos[revert];


    /* the drag function */
    // make the element draggable by giving it an absolute position and modifying the x and y coordinates
    $(draggable).addClass("absolute");

    // put the draggable into the wrapper, because otherwise the position will be relative of the parent element
    wrapper.appendChild(draggable);

    var touch = evt.targetTouches[0];
    // Place element where the finger is
    draggable.style.left = touch.pageX - ($(draggable).width() / 2) + 'px';
    draggable.style.top = touch.pageY - ($(draggable).height() / 2) + 'px';
    evt.preventDefault();

    console.log(draggable.style.left);
    console.log(draggable.style.top);

    var offsetX = $('body').scrollLeft();
    var offsetY = $('body').scrollTop();

    draggable.addEventListener('touchend', function(event) {
        var dropParId;
        var idNum;
        var numCheck;
        var numElements;

        // find the element on the last draggable position
        var endTarget = document.elementFromPoint(
            event.changedTouches[0].pageX - offsetX,
            event.changedTouches[0].pageY - offsetY
        );

        // position it relative again and remove the inline styles that aren't needed anymore
        $(draggable).removeClass("absolute");
        draggable.removeAttribute('style');
        // put the draggable into it's new home
        if (endTarget) {
            var className = document.getElementById(endTarget.id);

            if (className.className == "connect_box dropzone"){
                dropParId = endTarget.parentNode.id;
                idNum = parseInt(dropParId.substr(10));
                numCheck = DragAndDropApp.matchAmount[idNum];
                numElements = $(endTarget).children().length + 1;

                if (DragAndDropApp.ActivityType == "match"){
                    if ($(className).is(":empty")){
                        endTarget.appendChild(draggable);
                    }
                }
                else {
                    if (numElements <= numCheck){
                        endTarget.appendChild(draggable);
                    }
                }
            }
            else if (className.parentNode.className == "connect_box dropzone"){
                dropParId = endTarget.parentNode.parentNode.id;
                idNum = parseInt(dropParId.substr(10));
                numCheck = DragAndDropApp.matchAmount[idNum];
                numElements = $(endTarget.parentNode).children().length + 1;

                if (DragAndDropApp.ActivityType == "match"){
                    if ($(className.parentNode).is(":empty")){
                        endTarget.parentNode.appendChild(draggable);
                    }
                }
                else {
                    if (numElements <= numCheck){
                        endTarget.parentNode.appendChild(draggable);
                    }
                }
            }
        }
    });
}

DragAndDropApp.removeClass = function(e,c) {
    e.className = e.className.replace(
        new RegExp('(?:^|\\s)'+c+'(?!\\S)') ,'');
}

DragAndDropApp.EmbedMedia = function(containerRef, mediaData) {
    var mediaDomObj = document.createElement("div");
    mediaDomObj.setAttribute('class', 'DND_Media')

    switch(mediaData.type) {
      case "link":
          var mediaDomContent = document.createElement("a");
          mediaDomContent.setAttribute('class', 'DND_MediaLink');
          mediaDomContent.setAttribute('href', mediaData.src);
          mediaDomContent.setAttribute('target', "_blank");
          mediaDomContent.setAttribute('tabindex', DragAndDropApp.ti);
          DragAndDropApp.ti++
          if(mediaData.description)
          {
            mediaDomContent.innerHTML = mediaData.description
          } else {
            mediaDomContent.innerHTML = "Link"
          }
          mediaDomObj.appendChild(mediaDomContent)
          break;

      case "image":
          if(mediaData.mediaLink != "none"){
            var mediaDomLink = document.createElement("a");
            mediaDomLink.setAttribute('class', 'DND_MediaImage');
            mediaDomLink.setAttribute('href', mediaData.mediaLink);
            mediaDomLink.setAttribute('tabindex', DragAndDropApp.ti);
            DragAndDropApp.ti++
            mediaDomLink.setAttribute('target', "_blank");
          }

          var mediaDomContent = document.createElement("img");

          if(mediaData.mediaLink  == "none"){
            mediaDomContent.setAttribute('class', 'DND_MediaImage');
          }

          mediaDomContent.setAttribute('src', mediaData.src);

          if(mediaData.width != "none"){
            mediaDomContent.setAttribute('width', mediaData.width);
          }

          if(mediaData.height != "none"){
            mediaDomContent.setAttribute('height', mediaData.height);
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
          validSrc = DragAndDropApp.validateYouTubeLink(mediaData.src)
          if(validSrc){
            var mediaDomContent = document.createElement("iframe");
            mediaDomContent.setAttribute('class', 'DND_MediaEmbeddedVideo');

            if(mediaData.width != "none"){
              mediaDomContent.setAttribute('width', mediaData.width);
            } else {
              mediaDomContent.setAttribute('width', '420');
            }

            if(mediaData.height != "none"){
              mediaDomContent.setAttribute('height', mediaData.height);
            }
            else {
              mediaDomContent.setAttribute('height', '315');
            }

            mediaDomContent.setAttribute('frameborder', '0');
            mediaDomContent.setAttribute('allowfullscreen', 'true');

            mediaDomContent.setAttribute('src', validSrc);
            mediaDomObj.setAttribute('style', 'text-align:center;');

            if(mediaData.description)
            {
              mediaDomContent.setAttribute('alt', mediaData.description)
            }

            mediaDomObj.appendChild(mediaDomContent)

            var mediaDomLink = document.createElement("a");
            mediaDomLink.setAttribute('class', 'DND_MediaAltLink');
            mediaDomLink.setAttribute('href', mediaData.altLink);
            mediaDomLink.setAttribute('tabindex', DragAndDropApp.ti);
            DragAndDropApp.ti++
            mediaDomLink.setAttribute('target', "_blank");
            mediaDomLink.innerHTML = "Alternate Link."

            mediaDomObj.appendChild(mediaDomLink)


          }
          break;

      default:
          break;
    }
    containerRef.appendChild(mediaDomObj)
}

DragAndDropApp.validateYouTubeLink = function(src){
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

DragAndDropApp.timer = function(){
    DragAndDropApp.sessionTimer++;
}

DragAndDropApp.setHeight = function(){
    if (DragAndDropApp.heightSet == false){
        var minHeight = $("#qColum_1").height();
        //$("#DND_qColContainer").css("min-height", (minHeight + 20) + "px");
        DragAndDropApp.heightSet = true;
    }
}

DragAndDropApp.onComplete = function(){
    //custom code will go here
}
