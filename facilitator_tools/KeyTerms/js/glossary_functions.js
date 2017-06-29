// JavaScript Document

$(document).ready(function () {

    (function ($) {

        $('#filter').keyup(function () {

            var rex = new RegExp($(this).val(), 'i');
            $('.searchable tr').hide();
            $('.searchable tr').filter(function () {
                return rex.test($(this).text());
            }).show();

        })

    }(jQuery));


	for(i=0; i<glossary.length; i++) {
	var rowhtml = "<tr>";
	rowhtml += "<td>";
	rowhtml += "<strong>"+glossary[i].term+"</strong>";
	rowhtml += "</td>";
	rowhtml += "<td>";
	rowhtml += glossary[i].definition;
	rowhtml += "</td>";
	//rowhtml += "<td class='audiocell' id='ac"+i+"'>";
	//rowhtml += "</td>";
	rowhtml += "</tr>";
	$("tbody.searchable").append(rowhtml);
	}
	
	for(i=0; i<glossary.length; i++) {
		if(glossary[i].filename !== null) {
			
		var audioclip = document.createElement('audio');
		audioclip.setAttribute("id","audio"+i);
		audioclip.src = "../_audio/"+glossary[i].filename+"."+glossary[i].filetype;
		audioclip.type ="audio/mpeg";
		audioclip.controls=true;
		$("#ac"+i).append(audioclip);
		$("#ac"+i).append("<p>Speaker: "+glossary[i].speaker+"</p>");
		}	
	}
	
	//$('video,audio').mediaelementplayer(/* Options */);

});



function startAudio() {
	var audio = document.getElementById("glossary_audio");
	audio.play();
}


function loadGlossary(name) {
var namecheck = name.toLowerCase();
var namefound = false;

	$("#glossary_definition").html("");
	
	for (i=0; i< glossary.length; i++) {
		if ((glossary[i].term).toLowerCase() == namecheck  || (glossary[i].term).toLowerCase() +'s' == namecheck) {
			namefound = true;
			$("#glossary_title").html(glossary[i].term);
			$("#glossary_definition").append("<p>"+glossary[i].definition+"</p>");
			
			if (glossary[i].filename !== null) {
				$("#audio_icon").css("display","inline-block");
			$("#glossary_audio").attr("src","../_audio/"+glossary[i].filename+"."+glossary[i].filetype);
			}
			else {
				$("#audio_icon").css("display","none");
			}

		}
	}
		
	if (namefound == false) {
		$("#glossary_audio").attr("src","../_audio/notfound.mp3");

				$("#glossary_title").html("word not found");
	}
}


$(document).ready(function(event){
	$(".glossary").click(function(event){
		var theword = $(this).html();
		loadGlossary(theword)
		$('#popupInfo').popup("open", {positionTo: $(event.target)});
	});
});

function closeframe(name) {
	$("#"+name).popup("option", "history", false);
	$("#"+name).popup("close");
}	