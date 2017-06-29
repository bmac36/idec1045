/**
 * Variable: InlineQuizApp
 *
 * Contains InlineQuizApp's properties
 *
 * currentQuestion -The question number that the quiz is on. Integer.
 * setupReady - If the quiz is loaded or not. Boolean.
 * waitingOnSetup - If the quiz is waiting to be loaded. Boolean.
 * containerRef - Holds the section ID that will house the quiz . String.
 * contentRef - Holds a created HTML element. String.
 * QuizData - Holds the parsed JSON data. Object.
 * AttemptData - Currently not in use. Array.
 * numericalQuizID - Holds the quiz number. Integer.
 * currentQuestionID - Holds the number of the question currently being answered. Integer.
 * onComplete - Holds a function to be fired when the quiz is complete. Event.
 * onReady - Holds a function to be fired when the quiz is ready. Event.
 * tabIndexSet - The tabindex for the quiz element being created. Integer.
 * smallWidthTolerance - Minimum screen size for the quiz. Integer.
 * inputText - Holds the user submitted answers from text inputs. Array.
 * textInterval - Holds the interval to check if all text fields have been typed into. Event.
 * inputScores - Holds scores from questions with text input. Array.
 *
 */
var InlineQuizApp = {
  currentQuestion: 0,
  setupReady: false,
  waitingOnSetup: false,
  containerRef: null,
  contentRef: null,
  QuizData: null,
  AttemptData: [],
  numericalQuizID: 0,
  currentQuestionID: 0,
  onComplete: null,
  onReady:null,
  tabIndexSet: 1,
  smallWidthTolerance: 650,
  inputText: [],
  savedText: [],
  textInterval: null,
  inputScores: []
}

// This is what will happen the second the page is done loading. if data is already set then go for it. Otherwise wait for setupRequest.

/**
 * Function:
 *
 * Builds quiz if/when document is ready.
 *
 */
$(document).ready(function () {
  if(InlineQuizApp.setupReady){
    InlineQuizApp.getQuizData(InlineQuizApp.BuildQuiz)
  } else {
    InlineQuizApp.waitingOnSetup = true
  }
});

/**
 * Function: Reset
 *
 * Resets properties to their default values.
 *
 */
InlineQuizApp.Reset = function() {
  InlineQuizApp.currentQuestion = 0
  InlineQuizApp.setupReady = false
  InlineQuizApp.waitingOnSetup = false
  InlineQuizApp.containerRef = null
  InlineQuizApp.contentRef = null
  InlineQuizApp.QuizData = null
  InlineQuizApp.AttemptData = []
  InlineQuizApp.numericalQuizID = 0
  InlineQuizApp.currentQuestionID = 0
  InlineQuizApp.onComplete = null
  InlineQuizApp.onReady = null
  InlineQuizApp.tabIndexSet = 1
  InlineQuizApp.smallWidthTolerance = 650,
  InlineQuizApp.inputText = [],
  InlineQuizApp.savedText = [],
  InlineQuizApp.textInterval = null,
  InlineQuizApp.inputScores = []
}

/**
 * Function: setupQuiz
 *
 * Establishes the JSON text file path, the id of the section to house the quiz, and makes a call to get the quiz data.
 *
 * Parameters:
 *
 *   file     - String
 *   location - String
 *
 */
InlineQuizApp.setupQuiz = function(file, location){
  InlineQuizApp.numericalQuizID ++;
  questionFile = file;

  if(document.getElementById(location) !== null)
  {
    InlineQuizApp.containerRef = document.getElementById(location)
    InlineQuizApp.setupReady = true
    if(InlineQuizApp.waitingOnSetup){
      InlineQuizApp.getQuizData(InlineQuizApp.BuildQuiz)
    }
  } else {
    InlineQuizApp.cLog("ERROR!!: DOM object with the id " + containerID + " was not found in this document")
  }
}

/**
 * Function: getQuizData
 *
 * Retrieves the quiz data from the JSON text file, passes quiz data to build the quiz.
 *
 * Parameters:
 *
 *   callback - Function
 *
 */

InlineQuizApp.getQuizData = function(callback) {
  // lets try and get our JSON data beofre we build anything
  var jqxhr = $.getJSON( questionFile, function( data ) {
    InlineQuizApp.QuizData = data
    if(InlineQuizApp.vaildateQuizData())
    {
      callback(InlineQuizApp.QuizData)
    } else {
      alert("Inline quiz error: question data was corrupted. please contact your site administrator.");
      cLog("ERROR!!: quiz data is missing crucial data, consult documention")
    }
  })

  // if the json data fails inform the users ang give some data to developers using the debug console.
  jqxhr.fail(function(e){
    alert("Inline quiz error: failed to load question data. please contact your site administrator.");
    cLog("ERROR!!: failed to load data file from " + questionFile +" ensure file is at that location and that JSON data is vaild. (tip: use a vaildator like: http://jsonformatter.curiousconcept.com/ )")
    cLog(e)
  })
}

/**Function: HandleWindowAdjust
 *
 * Repositions HTML quiz elements when the window is resized and still exceeds smallWidthTolerance.
 *
*/
InlineQuizApp.HandleWindowAdjust = function(){
  // handle the 2 button split
  if ($(".ILQ_quizFeild").length != 0 )
  {
    if ($(".LeftHalfButton").length != 0 && $(".RightHalfButton").length != 0 )
    {
      w = parseFloat($(".ILQ_quizFeild").css("width"))/2
      b = parseFloat($(".LeftHalfButton").css("borderLeftWidth")) + parseFloat($(".RightHalfButton").css("borderRightWidth"))
      p = parseFloat($(".LeftHalfButton").css("paddingLeft")) + parseFloat($(".RightHalfButton").css("paddingRight"))
      $(".LeftHalfButton").css("width", (w-(b+p)) + "px")
      $(".RightHalfButton").css("width", (w-(b+p)) + "px")
    }
  }

  // handle question text and hint
  if ($(".ILQ_questionText").length != 0 && $("#ILQ_HintButton").length != 0  )
  {
    w1 = parseFloat($("#ILQ_content").css("width"))

    if(w1 < InlineQuizApp.smallWidthTolerance) {
      $(".ILQ_questionText").css("width", "inherit")
      $(".ILQ_questionText").css("float", "none")
      $("#ILQ_HintButton").css("float", "none")
      $("#ILQ_HintButton").css("margin", "0em auto 1em auto")
    } else {
      w2 = parseFloat($("#ILQ_HintButton").css("width")) + parseFloat($("#ILQ_HintButton").css("paddingLeft")) + parseFloat($("#ILQ_HintButton").css("paddingRight")) + parseFloat($("#ILQ_HintButton").css("borderLeftWidth")) + parseFloat($("#ILQ_HintButton").css("borderRightWidth"))
      buffer = 3
      $(".ILQ_questionText").css("width", w1-w2-buffer)
      $(".ILQ_questionText").css("float", "left")
      $("#ILQ_HintButton").css("float", "right")
      $("#ILQ_HintButton").css("margin", "0px")
    }
  }

  // handle response text and button
  if ($(".ILQ_ContinuousResponceText").length != 0 && $("#ILQ_NextButton").length != 0  )
  {
    w1 = parseFloat($(".ILQ_quizFeild").css("width"))

    if(w1 < InlineQuizApp.smallWidthTolerance) {
      $(".ILQ_ContinuousResponceText").css("width", "inherit")
      $(".ILQ_ContinuousResponceText").css("float", "none")
      $("#ILQ_NextButton").css("float", "none")
      $("#ILQ_NextButton").css("margin", "1em auto")
    } else {
      w2 = parseFloat($("#ILQ_NextButton").css("width")) + parseFloat($("#ILQ_NextButton").css("paddingLeft")) + parseFloat($("#ILQ_NextButton").css("paddingRight")) + parseFloat($("#ILQ_NextButton").css("borderLeftWidth")) + parseFloat($("#ILQ_NextButton").css("borderRightWidth"))
      buffer = 3
      $(".ILQ_ContinuousResponceText").css("width", w1-w2-buffer)
      $(".ILQ_ContinuousResponceText").css("float", "left")
      $("#ILQ_NextButton").css("float", "right")
      $("#ILQ_NextButton").css("margin", "1em 0px")
    }
  }

}

// we got the data! but does it have everything we need?
// This will define defaults when incorrect or bad data is provided
/**
 * Function: vaildateQuizData
 *
 * Checks that all the quiz data contains valid properties, and if not, assigns them a default value.
 *
 * Returns:
 *
 *   Whether or not the quiz data is valid.
 */
