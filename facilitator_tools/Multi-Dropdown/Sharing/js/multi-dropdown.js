		var appdata;
	
		function checkAnswer(index) {
			$("#feedback-"+index).text("");
			
			var thisval = $("#sel-"+index).val();
			var thiscorrect = false;
			
			var inputblank = false;
				if($("#sel-"+index).val() == "" || $("#sel-"+index).val() == -1) {
					inputblank = true;
				}
			
			if(inputblank) {
				$("#feedback-"+index).text("You must select a response.");
			}
			
			else {
				
				$("#submit-"+index).css("display","none");
				$("#sel-"+index).attr("disabled","disabled");
				
				if(!appdata.Questions[index].Answer.AutoDisplay) {
					$("#feedback-"+index).append(appdata.Questions[index].Answer.FeedbackText);
				}
				
				if(thisval == appdata.Questions[index].Answer.Correct[0]) {
					thiscorrect = true;
				}
				
				if(thiscorrect) {
					$("#sel-"+index).addClass("correct");
					$("#feedbackicon-"+index).addClass("correct");
				}
				else {
					$("#sel-"+index).addClass("incorrect");
					$("#feedbackicon-"+index).addClass("incorrect");
				}

			}
		}
	
		function shuffle(array) {
		  var currentIndex = array.length, temporaryValue, randomIndex;

		  // While there remain elements to shuffle...
		  while (0 !== currentIndex) {

			// Pick a remaining element...
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;

			// And swap it with the current element.
			temporaryValue = array[currentIndex];
			array[currentIndex] = array[randomIndex];
			array[randomIndex] = temporaryValue;
		  }

		  return array;
		}



		function resetAll() {
			
			$("#mi-table").html('<tr><th id="column-question">Scenario</th><th id="column-input">Phase</th><th id="column-feedback">Feedback</th><th id="column-feedbackicon"></th></tr>');
			initMI(appdata);
			
		}

	

		function initMI(data) {
				
			  if(data.Randomize) {
				 data.Questions = shuffle(data.Questions);
				 data.Randomize = false;
			  }	
				
			  for(var i=0; i<data.Questions.length; i++) {
				  var newrow = "<tr id='qindex-"+i+"'>";
				  newrow += "<td>"+data.Questions[i].Text+"</td><td>";
				  newrow += '<div class="form-group"><select class="form-control" id="sel-'+i+'">';
				  newrow += '<option value="-1"></option>'
				  	for(var j=0; j<data.Questions[i].Options.length; j++) {
						newrow += '<option value="'+data.Questions[i].Options[j].Val+'">'+data.Questions[i].Options[j].Text+'</option>';
					}
				  newrow += '</select></div>';
				  newrow += "</td><td class='col-fb'><button class='btn btn-primary btn-check' id='submit-"+i+"' onClick='checkAnswer("+i+")'>Check Answer</button><div id='feedback-"+i+"'></div></td><td><div class='feedbackicon' id='feedbackicon-"+i+"'></div></td>";
				  newrow += "</tr>";
				  $("#mi-table").append(newrow);
			  }	

		}

	
        $(document).ready(function () {
			$.getJSON(datafilepath , function( data ) {
			  appdata = data;
			  initMI(appdata);
			});
        });
