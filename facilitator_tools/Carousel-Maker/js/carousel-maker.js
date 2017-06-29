// JavaScript Document

var appdata;

$(document).ready(function () {
	$.getJSON( "data/"+datafilename, function( data ) {
	  	appdata = data;
		buildCarousel();
		
	});
});


function buildCarousel() {
	for(var i=0; i<appdata.Slides.length; i++) {
		
		var slideobj = '<li id="slide-'+i+'"';
		if(i===0) {
			slideobj += ' class="selected"';
		}
		
		slideobj += '>';
		
		if(appdata.Slides[i].Type == "Full") {
			slideobj += '<div class="cd-full-width"><div class="slidecontent"><h2>'+appdata.Slides[i].Content.Title+'</h2>'+appdata.Slides[i].Content.Body+'</div></div> <!-- .cd-full-width --></li>';

			$('ul.cd-hero-slider').append(slideobj);

			var navobj = '<li';

			if(i===0) {
				navobj += ' class="selected"';
			}

			navobj += '><a href="#'+i+'">'+appdata.Slides[i].Navigation.Text+'</a></li>';
			console.log(navobj);
			$('.cd-slider-nav ul').append(navobj);

			if(appdata.Slides[i].Background.Media == "Image") {
				$('#slide-'+i).css('background-image','url('+appdata.Slides[i].Background.FolderPath + appdata.Slides[i].Background.FileName+')');
			}
		}
		else if(appdata.Slides[i].Type == "Half") {
			
			slideobj += '<div class="cd-half-width"><h2>'+appdata.Slides[i].Content.Title+'</h2>'+appdata.Slides[i].Content.Body+'</div> <!-- .cd-full-width -->';
			if(appdata.Slides[i].Background.Media == "Image") {
				slideobj += '<div class="cd-half-width mobile-hide"><img src="'+appdata.Slides[i].Background.FolderPath + appdata.Slides[i].Background.FileName+'"></li>';
			}
			
			$('ul.cd-hero-slider').append(slideobj);

			var navobj = '<li';

			if(i===0) {
				navobj += ' class="selected"';
			}

			navobj += '><a href="#'+i+'">'+appdata.Slides[i].Navigation.Text+'</a></li>';

			$('.cd-slider-nav ul').append(navobj);	
			
		}
		
	}
	
	
	sliderinit();
	$(function () {
	  $('[data-toggle="popover"]').popover()
	})	
	
	$('.cd-hero-slider a').attr('tabindex','-1');
	$('#slide-0 a').removeAttr('tabindex');
	
}