InlineQuizApp.vaildateQuizData = function(){
  data = InlineQuizApp.QuizData
  valid = false

  /**
   * Function: vaildateBool
   *
   * Checks the validity of the passed boolean object property.
   *
   * Parameters:
   *
   *   value      - Object Property (Boolean).
   *   define     - String.
   *   defaultVal - Boolean.
   *
   * Returns:
   *
   *   A valid boolean value.
   */
  vaildateBool = function(value, define, defaultVal){
    if(value == void 0  || value == null){
     value = defaultVal
    } else {
      if(value.constructor == String)
      {
        if(value == "true"){
          value = true
        } else if(value == "false") {
          value = false
        } else {
          InlineQuizApp.cLog("Warning! unrecognized "+define+" value provided, using " + defaultVal)
          value = defaultVal
        }
      } else if(value.constructor != Boolean){
        InlineQuizApp.cLog("Warning! unrecognized "+define+" value provided, using " + defaultVal)
        value = defaultVal
      }
    }
    return value
  }

  /**
   * Function: vaildateFunction
   *
   * Checks the validity of the passed function object property.
   *
   * Parameters:
   *
   *   value  - Object Property (Function).
   *   define - String.
   *
   * Returns:
   *
   *   A valid function.
   */
  vaildateFunction = function(value, define){
    if(value == void 0  || value == null || value == "none"){
     value = "none"
    } else {
      if(value.constructor == String && window[value] && window[value].constructor == Function)
      {
        return window[value]
      } else if(value.constructor != Boolean){
        InlineQuizApp.cLog("Warning! unrecognized "+define+" value provided, using none")
        value = "none"
      }
    }
    return value
  }

  /**
   * Function: vaildateNumber
   *
   * Checks the validity of the passed integer object property.
   *
   * Parameters:
   *
   *   value      - Object Property (Integer).
   *   define     - String.
   *   defaultVal - Integer.
   *
   * Returns:
   *
   *   A valid integer value.
   */
  vaildateNumber = function(value, define, defaultVal){
    if(value == void 0  || value == null){
      value = defaultVal
    } else {
      if(value.constructor == String)
      {
        parsed = parseFloat(value)
        if(!inNaN(parsed)) {
          value = parsed
        } else {
          InlineQuizApp.cLog("Warning! unrecognized "+define+" value provided, using " + defaultVal)
          value = defaultVal
        }
      } else if(value.constructor != Number){
        InlineQuizApp.cLog("Warning! unrecognized "+define+" value provided, using " + defaultVal)
        value = defaultVal
      }
    }
    return value
  }

  if(data == void 0 || data == null || data.constructor != Object){
    return false
  }

  var g = data.General
  var q = data.Questions

  if(g && g.constructor == Object && q && q.constructor == Array){

    //GENRAL
    //
    if(!g.QuizName || g.QuizName == null){
      g.QuizName = "unnamed quiz"
    }

    if(!g.feedBackType == "continuous" && !g.feedBackType == "report" ){
      g.feedBackType = "continuous"
      InlineQuizApp.cLog("Warning! unrecognized Feedback Type provided, using 'continuous'")
    }

    g.forceCorrect = vaildateBool(g.forceCorrect, "forceCorrect", false);
    g.allowNone = vaildateBool(g.allowNone, "allowNone", false);
    g.allowPrevious = vaildateBool(g.allowPrevious, "allowPrevious", false);
    g.showHints = vaildateBool(g.showHints, "showHints", false);
    g.allowPartial = vaildateBool(g.allowPartial, "allowPartial", true);
    g.randomize = vaildateBool(g.randomize, "randomize", true);
    // showQuestions validated after questions

    if(!g.preQuizText || g.preQuizText == null){
      g.preQuizText = "none"
    }

    if(!g.postQuizText || g.postQuizText == null){
      g.postQuizText = "none"
    }

    g.onCompleteEvent = vaildateFunction(g.onCompleteEvent, "onCompleteEvent")

    if(InlineQuizApp.onComplete == null){
      InlineQuizApp.onComplete = g.onCompleteEvent
    }

    g.onReadyEvent = vaildateFunction(g.onReadyEvent, "onReadyEvent")

    if(InlineQuizApp.onReady == null){
      InlineQuizApp.onReady = g.onReadyEvent
    }

    // QUESTIONS
    if(q.length == 0){
      InlineQuizApp.cLog("ERROR! no readable questions found in JSON")
      return false
    }

    vaildatedQuestions = []
    for (var i = 0 ; i < q.length; i++) {
      if(q[i].constructor == Object)
      {
        qValid = true

        if(!q[i].questionType == "All That Apply" && !q[i].questionType == "Multiple Choice" && !q[i].questionType == "Fill In The Blank" && !q[i].questionType == "Math"){
          q[i].questionType = "Multiple Choice"
          InlineQuizApp.cLog("Warning! unrecognized questionType in question index "+i+", using 'Multiple Choice'")
        }


        if(q[i].typeOptions == void 0 || q[i].typeOptions == null){
          q[i].typeOptions = {}
        } else if(q[i].typeOptions.constructor != Object) { // when we start using these this will need to be more comprehensive.
          q[i].typeOptions = {}
          InlineQuizApp.cLog("Warning! typeOptions in question index "+i+", was not formatted correctly, ignoring these options")
        }

        q[i].maxScoreValue = vaildateNumber(q[i].maxScoreValue, "maxScoreValue", 1);

        if(q[i].questionText == void 0  || q[i].questionText == null || q[i].questionText.constructor != String || q[i].questionText == ''){
          InlineQuizApp.cLog("Warning! questionText in question index "+i+", was not formatted correctly, removing this question")
          qValid = false
        }

        if(q[i].questionMediaSrc == void 0  || q[i].questionMediaSrc == null || q[i].questionMediaSrc.constructor != String || q[i].questionMediaSrc == ''){
          q[i].questionMediaSrc == 'none'
        }

        if(q[i].hintText == void 0  || q[i].hintText == null || q[i].hintText.constructor != String || q[i].hintText == ''){
          q[i].hintText == 'none'
        }

        if(q[i].hintMediaSrc == void 0  || q[i].hintMediaSrc == null || q[i].hintMediaSrc.constructor != String || q[i].hintMediaSrc == ''){
          q[i].hintMediaSrc == 'none'
        }

        // ANSWERS
        a = q[i].answers
        if(a != void 0  && a != null && a.constructor == Array && a.length != 0){
            vaildAnswers = []
            for (var ai = 0 ; ai < a.length; ai++) {
              aValid = true
              if(a[ai].constructor == Object)
              {
                if(a[ai].answerText == void 0  || a[ai].answerText == null || a[ai].answerText.constructor != String || a[ai].answerText == ''){
                  InlineQuizApp.cLog("Warning! questionText in question index "+i+" answer "+ai+", was not formatted correctly, removing this answer")
                  aValid = false
                }

               if(a[ai].feedBack == void 0  || a[ai].feedBack == null || a[ai].feedBack.constructor != String || a[ai].feedBack == ''){
                a[ai].feedBack = "none"
               }

               a[ai].scoreValue = vaildateNumber(a[ai].scoreValue, "scoreValue", 0)

              } else {
                InlineQuizApp.cLog("Warning! questionText in question index "+i+" answer "+ai+", was not formatted correctly, removing this answer")
                aValid = false
              }

              if(aValid){
                vaildAnswers.push(a[ai])
              }
            }

            oneIsCorrect = false

            if(vaildAnswers.length == 0){
              InlineQuizApp.cLog("Warning! answers in question index " + i + ", was not formatted correctly, removing this question")
              qValid = false
            } else {
              for (var vai = vaildAnswers.length - 1; vai >= 0; vai--) {
                if(vaildAnswers[vai].scoreValue > 0){
                  oneIsCorrect = true
                }
              }

              if(!oneIsCorrect){
                InlineQuizApp.cLog("Warning! valid answers in question index " + i + ", have no scoreValue set to 1 or more, at least one answer needs to provide a score, removing question")
                qValid = false
              }

            }

            q[i].answers = vaildAnswers

        } else {
          InlineQuizApp.cLog("Warning! answers in question index " + i + ", was not formatted correctly, removing this question")
          qValid = false
        }

        if(qValid){
          vaildatedQuestions.push(q[i])
        }
      } else {
        InlineQuizApp.cLog("Warning! Question index " + i + " in JSON was not valid Object, it will not be used")
      }

    };

    if(vaildatedQuestions.length == 0){
      InlineQuizApp.cLog("ERROR! no valid questions found in JSON")
      return false
    }



    g.showQuestions = vaildateNumber(g.showQuestions, "showQuestions", vaildatedQuestions.length);
    InlineQuizApp.QuizData.General = g
    InlineQuizApp.QuizData.Questions = vaildatedQuestions

    valid = true
  }


  return valid
}

// Since some browsers don't actually have a native console (like IE8) simply using the console log directly can cause errors.
// This function will ensure that doesn't happen.

/**
 * Function: cLog
 *
 * Creates a console log message.
 *
 * Parameters:
 *
 *   message - String.
 *
 */
InlineQuizApp.cLog = function(message){
  if (typeof console === "object") {
    console.log("Inline Quiz "+InlineQuizApp.QuizData.General.QuizName+": "+ message)
  }
}

/**
 * Function: HasClass
 *
 * Determines whether the passed object already has an assigned class.
 *
 * Parameters:
 *
 *   DomObj  - HTML DOM Object
 *   classID - String.
 *
 * Returns:
 *
 *   Whether or not the object has an assigned class.
 */
InlineQuizApp.HasClass = function(DomObj, classID){
  if(DomObj.classList && DomObj.classList.contains(classID)) { // new!
    return true
  } else if(DomObj.className) { // old :(
    classlist = DomObj.className.split(" ")
    for (var i = classlist.length - 1; i >= 0; i--) {
      if(classlist[i] == classID){
        return true
      }
    };
    return false
  }

  cLog("HasClass was passed a bad DomObj")
  return false
}

/**
 * Function: shuffle
 *
 * Shuffles the elements of the passed array.
 *
 * Parameters:
 *
 *   o - Object (Array).
 *
 * Returns:
 *
 *   The shuffled array.
 */
InlineQuizApp.shuffle = function(o) { //v1.0
    for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};

// called only after we have our data, its now time to build us a quiz!
/**
 * Function: BuildQuiz
 *
 * Builds the quiz. Randomizes questions if required, displays pre quiz text if required, otherwise it calls the first question.
 *
 */
InlineQuizApp.BuildQuiz = function() {

  window.onresize = InlineQuizApp.HandleWindowAdjust
  InlineQuizApp.DefineContainer()

  for (var q = InlineQuizApp.QuizData.Questions.length - 1; q >= 0; q--) {
    InlineQuizApp.QuizData.Questions[q].QuestionID = q
    InlineQuizApp.QuizData.Questions[q].ChoosenAnswers = []
  }

  for (var i = 0; i < InlineQuizApp.QuizData.Questions.length; i++) {
    InlineQuizApp.inputScores.push(0);
  }

  for (var i = 0; i < InlineQuizApp.QuizData.Questions.length; i++) {
    InlineQuizApp.savedText.push(0);
  }

  if(InlineQuizApp.QuizData.General.randomize){
    InlineQuizApp.QuizData.Questions = InlineQuizApp.shuffle(InlineQuizApp.QuizData.Questions)
  }

  if (InlineQuizApp.QuizData.General.preQuizText != "none") {
    InlineQuizApp.SetTextSlide(InlineQuizApp.QuizData.General.preQuizText,  function(){
      InlineQuizApp.GoNextQuestion()
    }, {
      mediaData: InlineQuizApp.QuizData.General.preQuizMedia
    })
  } else {
    InlineQuizApp.GoNextQuestion()
  }


  eventData = {
    quizData: InlineQuizApp.QuizData
  }

  if (InlineQuizApp.onReady != null && InlineQuizApp.onReady.constructor == Function){
    try{
      InlineQuizApp.onReady(eventData)
    } catch(err) {
      InlineQuizApp.cLog("onReady Error!")
      InlineQuizApp.cLog(err)
    }
  }

}

/**
 * Function: RequestNextQuestion
 *
 * Checks to make sure user is able to progress to the next question, and if so, calls the next question. If not, it makes a call to assess the question's answer.
 *
 */
InlineQuizApp.RequestNextQuestion = function() {
    clearInterval(InlineQuizApp.textInterval);

    if(InlineQuizApp.QuizData.General.feedBackType =="continuous")
    {
      InlineQuizApp.AssessFeedback()
    } else if (InlineQuizApp.QuizData.General.feedBackType == "report" && InlineQuizApp.QuizData.General.forceCorrect == true) {
      InlineQuizApp.AssessFeedback()
    } else {
      if (InlineQuizApp.QuizData.Questions[InlineQuizApp.currentQuestion].questionType == "Fill In The Blank" || InlineQuizApp.QuizData.Questions[InlineQuizApp.currentQuestion].questionType == "Math"){
        InlineQuizApp.saveTextInput();
        InlineQuizApp.savedText.splice(InlineQuizApp.currentQuestion, 1, InlineQuizApp.inputText);
        clearInterval(InlineQuizApp.textInterval);
      }
      InlineQuizApp.currentQuestion++;
      if(InlineQuizApp.currentQuestion < InlineQuizApp.QuizData.General.showQuestions){
        InlineQuizApp.currentQuestionID = InlineQuizApp.QuizData.Questions[InlineQuizApp.currentQuestion].QuestionID
      }
      InlineQuizApp.GoNextQuestion();
    }
}

