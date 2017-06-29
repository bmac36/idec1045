// JavaScript Document

var appdata;

$(document).ready(function () {
	$.getJSON( "data/"+datafilename, function( data ) {
	  	appdata = data;
		buildType2();
		
	});
});


function buildType2() {
	
	$('#type2reveal').html('');
	$('#type2reveal').append('<a href="javascript:buildType2()" class="btn btn-primary" id="resetT2R">Reset Activity</a>')
	
	for(var q=0; q<appdata.Questions.length; q++) {
		
		var newquestion = '<div class="row t2ritem">';
		newquestion += '<div class="col-sm-12"><strong>'+appdata.Questions[q].QuestionText+'</strong>';
		if(appdata.Questions[q].InputType == "text" && appdata.Questions[q].KeyWords.length > 0) {
			newquestion += '<br><em>Key Words: '+appdata.Questions[q].KeyWords.length+'</em>';
		}
		newquestion += '</div>';
		newquestion += '<div class="col-sm-8">';
		if(appdata.Questions[q].InputType == "text") {
			newquestion += '<textarea rows="4" id="t2rinput-'+q+'" data-qindex="'+q+'"></textarea>';
		}
		else {
			newquestion += '<input type="'+appdata.Questions[q].InputType+'" id="t2rinput-'+q+'" data-qindex="'+q+'">'
		}
		
		newquestion += '</div>';
		newquestion += '<div class="col-sm-4"><a class="btn btn-primary disabled" role="button" id="t2rbtn-'+q+'" data-toggle="collapse" aria-expanded="false" aria-controls="t2ranswer-'+q+'" href="#t2ranswer-'+q+'">'+appdata.Questions[q].ButtonText+'</a>';
		
		if(appdata.Questions[q].InputType == "text" && appdata.Questions[q].MinCharacters > 0) {
			newquestion += '<br>Characters Remaining: <span id="t2rcharcount-'+q+'">'+appdata.Questions[q].MinCharacters+'</span>';
		}
		
		newquestion += '</div>';
		newquestion += '<div class="col-sm-12"><div id="t2ranswer-'+q+'" class="collapse" data-qindex="'+q+'"><strong>Answer: </strong>'+appdata.Questions[q].AnswerText;
		if(appdata.Questions[q].InputType == "text" && appdata.Questions[q].KeyWords.length > 0) {
			newquestion += '<br><em>Key Words: '
				for(var w=0; w<appdata.Questions[q].KeyWords.length; w++) {
					newquestion += appdata.Questions[q].KeyWords[w];
					if(w !== (appdata.Questions[q].KeyWords.length - 1)) {
						newquestion += ', ';
					}
				}
			newquestion += '</em>';
		}		
		
		newquestion += '</div></div>';
		newquestion += '</div>';
		$('#type2reveal').append(newquestion);
		
		
		if(appdata.Questions[q].InputType == "text") {
			$('#t2rinput-'+q).keypress( _.debounce( function(){

				var qindex = parseInt($(this).attr("data-qindex"));

				if($(this).val().length > appdata.Questions[qindex].MinCharacters) {
					$('#t2rcharcount-'+qindex).text(0);
					$('#t2rbtn-'+qindex).removeClass('disabled');
				}
				else {
					$('#t2rcharcount-'+qindex).text(appdata.Questions[qindex].MinCharacters - $(this).val().length);
				}

			}, 500 ) );	

	
		}
		
		else if(appdata.Questions[q].InputType == "number") {
			
			$('#t2rinput-'+q).bind('keyup input change', function(){
				
				var qindex = parseInt($(this).attr("data-qindex"));
				
				if($(this).val() !== "") {
					$('#t2rbtn-'+qindex).removeClass('disabled');
				}
			});			
			
			
		}
		
		
		$('#t2ranswer-'+q).on('shown.bs.collapse', function () {

			var qindex = $(this).attr('data-qindex');
			$('#t2rbtn-'+qindex).removeAttr("href");
			$('#t2rinput-'+qindex).attr("disabled","disabled");

			if(appdata.Questions[qindex].InputType == "text" && appdata.Questions[qindex].KeyWords.length > 0) {
				$('#t2rinput-'+qindex).highlightTextarea({
					words: appdata.Questions[qindex].KeyWords,
					caseSensitive: false
				});

			}

		});		


/*		    var index = textarea.innerText.indexOf("@twitter");
                if( index >= 0)
                    textarea.setSelectionRange(index, index + 8);
            });*/
		
		
	}
	
}



