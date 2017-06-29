// js for multi-input activity
// written by Nathan Gardi, 2017
	
		var appdata;
	
		function checkAnswer(index) {
			$("#feedback-"+index).text("");
			
			var inputblank = false;
			for(var j=0; j<appdata.Questions[index].Fields.length; j++){
				if($("#input-"+index+"-"+j).val() == "") {
					inputblank = true;
				}
			}
			
			if(inputblank) {
				$("#feedback-"+index).text("You must input a value.");
			}
			
			else {
				var overallcorrect = true;

				for(var j=0; j<appdata.Questions[index].Fields.length; j++) {
					
					var thisval = $("#input-"+index+"-"+j).val();

					if(appdata.Questions[index].Fields[j].AnswerType == "number") {
						thisval = parseFloat(thisval);
					}

					if(thisval !== "") {
						
						/*var outofrange = false;
						
						if(thisval < parseFloat($("#input-"+index+"-"+j).attr("min"))) {
							outofrange = true;
							anyoutofrange = true;
						}

						if(thisval > parseFloat($("#input-"+index+"-"+j).attr("max"))) {
							outofrange = true;
							anyoutofrange = true;
						}

						if(outofrange) {
							$("#feedback-"+index).text("Your value must be between "+$("#input-"+index+"-"+j).attr("min")+" and "+$("#input-"+index+"-"+j).attr("max")+" inclusive");
						}
						else {
						*/

							$("#input-"+index+"-"+j).attr("disabled","disabled");
							$("#submit-"+index).css("display","none");


							if(appdata.Questions[index].Fields[j].Answer.HasRange) {
								if(thisval >= appdata.Questions[index].Fields[j].Answer.Correct[0] && thisval <= appdata.Questions[index].Fields[j].Answer.Correct[1]) {
									$("#input-"+index+"-"+j).addClass("correct");
									//$("#input-"+index+"-"+j).css({"background-color":"#00b44f","color":"#FFFFFF"});
								}
								else {
									overallcorrect = false;
									$("#input-"+index+"-"+j).addClass("incorrect");
									//$("#input-"+index+"-"+j).css({"background-color":"#ec0044","color":"#FFFFFF"});
								}
								
								if(appdata.Questions[index].Fields[j].Answer.AutoDisplay) {
								
									if(appdata.Questions[index].Fields[j].PreText !== "" && appdata.Questions[index].Fields[j].PreText !== "none") {
										$("#feedback-"+index).append("<p>The correct answer for "+appdata.Questions[index].Fields[j].PreText+" is anywhere between "+appdata.Questions[index].Fields[j].Answer.Correct[0]+" and "+appdata.Questions[index].Fields[j].Answer.Correct[1]+" "+appdata.Questions[index].Fields[j].Units+".</p>");
									}
									else {
										$("#feedback-"+index).append("<p>The correct answer is anywhere between "+appdata.Questions[index].Fields[j].Answer.Correct[0]+" and "+appdata.Questions[index].Fields[j].Answer.Correct[1]+" "+appdata.Questions[index].Fields[j].Units+".</p>");
									}
								}
							}

							else {
								if(appdata.Questions[index].Fields[j].Answer.Correct.indexOf(thisval) > -1){
									$("#input-"+index+"-"+j).addClass("correct");
									//$("#input-"+index+"-"+j).css({"background-color":"#00b44f","color":"#FFFFFF"});
								}
								else {
									overallcorrect = false;
									$("#input-"+index+"-"+j).addClass("incorrect");
									//$("#input-"+index+"-"+j).css({"background-color":"#ec0044","color":"#FFFFFF"});
								}
								
								
								if(appdata.Questions[index].Fields[j].Answer.AutoDisplay) {
									if(appdata.Questions[index].Fields[j].Answer.Correct.length > 1) {
										var answerlist = "";
										for(var i=0; i<appdata.Questions[index].Fields[j].Answer.Correct.length; i++) {
											answerlist += appdata.Questions[index].Fields[j].Answer.Correct[i];
											if(i !== appdata.Questions[index].Fields[j].Answer.Correct.length-1) {
												answerlist+= ", ";
											}
										}
										if(appdata.Questions[index].Fields[j].PreText !== "" && appdata.Questions[index].Fields[j].PreText !== "none") {
											$("#feedback-"+index).append("<p>Any of the following answers can be correct for "+appdata.Questions[index].Fields[j].PreText+" "+answerlist+" "+appdata.Questions[index].Fields[j].Units+".</p>");
										}
										else {
											$("#feedback-"+index).append("<p>Any of the following answers can be correct: "+answerlist+" "+appdata.Questions[index].Fields[j].Units+".</p>");
										}


									}
									else {
										if(appdata.Questions[index].Fields[j].PreText !== "" && appdata.Questions[index].Fields[j].PreText !== "none") {
											$("#feedback-"+index).append("<p>The correct answer for "+appdata.Questions[index].Fields[j].PreText+" is "+appdata.Questions[index].Fields[j].Answer.Correct[0]+" "+appdata.Questions[index].Fields[j].Units+".</p>");
										}
										else {
											$("#feedback-"+index).append("<p>The correct answer is "+appdata.Questions[index].Fields[j].Answer.Correct[0]+" "+appdata.Questions[index].Fields[j].Units+".</p>");
										}
									}
								}

							}

							if(appdata.Questions[index].Fields[j].Answer.FeedbackText !== "" && appdata.Questions[index].Fields[j].Answer.FeedbackText !== "none") {
								$("#feedback-"+index).append("<p>"+appdata.Questions[index].Fields[j].Answer.FeedbackText+"</p>");
							}
						/*}*/
					}
				}
				

				if(overallcorrect) {
					$("#feedbackicon-"+index).addClass("correct");
				}
				else {
					$("#feedbackicon-"+index).addClass("incorrect");
				}

			}
		}
	
		
		function checkAll() {
			
			for(var a=0; a<appdata.Questions.length; a++) {
				$("#feedback-"+a).html("");
				var overallcorrect = true;
				for(var j=0; j<appdata.Questions[a].Fields.length; j++) {
					
					var thisval = $("#input-"+a+"-"+j).val();

					if(appdata.Questions[a].Fields[j].AnswerType == "number") {
						thisval = parseFloat(thisval);
					}
					
					$("#input-"+a+"-"+j).attr("disabled","disabled");
					$("#submit-"+a).css("display","none");

					if(appdata.Questions[a].Fields[j].Answer.HasRange) {
						if(thisval >= appdata.Questions[a].Fields[j].Answer.Correct[0] && thisval <= appdata.Questions[a].Fields[j].Answer.Correct[1]) {
							$("#input-"+a+"-"+j).addClass("correct");
							//$("#input-"+index+"-"+j).css({"background-color":"#00b44f","color":"#FFFFFF"});
						}
						else {
							overallcorrect = false;
							$("#input-"+a+"-"+j).addClass("incorrect");
							//$("#input-"+index+"-"+j).css({"background-color":"#ec0044","color":"#FFFFFF"});
						}

						if(appdata.Questions[a].Fields[j].Answer.AutoDisplay) {

							if(appdata.Questions[a].Fields[j].PreText !== "" && appdata.Questions[a].Fields[j].PreText !== "none") {
								$("#feedback-"+a).append("<p>The correct answer for "+appdata.Questions[a].Fields[j].PreText+" is anywhere between "+appdata.Questions[a].Fields[j].Answer.Correct[0]+" and "+appdata.Questions[a].Fields[j].Answer.Correct[1]+" "+appdata.Questions[a].Fields[j].Units+".</p>");
							}
							else {
								$("#feedback-"+a).append("<p>The correct answer is anywhere between "+appdata.Questions[a].Fields[j].Answer.Correct[0]+" and "+appdata.Questions[a].Fields[j].Answer.Correct[1]+" "+appdata.Questions[a].Fields[j].Units+".</p>");
							}
						}
					}

					else {
						if(appdata.Questions[a].Fields[j].Answer.Correct.indexOf(thisval) > -1){
							$("#input-"+a+"-"+j).addClass("correct");
							//$("#input-"+index+"-"+j).css({"background-color":"#00b44f","color":"#FFFFFF"});
						}
						else {
							overallcorrect = false;
							$("#input-"+a+"-"+j).addClass("incorrect");
							//$("#input-"+index+"-"+j).css({"background-color":"#ec0044","color":"#FFFFFF"});
						}


						if(appdata.Questions[a].Fields[j].Answer.AutoDisplay) {
							if(appdata.Questions[a].Fields[j].Answer.Correct.length > 1) {
								var answerlist = "";
								for(var i=0; i<appdata.Questions[a].Fields[j].Answer.Correct.length; i++) {
									answerlist += appdata.Questions[a].Fields[j].Answer.Correct[i];
									if(i !== appdata.Questions[a].Fields[j].Answer.Correct.length-1) {
										answerlist+= ", ";
									}
								}
								if(appdata.Questions[a].Fields[j].PreText !== "" && appdata.Questions[a].Fields[j].PreText !== "none") {
									$("#feedback-"+a).append("<p>Any of the following answers can be correct for "+appdata.Questions[a].Fields[j].PreText+" "+answerlist+" "+appdata.Questions[a].Fields[j].Units+".</p>");
								}
								else {
									$("#feedback-"+a).append("<p>Any of the following answers can be correct: "+answerlist+" "+appdata.Questions[a].Fields[j].Units+".</p>");
								}


							}
							else {
								if(appdata.Questions[a].Fields[j].PreText !== "" && appdata.Questions[a].Fields[j].PreText !== "none") {
									$("#feedback-"+a).append("<p>The correct answer for "+appdata.Questions[a].Fields[j].PreText+" is "+appdata.Questions[a].Fields[j].Answer.Correct[0]+" "+appdata.Questions[a].Fields[j].Units+".</p>");
								}
								else {
									$("#feedback-"+a).append("<p>The correct answer is "+appdata.Questions[a].Fields[j].Answer.Correct[0]+" "+appdata.Questions[a].Fields[j].Units+".</p>");
								}
							}
						}

					}

					if(appdata.Questions[a].Fields[j].Answer.FeedbackText !== "" && appdata.Questions[a].Fields[j].Answer.FeedbackText !== "none") {
						$("#feedback-"+a).append("<p>"+appdata.Questions[a].Fields[j].Answer.FeedbackText+"</p>");
					}

				}
				

				if(overallcorrect) {
					$("#feedbackicon-"+a).addClass("correct");
				}
				else {
					$("#feedbackicon-"+a).addClass("incorrect");
				}
			}
		}


		function resetAll() {
			
			$("#mi-table").html('<tr><th id="column-question">Question</th><th id="column-input"> Answer</th><th id="column-feedback"></th><th id="column-feedbackicon"></th></tr>');
			initMI(appdata);
			
		}


		function initMI(data) {
			  for(var i=0; i<data.Questions.length; i++) {
				  var newrow = "<tr id='qindex-"+i+"'>";
				  newrow += "<td>"+data.Questions[i].Text+"</td><td>";
				  	for(var j=0; j<data.Questions[i].Fields.length; j++) {
					  if(data.Questions[i].Fields[j].PreText !== "" && data.Questions[i].Fields[j].PreText !== "none") {
						  newrow += data.Questions[i].Fields[j].PreText + " ";
					  }	
					  newrow += "<input id='input-"+i+"-"+j+"'";
						if(data.Questions[i].Fields[j].AnswerType == "number") {
							newrow+= " type='number'"
						}
						if($.isNumeric(data.Questions[i].Fields[j].MinAccepted)) {
							newrow+= " min='"+data.Questions[i].Fields[j].MinAccepted+"'";
						}
						if($.isNumeric(data.Questions[i].Fields[j].MaxAccepted)) {
							newrow+= " max='"+data.Questions[i].Fields[j].MaxAccepted+"'";
						}
					  newrow += ">";
					  if((data.Questions[i].Fields[j].Units !== null) && (data.Questions[i].Fields[j].Units !== "") && (data.Questions[i].Fields[j].Units !== "none")) {
						 newrow += " "+data.Questions[i].Fields[j].Units;
					  }	
					  if(j < (data.Questions[i].Fields.length - 1)) {
						  newrow += ", <br>";
					  }
					}
				  newrow += "</td><td><button class='btn btn-primary btn-check' id='submit-"+i+"' onClick='checkAnswer("+i+")'>Check Answer</button><div id='feedback-"+i+"'></div></td><td><div class='feedbackicon' id='feedbackicon-"+i+"'></div></td>";
				  newrow += "</tr>";
				  $("#mi-table").append(newrow);
			  }	
		}

	
        $(document).ready(function () {
	$.getJSON( "data/"+datafilename, function( data ) {
			  appdata = data;
		  initMI(appdata);
			});
        });