/**
 * Function: GoNextQuestion
 *
 * Loads the next question if there are remaining questions. Otherwise it calls for the quiz report if required or calls for the end of the quiz.
 *
 */
InlineQuizApp.GoNextQuestion =  function(){
  if(InlineQuizApp.currentQuestion < InlineQuizApp.QuizData.General.showQuestions){
    InlineQuizApp.setQuestionSlide(InlineQuizApp.QuizData.Questions[InlineQuizApp.currentQuestion])
  } else {
    if(InlineQuizApp.QuizData.General.feedBackType == "report"){
      InlineQuizApp.GenerateFullReport()
    } else {
      InlineQuizApp.goEndSlide()
    }

  }
}

/**
 * Function: goEndSlide
 *
 * Ends the quiz with either a default or a user specified end message.
 *
 */
InlineQuizApp.goEndSlide = function() {
  if (InlineQuizApp.QuizData.General.postQuizText != "none"){
    endText = InlineQuizApp.QuizData.General.postQuizText
  } else {
    endText = "You have completed this assessment."
  }

  eventData = {
    quizData: InlineQuizApp.QuizData,
    scoreAchieved: InlineQuizApp.GetToltalScore(),
    scoreMax: InlineQuizApp.GetMaxScore()
  }

  if (InlineQuizApp.onComplete != null && InlineQuizApp.onComplete.constructor == Function){
    try{
      InlineQuizApp.onComplete(eventData)
    } catch(err) {
      InlineQuizApp.cLog("onComplete Error!")
      InlineQuizApp.cLog(err)
    }
  }
  if(InlineQuizApp.QuizData) // incase they call reset as an on complete event
  {
    if (InlineQuizApp.QuizData.General.repeatOnComplete){
      InlineQuizApp.SetTextSlide(endText, function(){
          if(InlineQuizApp.QuizData.General.randomize){
            InlineQuizApp.QuizData.Questions = InlineQuizApp.shuffle(InlineQuizApp.QuizData.Questions)
          }
          InlineQuizApp.currentQuestion = 0
          InlineQuizApp.currentQuestionID = InlineQuizApp.QuizData.Questions[InlineQuizApp.currentQuestion].QuestionID
          InlineQuizApp.GoNextQuestion();
      }, {
        buttonLable:"Repeat",
        mediaData: InlineQuizApp.QuizData.General.postQuizMedia
      })
    } else {
      InlineQuizApp.SetTextSlide(endText, "none", {
        mediaData: InlineQuizApp.QuizData.General.postQuizMedia
      })
    }
  }
}

/**
 * Function: goPreviousQuestion
 *
 * Loads the previous question as long as you're not on the first question.
 *
 */
InlineQuizApp.goPreviousQuestion = function(){
  clearInterval(InlineQuizApp.textInterval);

  if(InlineQuizApp.currentQuestion == 0)
  {
    InlineQuizApp.SetTextSlide(InlineQuizApp.QuizData.General.preQuizText, function(){
      InlineQuizApp.GoNextQuestion()
    }, {
      mediaData: InlineQuizApp.QuizData.General.preQuizMedia
    })
  } else {
    InlineQuizApp.currentQuestion--;
    InlineQuizApp.GoNextQuestion();
  }
}

/**
 * Function: GenerateFullReport
 *
 * Generates a full report by piecing all the mini reports together.
 *
 */
InlineQuizApp.GenerateFullReport = function() {
  var ILQ_fullReport = document.createElement("div");
  ILQ_fullReport.innerHTML = ""//"<h2>Quiz Completed</h2><strong>Your score was "+InlineQuizApp.GetToltalScore()+"/"+ InlineQuizApp.QuizData.General.showQuestions+"<br>";

  for(var i = 0; i < InlineQuizApp.QuizData.General.showQuestions; i++){
    ILQ_fullReport.appendChild(InlineQuizApp.GenerateMiniReport(i, true))
  }

  InlineQuizApp.SetTextSlide(ILQ_fullReport.innerHTML, InlineQuizApp.goEndSlide, {
    addClass: "ILQ_fullReport"
  });
}

/**
 * Function: GenerateMiniReport
 *
 * Generates report for each question.
 *
 * Parameters:
 *
 *   questionIndex   - Integer.
 *   includeQuestion - Boolean.
 *
 * Returns:
 *
 *   The mini report for the passed question number.
 */
InlineQuizApp.GenerateMiniReport = function(questionIndex, includeQuestion) {

  if(questionIndex == void 0)
  {
    questionIndex = InlineQuizApp.currentQuestion
  }

  var ILQ_miniReport = document.createElement("div");
  ILQ_miniReport.setAttribute('class', 'ILQ_miniReport');


  var ILQ_miniReportContent = document.createElement("div");
  ILQ_miniReportContent.setAttribute('class', 'ILQ_miniReportContent');

  ca = InlineQuizApp.QuizData.Questions[questionIndex].ChoosenAnswers
  aa = InlineQuizApp.QuizData.Questions[questionIndex].answers
  crta = []

  for (var i = aa.length - 1; i >= 0; i--) {
   if (InlineQuizApp.QuizData.General.allowPartial && aa[i].scoreValue > 0) {
    crta.push(aa[i].answerText)
   } else if(!InlineQuizApp.QuizData.General.allowPartial) {
      if(InlineQuizApp.QuizData.Questions[questionIndex].questionType == "All That Apply" && aa[i].scoreValue > 0)
      {
        crta.push(aa[i].answerText)
      } else if(InlineQuizApp.QuizData.Questions[questionIndex].questionType == "Multiple Choice" && aa[i].scoreValue == InlineQuizApp.QuizData.Questions[questionIndex].maxScoreValue) {
        crta.push(aa[i].answerText)
      }
   }
  }

  cont = ""

  if(includeQuestion){
    var ILQ_miniReportRecap = document.createElement("p");
    ILQ_miniReportRecap.setAttribute('class', 'questionRecap');
    if (InlineQuizApp.QuizData.Questions[questionIndex].questionType == "Fill In The Blank" || InlineQuizApp.QuizData.Questions[questionIndex].questionType == "Math"){
      qCopy = InlineQuizApp.QuizData.Questions[questionIndex].questionText;

      for (var i = 1; i <= InlineQuizApp.QuizData.Questions[questionIndex].answers.length; i++){
        blankField = InlineQuizApp.QuizData.Questions[questionIndex].answers[i - 1].answerText;
        qWithoutBlank = qCopy.replace("BLANK" + i, blankField);
        qCopy = qWithoutBlank;
      }

      ILQ_miniReportRecap.innerHTML =  "<p><strong>Question "+(questionIndex + 1)+":</strong> " + qCopy +"</p>"
      ILQ_miniReport.appendChild(ILQ_miniReportRecap)
    }
    else{
      ILQ_miniReportRecap.innerHTML =  "<p><strong>Question "+(questionIndex + 1)+":</strong> " + InlineQuizApp.QuizData.Questions[questionIndex].questionText +"</p>"
      ILQ_miniReport.appendChild(ILQ_miniReportRecap)
    }

    InlineQuizApp.BuildResponceText(ILQ_miniReport, questionIndex);

  } else {
    cont += ""
  }

  if(crta.length > 1)
  {
    cont += "<strong>Correct Answers:</strong><ul>"
  } else {
    cont += "<strong>Correct Answer:</strong><ul>"
  }

  if(InlineQuizApp.QuizData.Questions[questionIndex].questionType == "Fill In The Blank" || InlineQuizApp.QuizData.Questions[questionIndex].questionType == "Math"){
    qCopy = InlineQuizApp.QuizData.Questions[questionIndex].questionText;

    for (var i = 1; i <= InlineQuizApp.QuizData.Questions[questionIndex].answers.length; i++){
      blankField = "<span class='ILQ_ReferenceHighlight'>" + InlineQuizApp.QuizData.Questions[questionIndex].answers[i - 1].answerText + "</span>";
      qWithoutBlank = qCopy.replace("BLANK" + i, blankField);
      qCopy = qWithoutBlank;
    }

    cont += qCopy;
  }
  else {
    for (var i = crta.length - 1; i >= 0; i--) {
      cont += "<li>"+crta[i]+"</li>"
    }
  }

  cont += "</ul>"

  if(InlineQuizApp.QuizData.Questions[questionIndex].questionType == "Fill In The Blank" || InlineQuizApp.QuizData.Questions[questionIndex].questionType == "Math"){

    cont += "<strong>You answered:</strong><ul>"
    answer = ""

    qCopy = InlineQuizApp.QuizData.Questions[questionIndex].questionText;

    for (var i = 0; i < InlineQuizApp.savedText[questionIndex].length; i++){
      if(InlineQuizApp.savedText[questionIndex][i] == InlineQuizApp.QuizData.Questions[questionIndex].answers[i].answerText){
        answer = "right";
      }
      else {
        answer = "wrong"
      }
      if (InlineQuizApp.QuizData.Questions[questionIndex].answers[i].altAnswers) {
        for (var j = 0; j < InlineQuizApp.QuizData.Questions[questionIndex].answers[i].altAnswers.length; j++){
          if (InlineQuizApp.savedText[questionIndex][i] == InlineQuizApp.QuizData.Questions[questionIndex].answers[i].altAnswers[j].answerText){
            answer="altRight";
          }
        }
      }

      switch(answer){
        case "right":
          blankField = "<span class='ILQ_RightHighlight'>" + InlineQuizApp.savedText[questionIndex][i] + "</span>";
          altResponse = "";
          break;

        case "altRight":
          blankField = "<span class='ILQ_SimilarHighlight'>" + InlineQuizApp.savedText[questionIndex][i] + "</span>";
          altResponse = "<li>Instead of <span class='ILQ_ReferenceHighlight'>"+ InlineQuizApp.savedText[questionIndex][i] + "</span> you could have answered <span class='ILQ_ReferenceHighlight'>" + InlineQuizApp.QuizData.Questions[questionIndex].answers[i].answerText + "</span>.</li>"
          break;

        default:
          blankField = "<span class='ILQ_WrongHighlight'>" + InlineQuizApp.savedText[questionIndex][i] + "</span>";
          altResponse = "";
          break;
      }

      qWithoutBlank = qCopy.replace("BLANK" + (i +  1), blankField);
      qCopy = qWithoutBlank;
      qCopy += altResponse;
    }

    cont += qCopy;
  }
  else {

    cont += "<strong>You selected:</strong><ul>"

    if(ca.length == 0){
      cont += "<li>None</li>"
    } else {
      for (var i = ca.length - 1; i >= 0; i--) {
        if( aa[ca[i]].feedBack == void 0 || aa[ca[i]].feedBack == "none" || aa[ca[i]].feedBack == null )
        {
          cont += "<li>"+aa[ca[i]].answerText+"</li>"
        } else {
          cont += "<li>"+aa[ca[i]].answerText+"<br><strong>"+aa[ca[i]].feedBack+"</strong></li>"
        }
      }
    }
  }
  cont += "</ul>"

  ILQ_miniReportContent.innerHTML = cont
  ILQ_miniReport.appendChild(ILQ_miniReportContent)
  return ILQ_miniReport;
}

