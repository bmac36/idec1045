// JavaScript Document

var appdata;

$(document).ready(function () {
	$.getJSON( "data/"+datafilename, function( data ) {
	  	appdata = data;
		buildTimeline();
		
	});
});


function buildTimeline() {
	
	if(appdata.Position == "center") {
		$(".timeline").addClass("timeline-center");
	}
	else if(appdata.Position == "left") {
		$(".timeline").addClass("timeline-left");
	}
	
	for(var i=0; i<appdata.Events.length; i++) {
		
		var eventobj = '<li id="event-'+i+'"';
		var liclasses = [];
		
		if(appdata.Events[i].Inverted) {
			liclasses.push("timeline-inverted");
		}
		
		if(appdata.Events[i].RevealType == "scroll") {
			liclasses.push("scroll-reveal");
		}
		
		if(liclasses.length > 0) {
			var classstring = "";
			for(var j=0; j<liclasses.length; j++) {
				classstring += liclasses[j];
				if((j+1)<liclasses.length) {
					classstring += " ";
				}
			}
			
			eventobj+= 'class="'+classstring+'"';
			
		}
		
		eventobj += '>';
		eventobj += '<a class="timeline-badge';
		
		if(appdata.Events[i].Badge.AddCircle) {
			eventobj += ' circle';
		}
		
		eventobj += '"';
		
		if(isHexaColor(appdata.Events[i].Badge.BadgeColor1)) {
			if(appdata.Events[i].Badge.AddCircle) {
				eventobj += ' style="background-color:#'+appdata.Events[i].Badge.BadgeColor1+';';
				
				if(isHexaColor(appdata.Events[i].Badge.BadgeColor2)) {
					eventobj += 'color:#'+appdata.Events[i].Badge.BadgeColor2;
				}
				
				eventobj += '"';
			}
			else {
				eventobj += ' style="font-size:3em; color:#'+appdata.Events[i].Badge.BadgeColor1+'"';
			}
		}
		
		if(appdata.Events[i].RevealType == "click") {
			eventobj += ' href="javascript:displayTime('+i+')"';
		}
		else {
			eventobj += ' href="javascript:void(0)"';
		}
		
		eventobj += '>';
		
		if(appdata.Events[i].Badge.BadgeIcon !== 'none') {
			eventobj += '<i class="'+appdata.Events[i].Badge.BadgeIcon+'" aria-hidden="true"></i>';
		}
		
		var marginval = parseInt(appdata.Events[i].Badge.BadgeTextMargin);
		var positiontop = 65;
		if(marginval > 0) {
			positiontop += marginval;
		}

		eventobj += '<span class="timeline-date" style="font-size: '+appdata.Events[i].Badge.BadgeFontSize+'; top: -'+positiontop+'px">';
		
		if(appdata.Events[i].Badge.BadgeText !== "none" && appdata.Events[i].Badge.BadgeText !== "") {
			eventobj += appdata.Events[i].Badge.BadgeText;
		}

		eventobj += '</span></a>';
		
		eventobj += '<div class="timeline-panel"';
		
		if(appdata.Events[i].RevealType == "click" || appdata.Events[i].RevealType == "scroll") {
			eventobj += ' style="opacity:0"';
		}
		
		eventobj += '><div class="timeline-heading"><h3 class="top-0">'+appdata.Events[i].Title+'</h3></div>';
		eventobj += '<div class="timeline-body">'+appdata.Events[i].Body;
		
		if(appdata.Position == "left") {
			if(appdata.Events[i].Accent.Type !== "none") {
				if(appdata.Events[i].Accent.Type == "Image") {
					eventobj += '<img src="'+appdata.Events[i].Accent.FolderPath+appdata.Events[i].Accent.FileName+'">';
				}

				eventobj += '</div>';
			}
		}
		
		eventobj += '</div>';
		eventobj += '</div>';
		
		if(appdata.Position == "center") {
			if(appdata.Events[i].Accent.Type !== "none") {
				eventobj += '<div class="timeline-accent"';

				if(appdata.Events[i].RevealType == "click" || appdata.Events[i].RevealType == "scroll") {
					eventobj += ' style="opacity:0"';
				}

				eventobj += '>';

				if(appdata.Events[i].Accent.Type == "Image") {
					eventobj += '<img src="'+appdata.Events[i].Accent.FolderPath+appdata.Events[i].Accent.FileName+'">';
				}

				eventobj += '</div>';
			}
		}
		eventobj += '</div>';
		$('ul.timeline').append(eventobj);
		
	}
	
	
	if(appdata.Events[0].RevealType !== "click") {
		$('.timeline li#event-0').find('.timeline-panel').animate({'opacity':'1'},500);
		$('.timeline li#event-0').find('.timeline-accent').animate({'opacity':'1'},500);
	}
	
    $(window.parent).scroll( function(){
    
        /* Check the location of each desired element */
        $('.timeline li.scroll-reveal').each( function(){
            
            var bottom_of_object = $(this).offset().top + $(this).outerHeight();
			var bottom_of_window = $(window.parent).scrollTop() + $(window.parent).height();
            
            /* If the object is completely visible in the window, fade it it */
            if( bottom_of_window > bottom_of_object ){
                
                $(this).find('.timeline-panel').animate({'opacity':'1'},500);
                $(this).find('.timeline-accent').animate({'opacity':'1'},500);   
            }
            
        }); 
    
    });

	
}


function displayTime(index) {
	$('#event-'+index+' .timeline-panel').animate({'opacity':'1'},500);
	$('#event-'+index+' .timeline-accent').animate({'opacity':'1'},500);
}


function isHexaColor(sNum){
  return (typeof sNum === "string") && sNum.length === 6 && ! isNaN( parseInt(sNum, 16) );
}