/**
 * Function: BuildResponceText
 *
 * Builds the response to the answered question.
 *
 * Parameters:
 *
 *   containerRef  - HTML DOM Element.
 *   questionIndex - Integer
 *
 */
InlineQuizApp.BuildResponceText = function(containerRef, questionIndex) {
    var ILQ_RecapResponceText = document.createElement("p");
    ILQ_RecapResponceText.setAttribute('class', 'ILQ_RecapResponceText');

    var RespImg = document.createElement("img");
    RespImg.setAttribute('class', "ILQ_RecapResponceGraphic");
    var RespCntx = document.createElement("strong");


    qScore = InlineQuizApp.getQuestionScore(questionIndex)
    maxScore = InlineQuizApp.QuizData.Questions[questionIndex].maxScoreValue

    if(!InlineQuizApp.QuizData.General.allowPartial && qScore < maxScore){
      qScore = 0
    }

    if(qScore >= maxScore){
      ILQ_RecapResponceText.setAttribute('style', 'color:green;');
      RespImg.setAttribute('src', '../img/Right_16.png');
      RespImg.setAttribute('alt', "Right Answer");
      RespCntx.innerHTML = "Your answer was correct. You scored "+ qScore +" of a possible "+ maxScore + " on this question."
    } else if(qScore == 0) {
      RespImg.setAttribute('src', '../img/Wrong_16.png');
      RespImg.setAttribute('alt', "Wrong Answer");
        if (InlineQuizApp.QuizData.General.forceCorrect == true){
          RespCntx.innerHTML = "Your answer was not correct. You scored "+ qScore +" of a possible "+ maxScore + " on this question. Please try again.";
      $("div#ILQ_quizNextBtn").html("<span class='ILQ_BaseButtonLable'><span class='ILQ_AccessOnly'>Disabled button: </span>Recheck Answer</span>"); 
        }
       else {
        RespCntx.innerHTML = "Your answer was not correct. You scored "+ qScore +" of a possible "+ maxScore + " on this question.";
       }
    } else if(InlineQuizApp.QuizData.General.allowPartial) {
      ILQ_RecapResponceText.setAttribute('style', 'color:#1E242B;');
      RespImg.setAttribute('src', '../img/partial.png');
      RespImg.setAttribute('alt', "Partially Correct Answer");
    if (InlineQuizApp.QuizData.General.forceCorrect == true){
          RespCntx.innerHTML = "Your answer was partially correct. You scored "+ qScore +" of a possible "+ maxScore + " on this question. Please try again.";
      $("div#ILQ_quizNextBtn").html("<span class='ILQ_BaseButtonLable'><span class='ILQ_AccessOnly'>Disabled button: </span>Recheck Answer</span>");
        }
        else {
        RespCntx.innerHTML = "Your answer was partially correct. You scored "+ qScore +" of a possible "+ maxScore + " on this question. Please try again.";
       }
    }

    ILQ_RecapResponceText.appendChild(RespImg);
    ILQ_RecapResponceText.appendChild(RespCntx);

    containerRef.appendChild(ILQ_RecapResponceText)
}

/**
 * Function: DefineContainer
 *
 * Sets the container to house the quiz.
 *
 */
InlineQuizApp.DefineContainer = function() {

  //InlineQuizApp.containerRef.onselectstart = function() { return false; }
  //InlineQuizApp.containerRef.onmousedown = function() { return false; }

  var ILQ_continer = document.createElement("div");

  ILQ_continer.id = "ILQ_continer";
  ILQ_continer.setAttribute("role", "InlineQuizApplication");
  if(!InlineQuizApp.QuizData.General.hideTitle)
  {
    var ILQ_header = document.createElement("div");
    ILQ_header.id = "ILQ_header";
    ILQ_header.setAttribute("role", "title");
    ILQ_header.setAttribute("class", "col-sm-12");
    ILQ_header.innerHTML = "<h1>"+InlineQuizApp.QuizData.General.QuizName+"</h1>";
    ILQ_continer.appendChild(ILQ_header);
  }

  InlineQuizApp.contentRef = document.createElement("div");
  InlineQuizApp.contentRef.setAttribute("aria-atomic", "true");
  InlineQuizApp.contentRef.setAttribute("aria-live", "assertive");
  InlineQuizApp.contentRef.setAttribute("aria-relevant", "all")
  InlineQuizApp.contentRef.id = "ILQ_content";

  ILQ_continer.appendChild(InlineQuizApp.contentRef);

  InlineQuizApp.containerRef.appendChild(ILQ_continer);
}

/**
 * Function: MakeFullBaseButton
 *
 * Makes a button that spans the entire quiz container based on the passed parameters.
 *
 * Parameters:
 *
 *   onOK    - Function
 *   lable   - String
 *   options - Object
 *
 * Returns:
 *
 *   A full base button.
 */
InlineQuizApp.MakeFullBaseButton = function(onOK, lable, options){
  if(options == void 0){
    options = {}
  }
  var ILQ_FullBaseButtonContainer = document.createElement("div");
  if(options.id){
    ILQ_FullBaseButtonContainer.setAttribute('id', options.id);
  }
  ILQ_FullBaseButtonContainer.setAttribute('class', 'ILQ_BaseButtonContainer FullButton');
  ILQ_FullBaseButtonContainer.setAttribute('tabindex', InlineQuizApp.tabIndexSet);
  InlineQuizApp.tabIndexSet++

  if(!options.disabled){
    ILQ_FullBaseButtonContainer.setAttribute("role", "button");
    ILQ_FullBaseButtonContainer.onclick = onOK
    ILQ_FullBaseButtonContainer.onkeypress = function(e){
      if(e.keyCode == 13 || e.keyCode == 35){
        onOK()
      }
    }
    ILQ_FullBaseButtonContainer.onmouseover = function(e){
      $(this).addClass("over")
    }
    ILQ_FullBaseButtonContainer.onfocus = function(e){
      $(this).addClass("over")
    }
    ILQ_FullBaseButtonContainer.onmouseout = function(e){
      $(this).removeClass("over");
    }
    ILQ_FullBaseButtonContainer.onblur = function(e){
      $(this).removeClass("over")
    }

  } else {
    ILQ_FullBaseButtonContainer.setAttribute("role", "disabled");
    $(ILQ_FullBaseButtonContainer).addClass("ILQ_BaseButtonDisabled")

  }

  ILQ_FullBaseButtonContainer.onselectstart = function() { return false; }

  var ILQ_BaseButtonLable = document.createElement("span");
  ILQ_BaseButtonLable.setAttribute('class', 'ILQ_BaseButtonLable');
  ILQ_BaseButtonLable.innerHTML = "<span class='ILQ_AccessOnly'>Disabled button: </span>" + lable;
  if(!options.disabled){
    $(ILQ_BaseButtonLable.firstChild).css("display", "none")
    $(ILQ_BaseButtonLable.firstChild).attr("aria-hidden", "true")
  }
  ILQ_FullBaseButtonContainer.appendChild(ILQ_BaseButtonLable);

  return ILQ_FullBaseButtonContainer
}

/**
 * Function: MakeBaseButtonSet
 *
 * Makes a left and a right button that span the entire quiz container based on the passed parameters.
 *
 * Parameters:
 *
 *   leftBtnData     - Object (Function, String, Object).
 *   RightButtonData - Object (Function, String, Object).
 *
 * Returns:
 *
 *   A left and right base button.
 */
InlineQuizApp.MakeBaseButtonSet = function(leftBtnData, RightButtonData){
  var ILQ_BaseButtonContainer = document.createElement("div");

  if(leftBtnData != null)
  {
    if(leftBtnData.options == void 0)
    {
      leftBtnData.options = {}
    }
    var ILQ_LeftBaseButtonContainer = document.createElement("div");
    ILQ_LeftBaseButtonContainer.setAttribute('tabindex', InlineQuizApp.tabIndexSet);
    InlineQuizApp.tabIndexSet++
    if(leftBtnData.options.id){
      ILQ_LeftBaseButtonContainer.setAttribute('id', leftBtnData.options.id);
    }
    ILQ_LeftBaseButtonContainer.setAttribute('class', 'ILQ_BaseButtonContainer LeftHalfButton');
    ILQ_LeftBaseButtonContainer.setAttribute("role", "button");
    if(!leftBtnData.options.disabled){
      ILQ_LeftBaseButtonContainer.onclick = leftBtnData.onOK
      ILQ_LeftBaseButtonContainer.onmouseover = function(e){
        $(this).addClass("over")
      }
      ILQ_LeftBaseButtonContainer.onmouseout = function(e){
        $(this).removeClass("over");
      }
      ILQ_LeftBaseButtonContainer.onkeypress = function(e){
        if(e.keyCode == 13 || e.keyCode == 35){
          leftBtnData.onOK(e)
        }
      }
      ILQ_LeftBaseButtonContainer.onfocus = function(e){
        $(this).addClass("over")
      }
      ILQ_LeftBaseButtonContainer.onblur = function(e){
        $(this).removeClass("over")
      }
    } else {
      $(ILQ_LeftBaseButtonContainer).addClass("ILQ_BaseButtonDisabled")
      $(ILQ_LeftBaseButtonContainer).attr("role", "disabled");
    }

    ILQ_LeftBaseButtonContainer.onselectstart = function() { return false; }

    var ILQ_BaseButtonLable = document.createElement("span");
    ILQ_BaseButtonLable.setAttribute('class', 'ILQ_BaseButtonLable');
    ILQ_BaseButtonLable.innerHTML = "<span class='ILQ_AccessOnly'>Disabled button: </span>" + leftBtnData.label;
    if(!leftBtnData.options.disabled){
      $(ILQ_BaseButtonLable.firstChild).css("display", "none")
      $(ILQ_BaseButtonLable.firstChild).attr("aria-hidden", "true")
    }
    ILQ_LeftBaseButtonContainer.appendChild(ILQ_BaseButtonLable);
    ILQ_BaseButtonContainer.appendChild(ILQ_LeftBaseButtonContainer);
  } else {
    var ILQ_LeftBaseButtonContainer = document.createElement("div");
    ILQ_LeftBaseButtonContainer.setAttribute('class', 'ILQ_BaseButtonContainer LeftHalfButton hidden');
    ILQ_BaseButtonContainer.appendChild(ILQ_LeftBaseButtonContainer);
  }

  if(RightButtonData != null)
  {
    if(RightButtonData.options == void 0)
    {
      RightButtonData.options = {}
    }
    var ILQ_RightBaseButtonContainer = document.createElement("div");
    ILQ_RightBaseButtonContainer.setAttribute('tabindex', InlineQuizApp.tabIndexSet);
    InlineQuizApp.tabIndexSet++
    ILQ_RightBaseButtonContainer.setAttribute("role", "button");
    if(RightButtonData.options.id){
      ILQ_RightBaseButtonContainer.setAttribute('id', RightButtonData.options.id);
    }

    ILQ_RightBaseButtonContainer.setAttribute('class', 'ILQ_BaseButtonContainer RightHalfButton');
    if(!RightButtonData.options.disabled){
      ILQ_RightBaseButtonContainer.onclick = RightButtonData.onOK

      ILQ_RightBaseButtonContainer.onmouseover = function(e){
        $(this).addClass("over")
      }
      ILQ_RightBaseButtonContainer.onmouseout = function(e){
        $(this).removeClass("over");
      }
      ILQ_RightBaseButtonContainer.onkeypress = function(e){
        if(e.keyCode == 13 || e.keyCode == 35){
          RightButtonData.onOK(e)
        }
      }
      ILQ_RightBaseButtonContainer.onfocus = function(e){
        $(this).addClass("over")
      }
      ILQ_RightBaseButtonContainer.onblur = function(e){
        $(this).removeClass("over")
      }
    } else {
      $(ILQ_RightBaseButtonContainer).addClass("ILQ_BaseButtonDisabled")
      $(ILQ_RightBaseButtonContainer).attr("role", "disabled");
    }
    ILQ_RightBaseButtonContainer.onselectstart = function() { return false; }
    var ILQ_BaseButtonLable = document.createElement("span");
    ILQ_BaseButtonLable.setAttribute('class', 'ILQ_BaseButtonLable');
    ILQ_BaseButtonLable.innerHTML = "<span class='ILQ_AccessOnly'>Disabled button: </span>" + RightButtonData.label;
    if(!RightButtonData.options.disabled){
      $(ILQ_BaseButtonLable.firstChild).css("display", "none")
      $(ILQ_BaseButtonLable.firstChild).attr("aria-hidden", "true")
    }
    ILQ_RightBaseButtonContainer.appendChild(ILQ_BaseButtonLable);
    ILQ_BaseButtonContainer.appendChild(ILQ_RightBaseButtonContainer);
  } else {
    var ILQ_RightBaseButtonContainer = document.createElement("div");
    ILQ_RightBaseButtonContainer.setAttribute('class', 'ILQ_BaseButtonContainer RightHalfButton hidden');
    ILQ_BaseButtonContainer.appendChild(ILQ_RightBaseButtonContainer);
  }

  return ILQ_BaseButtonContainer
}

/**
 * Function: MakeGenericButton
 *
 * Makes a generic button based on the parameters.
 *
 * Parameters:
 *
 *   onOK    - Function.
 *   lable   - String.
 *   options - Object.
 *
 * Returns:
 *
 *   A generic button.
 */
InlineQuizApp.MakeGenericButton = function(onOK, lable, options){ // next button
  if(options == void 0){
    options = {}
  }
  var ILQ_GenericButtonContainer = document.createElement("div");
  if(options.id){
    ILQ_GenericButtonContainer.setAttribute('id', options.id);
  }
  ILQ_GenericButtonContainer.setAttribute('class', 'ILQ_GenericButtonContainer Generic');
  ILQ_GenericButtonContainer.setAttribute('tabindex', InlineQuizApp.tabIndexSet);
  InlineQuizApp.tabIndexSet++
  ILQ_GenericButtonContainer.setAttribute("role", "button");
  if(!options.disabled){

    ILQ_GenericButtonContainer.onclick = onOK
    ILQ_GenericButtonContainer.onmouseover = function(e){
      $(this).addClass("over")
    }
    ILQ_GenericButtonContainer.onmouseout = function(e){
      $(this).removeClass("over");
    }
    ILQ_GenericButtonContainer.onkeypress = function(e){
      if(e.keyCode == 13 || e.keyCode == 35){
        onOK(e)
      }
    }
    ILQ_GenericButtonContainer.onfocus = function(e){
      $(this).addClass("over")
    }
    ILQ_GenericButtonContainer.onblur = function(e){
      $(this).removeClass("over")
    }
  } else {
    $(ILQ_GenericButtonContainer).addClass("ILQ_GenericButtonDisabled")
  }

  ILQ_GenericButtonContainer.onselectstart = function() { return false; }

  var ILQ_GenericLable = document.createElement("span");
  ILQ_GenericLable.setAttribute('class', 'ILQ_GenericLable');
  ILQ_GenericLable.innerHTML = "<span class='ILQ_AccessOnly'>Disabled button: </span>" + lable;
    if(!options.disabled){
      $(ILQ_GenericLable.firstChild).css("display", "none")
      $(ILQ_GenericLable.firstChild).attr("aria-hidden", "true")
    }
  ILQ_GenericButtonContainer.appendChild(ILQ_GenericLable);

  return ILQ_GenericButtonContainer
}

/**
 * Function: EmbedMedia
 *
 * Takes the passed object and embeds it based on it's file type.
 *
 * Parameters:
 *
 *   containerRef - HTML DOM Element.
 *   mediaData    - Object.
 *
 */
InlineQuizApp.EmbedMedia = function(containerRef, mediaData) {
    var mediaDomObj = document.createElement("div");
    mediaDomObj.setAttribute('class', 'ILQ_Media')

    if(mediaData.mediaLink == void 0 || mediaData.mediaLink == null){
      mediaData.mediaLink = "none"
    }

    if(mediaData.width == void 0 || mediaData.width == null){
      mediaData.width = "none"
    } else if(mediaData.width.constructor == String) {
      mediaData.width = parseInt(mediaData.width)
    }

    if(mediaData.height == void 0 || mediaData.height == null){
      mediaData.height = "none"
    } else if(mediaData.height.constructor == String) {
      mediaData.height = parseInt(mediaData.height)
    }


    switch(mediaData.type) {
      case "link":
          var mediaDomContent = document.createElement("a");
          mediaDomContent.setAttribute('class', 'ILQ_MediaLink');
          mediaDomContent.setAttribute('href', mediaData.src);
          mediaDomContent.setAttribute('target', "_blank");
          mediaDomContent.setAttribute('tabindex', InlineQuizApp.tabIndexSet);
          InlineQuizApp.tabIndexSet++
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
            mediaDomLink.setAttribute('class', 'ILQ_MediaImage');
            mediaDomLink.setAttribute('href', mediaData.mediaLink);
            mediaDomLink.setAttribute('tabindex', InlineQuizApp.tabIndexSet);
            InlineQuizApp.tabIndexSet++
            mediaDomLink.setAttribute('target', "_blank");
          }

          var mediaDomContent = document.createElement("img");

          if(mediaData.mediaLink  == "none"){
            mediaDomContent.setAttribute('class', 'ILQ_MediaImage');
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
          vaildSrc = InlineQuizApp.validateYouTubeLink(mediaData.src)
          if(vaildSrc){
            var mediaDomContent = document.createElement("iframe");
            mediaDomContent.setAttribute('class', 'ILQ_MediaEmbeddedVideo');

            if(mediaData.width != "none"){
              mediaDomContent.setAttribute('width', mediaData.width);
            } else {
              mediaDomContent.setAttribute('width', '420');
            }

            if(mediaData.height != "none"){
              mediaDomContent.setAttribute('height', mediaData.height);
            } else {
              mediaDomContent.setAttribute('height', '315');
            }

            mediaDomContent.setAttribute('frameborder', '0');
            mediaDomContent.setAttribute('allowfullscreen', 'true');

            mediaDomContent.setAttribute('src', vaildSrc);
            mediaDomObj.setAttribute('style', 'text-align:center;');

            if(mediaData.description)
            {
              mediaDomContent.setAttribute('alt', mediaData.description)
            }

            mediaDomObj.appendChild(mediaDomContent)
          }
          break;
      default:
          InlineQuizApp.cLog("unKnown media type requested, ignoring embed request.");
    }
    containerRef.appendChild(mediaDomObj)
}

/**
 * Function: validateYouTubeLink
 *
 * Takes the passed object property and checks to see if it is a valid YouTube link.
 *
 * Parameters:
 *
 *   src - Object Property (String).
 *
 * Returns:
 *
 *   Either the valid link or a message to the console log.
 */
InlineQuizApp.validateYouTubeLink = function(src){
  if(src.indexOf("www.youtube.com") !== -1){
    if(src.indexOf("</iframe>") == -1){
      if(src.indexOf("watch?v=") != -1){
        code = src.slice(src.indexOf("?v=")+3)
        return "https://www.youtube.com/embed/"+code
      } else {
        InlineQuizApp.cLog("provided link was not proper YouTubeVideo link")
        return false
      }
    } else {
      // they grabbed the embed code probably
      if(src.indexOf("https://www.youtube.com/embed/") !== -1){
        return link.slice(link.indexOf("src")+5, link.indexOf("\"", link.indexOf("src")+5))
      } else {
        InlineQuizApp.cLog("provided link was not proper YouTubeVideo link")
        return false
      }
    }
  } else {
    InlineQuizApp.cLog("provided link was not a YouTubeVideo link")
    return false
  }
}

/**
 * Function: SetTextSlide
 *
 * Builds a text slide for the quiz.
 *
 * Parameters:
 *
 *   data    - Object Property (String).
 *   onOK    - Function.
 *   options - Object.
 *
 */
InlineQuizApp.SetTextSlide = function(data, onOK, options){
  InlineQuizApp.tabIndexSet = 1
  if(options == void 0){
    options = {}
  }

  if(options.buttonLable == void 0 || options.buttonLable.constructor != String)
  {
    options.buttonLable = "Continue";
  }

  InlineQuizApp.contentRef.innerHTML = '';

  var ILQ_Description = document.createElement("div");
  ILQ_Description.setAttribute('class', 'ILQ_Description');
  if(options.addClass != void 0 && options.addClass != null &&  options.addClass != "none"){
    ILQ_Description.setAttribute('class', 'ILQ_Description ' + options.addClass);
  } else {
    ILQ_Description.setAttribute('class', 'ILQ_Description');
  }
  ILQ_Description.innerHTML = data;

  if(options.mediaData){

    var ILQ_MediaContainer = document.createElement("div");
    ILQ_MediaContainer.setAttribute('class', 'ILQ_MediaContainer');

    for (var i = 0; i < options.mediaData.length; i++) {
      InlineQuizApp.EmbedMedia(ILQ_MediaContainer, options.mediaData[i])
    };

    ILQ_Description.appendChild(ILQ_MediaContainer);

  }

  InlineQuizApp.contentRef.appendChild(ILQ_Description);
  if(onOK !== void 0 && onOK !== "none"){
    InlineQuizApp.contentRef.appendChild(InlineQuizApp.MakeFullBaseButton(onOK, options.buttonLable));
  } else {
    ILQ_Description.setAttribute('style', "border-radius:7px");
  }
}

/**
 * Function: setQuestionSlide
 *
 * Builds a question slide for the quiz.
 *
 * Parameters:
 *
 *   data    - Object.
 *   options - Object.
 *
 */
InlineQuizApp.setQuestionSlide = function(data, options){

  InlineQuizApp.tabIndexSet = 1
  if(options == void 0){
    options = {}
  }

  if(options.buttonLable == void 0 || options.buttonLable.constructor != String)
  {
    if(InlineQuizApp.QuizData.General.feedBackType =="continuous"){
      options.buttonLable = "Check Answer";
    } else {
      options.buttonLable = "Continue";
    }
  }

  InlineQuizApp.contentRef.innerHTML = '';


  var ILQ_questionHeader = document.createElement("div");

  if(!InlineQuizApp.QuizData.General.hideTitle)
  {
    ILQ_questionHeader.setAttribute('class', 'ILQ_questionHeader');
  } else {
    ILQ_questionHeader.setAttribute('class', 'ILQ_questionHeader ILQ_CompressedHeader');
  }
  qt = InlineQuizApp.QuizData.Questions[InlineQuizApp.currentQuestion].questionTitle
  if(qt)
  {
    ILQ_questionHeader.innerHTML = qt
  } else {
    ILQ_questionHeader.innerHTML = "Question "+(InlineQuizApp.currentQuestion+1)+": "
  }

  InlineQuizApp.contentRef.appendChild(ILQ_questionHeader);

  var ILQ_questionText = document.createElement("p");
  ILQ_questionText.setAttribute('class', 'ILQ_questionText');

  if (data.questionType == "Fill In The Blank"){
    InlineQuizApp.inputText = [];

    InlineQuizApp.textInterval = setInterval(InlineQuizApp.HandleTextInput, 1000)

    qCopy = data.questionText;
    for (var i = 1; i <= data.answers.length; i++){
      blankField = "<input type='text' placeholder='BLANK' data-autosize-input='{ &quot;space&quot;: 5 }' class='blank' id='blank" + i + "' tabindex='" + InlineQuizApp.tabIndexSet + "' spellcheck='true' autocorrect='on' />";
      qWithoutBlank = qCopy.replace("BLANK" + i, blankField);
      ILQ_questionText.innerHTML = qWithoutBlank;
      qCopy = qWithoutBlank;
      InlineQuizApp.tabIndexSet++;
    }
  }
  else if (data.questionType == "Math"){
    InlineQuizApp.inputText = [];

    InlineQuizApp.textInterval = setInterval(InlineQuizApp.HandleTextInput, 1000)

    qCopy = data.questionText;
    for (var i = 1; i <= data.answers.length; i++){
      blankField = "<input type='text' placeholder='#' data-autosize-input='{ &quot;space&quot;: 5 }' class='number' id='number" + i + "' tabindex='" + InlineQuizApp.tabIndexSet + "' spellcheck='true' autocorrect='on' />";
      qWithoutBlank = qCopy.replace("BLANK" + i, blankField);
      ILQ_questionText.innerHTML = qWithoutBlank;
      qCopy = qWithoutBlank;
      InlineQuizApp.tabIndexSet++;
    }
  }
  else {
    ILQ_questionText.innerHTML = data.questionText;
  }

  InlineQuizApp.contentRef.appendChild(ILQ_questionText);

  if(InlineQuizApp.QuizData.General.showHints && data.hintText != "none"){
    hintBtn = InlineQuizApp.MakeGenericButton(InlineQuizApp.ShowHint, "Hint", {
      id: "ILQ_HintButton"
    })
    InlineQuizApp.contentRef.appendChild(hintBtn)
  }


  var clearDiv = document.createElement("div");
  clearDiv.setAttribute('style', 'clear:both;');
  InlineQuizApp.contentRef.appendChild(clearDiv)


  var ILQ_quizFeild = document.createElement("div");
  ILQ_quizFeild.setAttribute('class', 'ILQ_quizFeild');
  if(data.questionType == "Multiple Choice" || data.questionType == "All That Apply") {
    ILQ_quizFeild.setAttribute("role", "radiogroup")

  }
  else {
    ILQ_quizFeild.setAttribute("role", "textbox")
  }


  if (data.questionType != "Fill In The Blank" && data.questionType != "Math") {
    for (var i = 0; i < data.answers.length; i++) {
      //data.answers[i]
      var slot = document.createElement("div");
      slot.id = "AnswerSlot_" + i ;
      slot.setAttribute("class", "ILQ_AnswerSlot")

      slot.setAttribute('tabindex', InlineQuizApp.tabIndexSet);
      InlineQuizApp.tabIndexSet++
      if(data.questionType == "Multiple Choice") {
        slot.setAttribute("role", "radio")
      }
      else {
        slot.setAttribute('role', 'checkbox');
      }

      slot.setAttribute('aria-checked', 'false');
      slot.onclick = InlineQuizApp.HandleAnswerSelection
      slot.onmouseover = function(e){
        $(this).addClass("over")
      }
      slot.onmouseout = function(e){
        $(this).removeClass("over");
        $(this).removeClass("down")
      }
      slot.onmousedown = function(e){
        $(this).addClass("down")
        $(this).removeClass("over");
      }
      slot.onmouseup = function(e){
        $(this).addClass("over");
        $(this).removeClass("down")
      }
      slot.onkeypress = function(e){
        if(e.keyCode == 13 || e.keyCode == 35){
          InlineQuizApp.HandleAnswerSelection(e)
        }
      }
      slot.onfocus = function(e){
        $(this).addClass("over")
      }
      slot.onblur = function(e){
        $(this).removeClass("over")
      }

      slot.onselectstart = function() { return false; }

      var impCont = document.createElement("div");
      if(data.questionType == "Multiple Choice") {
        impCont.setAttribute("class", "ILQ_impCont radio")
      }
      else if(data.questionType == "All That Apply"){
        impCont.setAttribute('class', 'ILQ_impCont check');
      }
      var idVal = "ILQ-"+InlineQuizApp.numericalQuizID+"_q"+InlineQuizApp.currentQuestion+"_a"+i


      slot.appendChild(impCont);

      var label = document.createElement("div");
      label.setAttribute("class", "ILQ_answerLable")
      label.innerHTML = "<span class='ILQ_AccessOnly'>Disabled Answer Slot: </span>" + data.answers[i].answerText
      $(label.firstChild).css("display", "none")
      $(label.firstChild).attr("aria-hidden", "true")
      slot.appendChild(label);

      ILQ_quizFeild.appendChild(slot);
    }
  };

  InlineQuizApp.contentRef.appendChild(ILQ_quizFeild);

  if(InlineQuizApp.QuizData.General.allowPrevious){
      leftBtnData = {
        onOK: InlineQuizApp.goPreviousQuestion,
        label: "Go Back",
        options: {
          disabled:(InlineQuizApp.currentQuestion != 1 && InlineQuizApp.QuizData.General.preQuizText == "none")
        }
      }

    InlineQuizApp.contentRef.appendChild( InlineQuizApp.MakeBaseButtonSet(leftBtnData, {
        onOK: InlineQuizApp.RequestNextQuestion,
        label: options.buttonLable,
        options: {
          disabled: !InlineQuizApp.QuizData.General.allowNone,
          id:"ILQ_quizNextBtn"
        }
    })
    )

  } else {
    InlineQuizApp.contentRef.appendChild(InlineQuizApp.MakeFullBaseButton(InlineQuizApp.RequestNextQuestion, options.buttonLable, {
      disabled:!InlineQuizApp.QuizData.General.allowNone,
      id:"ILQ_quizNextBtn"
    }));
  }

   InlineQuizApp.HandleWindowAdjust()
}

/**
 * Function: ShowHint
 *
 * Displays hint on a new slide if one is provided for the question.
 *
 */
InlineQuizApp.ShowHint = function() {
    clearInterval(InlineQuizApp.textInterval);

    InlineQuizApp.SetTextSlide(InlineQuizApp.QuizData.Questions[InlineQuizApp.currentQuestion].hintText, function(){
      InlineQuizApp.GoNextQuestion()
    }, {
      mediaData: InlineQuizApp.QuizData.Questions[InlineQuizApp.currentQuestion].hintMedia,
      buttonLable: "Back to the Question"
    })
}

/**
 * Function: HandleAnswerSelection
 *
 * Handles the event when an answer is selected.
 *
 * Parameters:
 *
 *   e - Event Object.
 */
InlineQuizApp.HandleAnswerSelection = function(e) {
  selectedSlot = e.target

  if (selectedSlot.className.indexOf("ILQ_AnswerSlot") == -1 ){ // in case we click the label somehow
    selectedSlot = selectedSlot.parentElement
  }
  impContainer = selectedSlot.firstChild

  if(InlineQuizApp.HasClass(impContainer, "check"))
  {
    if(InlineQuizApp.HasClass(impContainer, "selected")){
      $(impContainer).removeClass("selected")
      $(impContainer)[0].parentElement.setAttribute('aria-checked', 'false');
    } else {
      $(impContainer).addClass("selected")
      $(impContainer)[0].parentElement.setAttribute('aria-checked', 'true');
    }
  } else {
    if(!InlineQuizApp.HasClass(impContainer, "selected")){
      if($(".selected").length != 0){
        $(".selected").parent().attr('aria-checked', 'false');
        $(".selected").removeClass("selected")
      }
      $(impContainer).addClass("selected")
      $(impContainer)[0].parentElement.setAttribute('aria-checked', 'true');
    }
  }
  InlineQuizApp.QuizData.Questions[InlineQuizApp.currentQuestion].ChoosenAnswers = []
  $(".selected").each(function(e){
    idx = parseInt( $(".selected")[e].parentElement.id.replace("AnswerSlot_",0) )
    InlineQuizApp.QuizData.Questions[InlineQuizApp.currentQuestion].ChoosenAnswers.push(idx)
  })

  if(!InlineQuizApp.QuizData.General.allowNone){
    if (InlineQuizApp.QuizData.Questions[InlineQuizApp.currentQuestion].questionType == "All That Apply"){
      if(InlineQuizApp.QuizData.Questions[InlineQuizApp.currentQuestion].ChoosenAnswers.length <= 1){
        $("#ILQ_quizNextBtn").addClass("ILQ_BaseButtonDisabled")
        $("#ILQ_quizNextBtn").attr("role", "disabled");
        $("#ILQ_quizNextBtn .ILQ_AccessOnly").css("display", "inline")
        $("#ILQ_quizNextBtn .ILQ_AccessOnly").attr("aria-hidden", "false")
        $("#ILQ_quizNextBtn")[0].onclick = void 0
        $("#ILQ_quizNextBtn")[0].onmouseover = void 0
        $("#ILQ_quizNextBtn")[0].onmouseout = void 0
        $("#ILQ_quizNextBtn")[0].onfocus = void 0
        $("#ILQ_quizNextBtn")[0].onblur = void 0
        $("#ILQ_quizNextBtn")[0].onkeypress = void 0
      }
      else {
        $("#ILQ_quizNextBtn").removeClass("ILQ_BaseButtonDisabled")
        $("#ILQ_quizNextBtn").attr("role", "button");
        $("#ILQ_quizNextBtn .ILQ_AccessOnly").css("display", "none")
        $("#ILQ_quizNextBtn .ILQ_AccessOnly").attr("aria-hidden", "true")
        $("#ILQ_quizNextBtn")[0].onclick = InlineQuizApp.RequestNextQuestion;
        $("#ILQ_quizNextBtn")[0].onmouseover = function(e){
          $(this).addClass("over")
        }
        $("#ILQ_quizNextBtn")[0].onmouseout = function(e){
          $(this).removeClass("over");
        }
        $("#ILQ_quizNextBtn")[0].onfocus = function(e){
          $(this).addClass("over")
        }
        $("#ILQ_quizNextBtn")[0].onblur = function(e){
          $(this).removeClass("over");
        }
        $("#ILQ_quizNextBtn")[0].onkeypress = function(e){
          if(e.keyCode == 13 || e.keyCode == 35){
            InlineQuizApp.RequestNextQuestion(e)
          }
        }
      }
    }
    else if (InlineQuizApp.QuizData.Questions[InlineQuizApp.currentQuestion].questionType == "Multiple Choice"){
      if(InlineQuizApp.QuizData.Questions[InlineQuizApp.currentQuestion].ChoosenAnswers.length == 0){
        $("#ILQ_quizNextBtn").addClass("ILQ_BaseButtonDisabled")
        $("#ILQ_quizNextBtn").attr("role", "disabled");
        $("#ILQ_quizNextBtn .ILQ_AccessOnly").css("display", "inline")
        $("#ILQ_quizNextBtn .ILQ_AccessOnly").attr("aria-hidden", "false")
        $("#ILQ_quizNextBtn")[0].onclick = void 0
        $("#ILQ_quizNextBtn")[0].onmouseover = void 0
        $("#ILQ_quizNextBtn")[0].onmouseout = void 0
        $("#ILQ_quizNextBtn")[0].onfocus = void 0
        $("#ILQ_quizNextBtn")[0].onblur = void 0
        $("#ILQ_quizNextBtn")[0].onkeypress = void 0
      }
      else {
        $("#ILQ_quizNextBtn").removeClass("ILQ_BaseButtonDisabled")
        $("#ILQ_quizNextBtn").attr("role", "button");
        $("#ILQ_quizNextBtn .ILQ_AccessOnly").css("display", "none")
        $("#ILQ_quizNextBtn .ILQ_AccessOnly").attr("aria-hidden", "true")
        $("#ILQ_quizNextBtn")[0].onclick = InlineQuizApp.RequestNextQuestion;
        $("#ILQ_quizNextBtn")[0].onmouseover = function(e){
          $(this).addClass("over")
        }
        $("#ILQ_quizNextBtn")[0].onmouseout = function(e){
          $(this).removeClass("over");
        }
        $("#ILQ_quizNextBtn")[0].onfocus = function(e){
          $(this).addClass("over")
        }
        $("#ILQ_quizNextBtn")[0].onblur = function(e){
          $(this).removeClass("over");
        }
        $("#ILQ_quizNextBtn")[0].onkeypress = function(e){
          if(e.keyCode == 13 || e.keyCode == 35){
            InlineQuizApp.RequestNextQuestion(e)
          }
        }
      }
    }
  }
}

/**
 * Function: HandleTextInput
 *
 * Handles when a text input has text entered into it so it enables the check answer button.
 *
 */
InlineQuizApp.HandleTextInput = function(){

  blankCount = 0;

  if(InlineQuizApp.QuizData.Questions[InlineQuizApp.currentQuestion].questionType == "Fill In The Blank"){
    for (var i = 1; i <= InlineQuizApp.QuizData.Questions[InlineQuizApp.currentQuestion].answers.length; i++){
      $("input").autosizeInput();
      blankText = document.getElementById('blank' + i).value;
      if (blankText != ""){
        blankCount++;
      }
    }
  }
  else if(InlineQuizApp.QuizData.Questions[InlineQuizApp.currentQuestion].questionType == "Math"){
    $("input").keydown(function (e) {
      // Allow: backspace, delete, tab, escape, enter and .
      if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 40, 45, 61, 109, 110, 173, 189, 190]) !== -1 ||
           // Allow: Ctrl+A
          (e.keyCode == 65 && e.ctrlKey === true) ||
           // Allow: Ctrl+C
          (e.keyCode == 67 && e.ctrlKey === true) ||
           // Allow: Ctrl+X
          (e.keyCode == 88 && e.ctrlKey === true) ||
           // Allow: home, end, left, right
          (e.keyCode >= 35 && e.keyCode <= 39)) {
            // let it happen, don't do anything
            return;
      }
      // Ensure that it is a number and stop the keypress
      if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
          e.preventDefault();
      }
    });

    for (var i = 1; i <= InlineQuizApp.QuizData.Questions[InlineQuizApp.currentQuestion].answers.length; i++){
      $("input").autosizeInput();
      blankText = document.getElementById('number' + i).value;

      if (blankText != ""){
        blankCount++;
      }
    }
  }

  if (blankCount == InlineQuizApp.QuizData.Questions[InlineQuizApp.currentQuestion].answers.length){
    if(!InlineQuizApp.QuizData.General.allowNone){
      $("#ILQ_quizNextBtn").removeClass("ILQ_BaseButtonDisabled")
      $("#ILQ_quizNextBtn").attr("role", "button");
      $("#ILQ_quizNextBtn .ILQ_AccessOnly").css("display", "none")
      $("#ILQ_quizNextBtn .ILQ_AccessOnly").attr("aria-hidden", "true")
      $("#ILQ_quizNextBtn")[0].onclick = InlineQuizApp.RequestNextQuestion;
      $("#ILQ_quizNextBtn")[0].onmouseover = function(e){
        $(this).addClass("over")
      }
      $("#ILQ_quizNextBtn")[0].onmouseout = function(e){
        $(this).removeClass("over");
      }
      $("#ILQ_quizNextBtn")[0].onfocus = function(e){
        $(this).addClass("over")
      }
      $("#ILQ_quizNextBtn")[0].onblur = function(e){
        $(this).removeClass("over");
      }
      $("#ILQ_quizNextBtn")[0].onkeypress = function(e){
        if(e.keyCode == 13 || e.keyCode == 35){
          InlineQuizApp.RequestNextQuestion(e)
        }
      }
    }
  }
  else {
      $("#ILQ_quizNextBtn").addClass("ILQ_BaseButtonDisabled")
      $("#ILQ_quizNextBtn").attr("role", "disabled");
      $("#ILQ_quizNextBtn .ILQ_AccessOnly").css("display", "inline")
      $("#ILQ_quizNextBtn .ILQ_AccessOnly").attr("aria-hidden", "false")
      $("#ILQ_quizNextBtn")[0].onclick = void 0
      $("#ILQ_quizNextBtn")[0].onmouseover = void 0
      $("#ILQ_quizNextBtn")[0].onmouseout = void 0
      $("#ILQ_quizNextBtn")[0].onfocus = void 0
      $("#ILQ_quizNextBtn")[0].onblur = void 0
      $("#ILQ_quizNextBtn")[0].onkeypress = void 0
  }
}

/**
 * Function: getQuestionScore
 *
 * Calculates the score for the passed question number.
 *
 * Parameters:
 *
 *   questionIndex - Integer.
 *
 * Returns:
 *
 *   The calculated score.
 */
InlineQuizApp.getQuestionScore = function(questionIndex) {
  if(questionIndex == void 0)
  {
    questionIndex = InlineQuizApp.currentQuestion
  }

  if(InlineQuizApp.QuizData.Questions[questionIndex].questionType == "Fill In The Blank" || InlineQuizApp.QuizData.Questions[questionIndex].questionType == "Math"){
    score = 0;

    for (var i = 0; i < InlineQuizApp.QuizData.Questions[questionIndex].answers.length; i++){
      if (InlineQuizApp.QuizData.Questions[questionIndex].answers[i].answerText == InlineQuizApp.savedText[questionIndex][i]){
         score += InlineQuizApp.QuizData.Questions[questionIndex].answers[i].scoreValue;
      }
      else if (InlineQuizApp.QuizData.Questions[questionIndex].answers[i].altAnswers){
        for (var j = 0; j < InlineQuizApp.QuizData.Questions[questionIndex].answers[i].altAnswers.length; j++){
          if (InlineQuizApp.QuizData.Questions[questionIndex].answers[i].altAnswers[j].answerText == InlineQuizApp.savedText[questionIndex][i]){
            score += InlineQuizApp.QuizData.Questions[questionIndex].answers[i].scoreValue;
          }
        }
      }
    }


    InlineQuizApp.inputScores.splice(questionIndex, 1, score)
    return score
  }

  else {
    ca = InlineQuizApp.QuizData.Questions[questionIndex].ChoosenAnswers
    aa = InlineQuizApp.QuizData.Questions[questionIndex].answers

    score = 0

    if(ca.length == 0){
      return 0
    }

    for (var i = aa.length - 1; i >= 0; i--) {
     if(aa[i].scoreValue > 0 && $.inArray(i, ca) != -1) { // is correct and user choose it
       score += aa[i].scoreValue;
     }
     else if (aa[i].scoreValue == 0 && $.inArray(i, ca) != -1) { // is not correct and user choose it
       score --;
     }
    };

    if(score < 0) {
      score = 0
    }

    return score
  }
}

/**
 * Function: GetToltalScore
 *
 * Adds each questions score to get a total score.
 *
 * Returns:
 *
 *   The calculated total score.
 */
InlineQuizApp.GetToltalScore = function(){
  score = 0
  for(var i = 0; i < InlineQuizApp.QuizData.Questions.length; i++){
    if (InlineQuizApp.QuizData.Questions[i].questionType == "Fill In The Blank" || InlineQuizApp.QuizData.Questions[i].questionType == "Math"){
      score += InlineQuizApp.inputScores[i];
    }
    else {
      score += InlineQuizApp.getQuestionScore(i)
    }
  }
  return score
}

/**
 * Function: GetMaxScore
 *
 * Adds each questions maximum possible score to get a max score.
 *
 * Returns:
 *
 *   The calculated max score.
 */
InlineQuizApp.GetMaxScore = function(){
  n = 0;

  for (var i = 0; i < InlineQuizApp.QuizData.Questions.length; i++){
    n += InlineQuizApp.QuizData.Questions[i].maxScoreValue;
  }

  return n;
}

/**
 * Function: DisableButtons
 *
 * Disables the buttons' functionality.
 *
 */
InlineQuizApp.DisableButtons = function(){
      $('.ILQ_BaseButtonContainer').addClass("ILQ_BaseButtonDisabled")
      $(".ILQ_BaseButtonContainer").attr("role", "disabled");
      $(".ILQ_BaseButtonContainer .ILQ_AccessOnly").css("display", "inline")
      $(".ILQ_BaseButtonContainer .ILQ_AccessOnly").attr("aria-hidden", "false")
      $(".ILQ_BaseButtonContainer").prop( "onclick", null )
      $(".ILQ_BaseButtonContainer").prop( "onmouseover", null )
      $(".ILQ_BaseButtonContainer").prop( "onmousedown", null )
      $(".ILQ_BaseButtonContainer").prop( "onmouseup", null );
      $('.ILQ_BaseButtonContainer').prop( "onfocus", null );
      $('.ILQ_BaseButtonContainer').prop( "onblur", null );
      $('.ILQ_BaseButtonContainer').prop( "onkeypress", null );

      $('.ILQ_quizFeild').attr( "role", "disabled" );
      $('.ILQ_AnswerSlot').prop( "onclick", null )
      $('.ILQ_AnswerSlot').prop( "onmouseover", null )
      $('.ILQ_AnswerSlot').prop( "onmousedown", null )
      $('.ILQ_AnswerSlot').prop( "onmouseup", null );
      $('.ILQ_AnswerSlot').prop( "onfocus", null );
      $('.ILQ_AnswerSlot').prop( "onblur", null );
      $('.ILQ_AnswerSlot').prop( "onkeypress", null );
      $('.ILQ_AnswerSlot').attr( "role", "disabled" );
      $(".ILQ_AnswerSlot .ILQ_AccessOnly").css("display", "inline")
      $(".ILQ_AnswerSlot .ILQ_AccessOnly").attr("aria-hidden", "false")

      $('#ILQ_HintButton').addClass("ILQ_BaseButtonDisabled")
      $("#ILQ_HintButton").attr("role", "disabled");
      $("#ILQ_HintButton .ILQ_AccessOnly").css("display", "inline")
      $("#ILQ_HintButton .ILQ_AccessOnly").attr("aria-hidden", "false")
      $("#ILQ_HintButton").prop( "onclick", null )
      $("#ILQ_HintButton").prop( "onmouseover", null )
      $("#ILQ_HintButton").prop( "onmousedown", null )
      $("#ILQ_HintButton").prop( "onmouseup", null );
      $('#ILQ_HintButton').prop( "onfocus", null );
      $('#ILQ_HintButton').prop( "onblur", null );
      $('#ILQ_HintButton').prop( "onkeypress", null );
}


InlineQuizApp.saveTextInput = function(){
  InlineQuizApp.inputText = [];

  if (InlineQuizApp.QuizData.Questions[InlineQuizApp.currentQuestion].questionType == "Fill In The Blank"){
    for (var i = 1; i <= InlineQuizApp.QuizData.Questions[InlineQuizApp.currentQuestion].answers.length; i++){
        if (InlineQuizApp.QuizData.General.forceCorrect == false){
          document.getElementById("blank" + i).setAttribute('disabled', 'disabled');
        }

        qAnswer = document.getElementById('blank' + i).value;
        qAnswer = qAnswer.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        capAnswer = qAnswer.toUpperCase();
        capAnswer = capAnswer.trim();
        InlineQuizApp.inputText.push(capAnswer);
    }

    InlineQuizApp.savedText.splice(InlineQuizApp.currentQuestion, 1, InlineQuizApp.inputText);
  }
  else if(InlineQuizApp.QuizData.Questions[InlineQuizApp.currentQuestion].questionType == "Math"){
    for (var i = 1; i <= InlineQuizApp.QuizData.Questions[InlineQuizApp.currentQuestion].answers.length; i++){
        if (InlineQuizApp.QuizData.General.forceCorrect == false){
          document.getElementById("number" + i).setAttribute('disabled', 'disabled');
        }

      qAnswer = document.getElementById('number' + i).value;
      numAnswer = qAnswer.toString();
      numAnswer = numAnswer.trim();
      InlineQuizApp.inputText.push(numAnswer);
    }
    InlineQuizApp.savedText.splice(InlineQuizApp.currentQuestion, 1, InlineQuizApp.inputText);
  }
}

/**
 * Function: AssessFeedback
 *
 * Assesses and generates the feedback to be displayed in the response text.
 *
 */
InlineQuizApp.AssessFeedback = function() {
  InlineQuizApp.saveTextInput();

  qScore = InlineQuizApp.getQuestionScore()
  maxScore = InlineQuizApp.QuizData.Questions[InlineQuizApp.currentQuestion].maxScoreValue

  console.log(qScore, maxScore);


  if(!InlineQuizApp.QuizData.General.allowPartial && qScore < maxScore){
    qScore = 0
  }


  if(document.getElementById("ILQ_ContinuousResponceCont") == null)
  {
    var ILQ_ContinuousResponceCont = document.createElement("div");
    ILQ_ContinuousResponceCont.setAttribute('id', 'ILQ_ContinuousResponceCont');
  } else {
    var ILQ_ContinuousResponceCont = document.getElementById("ILQ_ContinuousResponceCont")
    ILQ_ContinuousResponceCont.innerHTML = '';
  }

  var ILQ_ContinuousResponceText = document.createElement("div");
  ILQ_ContinuousResponceText.setAttribute('class', 'ILQ_ContinuousResponceText');

  var RespImg = document.createElement("img");
  RespImg.setAttribute('class', "ILQ_ContinuousResponceGraphic");
  var RespCntx = document.createElement("strong");

  if (InlineQuizApp.QuizData.General.forceCorrect == true){

    InlineQuizApp.BuildResponceText(ILQ_ContinuousResponceText, InlineQuizApp.currentQuestion)
ILQ_ContinuousResponceCont.appendChild(ILQ_ContinuousResponceText);
    if(qScore >= maxScore){
      InlineQuizApp.DisableButtons()

      nextBtn = InlineQuizApp.MakeGenericButton(function(){
          InlineQuizApp.currentQuestion++;
          if(InlineQuizApp.currentQuestion < InlineQuizApp.QuizData.General.showQuestions){
            InlineQuizApp.currentQuestionID = InlineQuizApp.QuizData.Questions[InlineQuizApp.currentQuestion].QuestionID
          }
          InlineQuizApp.GoNextQuestion();
      }, "Next", {id:"ILQ_NextButton"})

      ILQ_ContinuousResponceCont.appendChild(nextBtn)
    }




  } else {
      InlineQuizApp.DisableButtons()

      ca = InlineQuizApp.QuizData.Questions[InlineQuizApp.currentQuestion].ChoosenAnswers
      aa = InlineQuizApp.QuizData.Questions[InlineQuizApp.currentQuestion].answers

      for (var i = aa.length - 1; i >= 0; i--) {

       if (aa[i].scoreValue >= maxScore) {
        $("#AnswerSlot_"+i).addClass("correct")
       } else if(aa[i].scoreValue  != 0 && InlineQuizApp.QuizData.Questions[InlineQuizApp.currentQuestion].questionType === "All That Apply") {
        $("#AnswerSlot_"+i).addClass("correct")
       } else if (aa[i].scoreValue == 0 || !InlineQuizApp.QuizData.General.allowPartial ) {
        $("#AnswerSlot_"+i).addClass("incorrect")
       } else if(InlineQuizApp.QuizData.General.allowPartial) {
        $("#AnswerSlot_"+i).addClass("partial")
       }


       if($.inArray(i, ca) != -1 )
       {
        if (aa[i].scoreValue >= maxScore) {// is not correct and user choose it
            $("#AnswerSlot_"+i).addClass("AnsCorrect")
        } else if(aa[i].scoreValue != 0 && InlineQuizApp.QuizData.Questions[InlineQuizApp.currentQuestion].questionType === "All That Apply" ) {
            $("#AnswerSlot_"+i).addClass("AnsCorrect")
        } else if(aa[i].scoreValue == 0 || !InlineQuizApp.QuizData.General.allowPartial ) {
            $("#AnswerSlot_"+i).addClass("AnsIncorrect")
        } else if(InlineQuizApp.QuizData.General.allowPartial) {
            $("#AnswerSlot_"+i).addClass("AnsPartial")
        }
        } else if ($.inArray(i, ca) == -1 && aa[i].scoreValue != 0 && InlineQuizApp.QuizData.Questions[InlineQuizApp.currentQuestion].questionType === "All That Apply" ) {
         $("#AnswerSlot_"+i).addClass("AnsPartial")
        }

      }

      InlineQuizApp.BuildResponceText(ILQ_ContinuousResponceText, InlineQuizApp.currentQuestion)

      ILQ_ContinuousResponceText.appendChild(InlineQuizApp.GenerateMiniReport())
      ILQ_ContinuousResponceCont.appendChild(ILQ_ContinuousResponceText);

      nextBtn = InlineQuizApp.MakeGenericButton(function(){
          InlineQuizApp.currentQuestion++;

          if(InlineQuizApp.currentQuestion < InlineQuizApp.QuizData.General.showQuestions){
            InlineQuizApp.currentQuestionID = InlineQuizApp.QuizData.Questions[InlineQuizApp.currentQuestion].QuestionID
          }
          InlineQuizApp.GoNextQuestion();

      }, "Next", {id:"ILQ_NextButton"})

      ILQ_ContinuousResponceCont.appendChild(nextBtn)

    var clearDiv = document.createElement("div");
    clearDiv.setAttribute('style', "clear:both;");
    ILQ_ContinuousResponceCont.appendChild(clearDiv);

  }

  InlineQuizApp.contentRef.appendChild(ILQ_ContinuousResponceCont)
  InlineQuizApp.HandleWindowAdjust()
}



