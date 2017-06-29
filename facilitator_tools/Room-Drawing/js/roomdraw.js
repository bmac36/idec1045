
var roomdata;
var patterndata;

$(document).ready(function () {
	$.getJSON( "data/"+datafilename, function( data ) {
	  	roomdata = data;
		patterndata = roomdata.Patterns.FileNames;
		init();
	});
});

var ctx;
var c;

var rug_width = 100;
var rug_length = 100;
var rug_posx = 100;
var rug_posy = 100;
var rug_colour = "FFFFFF";
var rug_pattern = "none";

var isrotated = false;

var activeSteps = [1];
var currentStep = 1;	

var imgData1;
var imgDataHTML = [];

var canvasdone = false;	
var inputsdone = false;
	
var pdf;
var canvas;
var width;
var maxheight = 760;

var firstload = true;
	

function downloadpdf() {    
	
	pdf = new jsPDF('p', 'pt', 'letter');
	canvas = pdf.canvas;
	width = 720;
	
	imgDataHTML = [];
	
	$("#input-size").html("<strong>Length: </strong>"+$("#length1").val()+"’ "+$("#length2").val()+"”<br><strong>Width: </strong>"+$("#width1").val()+"’ "+$("#width2").val()+"”<br><strong>Explanation: </strong>"+$("#comment1").val());
	$("#input-placement").html("<strong>From Top: </strong>"+$("#top1").val()+"’ "+$("#top2").val()+"”<br><strong>From Left: </strong>"+$("#left1").val()+"’ "+$("#left2").val()+"”<br><strong>Explanation: </strong>"+$("#comment2").val());
	$("#input-material").html("<strong>Material: </strong>"+$("#sel1").val()+"<br><strong>Explanation: </strong>"+$("#comment3").val());
	$("#input-colour").html("<strong>Colour: </strong>"+$("#color1").val()+"<div style='width:20px;height:20px;display:inline-block;margin-left:20px;background-color:#"+$("#color1").val()+";border:2px solid #000'></div><br><strong>Explanation: </strong>"+$("#comment4").val());
	if(rug_pattern == "none") {
		$("#input-pattern").html("<strong>Pattern: </strong><div style='width:50px;height:50px;display:inline-block;border:2px solid #000'></div><br><strong>Explanation: </strong>"+$("#comment5").val());
	}
	else {
		$("#input-pattern").html("<strong>Pattern: </strong><div style='width:50px;height:50px;display:inline-block;background-image:url("+roomdata.Patterns.Folder+"/"+rug_pattern+");border:2px solid #000'></div><br><strong>Explanation: </strong>"+$("#comment5").val());
	}
	
	
	html2canvas($("#"+roomdata.Rooms[0].canvasid), {
		onrendered: function(canvas) {         
			imgData1 = canvas.toDataURL('image/PNG');
			downloadpdf2(0);
		}
	});

}
	
function downloadpdf2(sectionindex) {
	
	$("#pdfgeneration").html("");
	var totalheight = $("#hiddenelement").outerHeight();
	var thisindex = sectionindex;
	
	if(totalheight > maxheight) {
		$(".pdfsection").each(function( index ) {
			
			if(index >= sectionindex) {
				
				if(($("#pdfgeneration").outerHeight() + $(this).outerHeight()) <= maxheight) {
					thisindex++;
					$("#pdfgeneration").append($(this).html());
				}
			}
		});
		
		html2canvas($("#pdfgeneration"), {
			allowTaint: true,
        	taintTest: false,
			onrendered: function( canvas ) {
				var imgDataPage = canvas.toDataURL('image/PNG');
				imgDataHTML.push(imgDataPage);
				if((thisindex) < $(".pdfsection").length) {
					downloadpdf2(thisindex);
				}
				else {
					downloadpdf3();
				}
			}
		});
	}
	else {
		html2canvas($("#hiddenelement"), {
			allowTaint: true,
        	taintTest: false,
			onrendered: function(canvas) {
				var imgDataPage = canvas.toDataURL('image/PNG');
				imgDataHTML.push(imgDataPage);
				downloadpdf3();
			}
		});
	}
}
	
function downloadpdf3() {
	for(i=0; i<imgDataHTML.length; i++) {
		pdf.addImage(imgDataHTML[i], 'PNG', 15, 15);
		pdf.addPage();
	}
	pdf.addImage(imgData1, 'PNG', 20, 20, 555, 555);
	pdf.save(roomdata.SaveFileName);
}


function rotaterug() {
	isrotated = !isrotated;
	drawroom();
}


$(".rugvalue").change(function(){
	
	if($(this)[0].type == "number") {
		var thisval = parseInt($(this)[0].value);
		
		if(isNaN(thisval)) {
			$(this)[0].value = 2;
			thisval = 2;
		}
		if(thisval > $(this)[0].max) {
			$(this)[0].value = $(this)[0].max;
		}
		if(thisval < $(this)[0].min) {
		   	$(this)[0].value = $(this)[0].min;
		}
	}
	drawroom();
});


function selectpattern(index) {
	$(".patternpreview").removeClass("selected");
	$("#pattern"+index).addClass("selected");
	rug_pattern = patterndata[index];
	drawroom();
}

	
function isHexaColor(sNum){
  return (typeof sNum === "string") && sNum.length === 6 
         && ! isNaN( parseInt(sNum, 16) );
}


function convertpix(feet, inches, roompixels, roomwidth, marginpixels) {
	
	var inchestofeet = inches / 12;
	var feetandinches = feet + inchestofeet;
	var percentroom = feetandinches / roomwidth;
	var pixelroom = percentroom * (roompixels-marginpixels);

	return(Math.round(pixelroom));
}	
	
	
function drawrug(posx, posy, width, length, colour, pattern) {

	if(isrotated) {
      var imageObj = new Image();
      imageObj.onload = function() {
		  
		ctx.beginPath();
        var rugend = ctx.createPattern(imageObj, 'repeat');
        ctx.rect((posx-10), posy, width+20, length);
        ctx.fillStyle = rugend;
        ctx.fill();

		ctx.beginPath();
		ctx.rect(posx,posy,width,length);
		ctx.fillStyle = "#"+colour;
		ctx.fill();

		if(pattern !== "none") {
			var imageObj2 = new Image();
			imageObj2.onload = function() {
				var rugpattern = ctx.createPattern(imageObj2, 'repeat');
				ctx.rect(posx,posy,width,length);
				ctx.fillStyle = rugpattern;
				ctx.fill();
				
				for(var o=0; o<roomdata.Rooms[0].Objects.length; o++) {
					drawobj(roomdata.Rooms[0].Objects[o].pixelx, roomdata.Rooms[0].Objects[o].pixely, roomdata.Rooms[0].Objects[o].image);
				}

			}
			
			imageObj2.src = roomdata.Patterns.Folder+'/'+pattern;
			
		}
		  
		else {
			for(var o=0; o<roomdata.Rooms[0].Objects.length; o++) {
				drawobj(roomdata.Rooms[0].Objects[o].pixelx, roomdata.Rooms[0].Objects[o].pixely, roomdata.Rooms[0].Objects[o].image);
			}
		}
		  
		if(firstload) {
			highlightrug(posx+(width/2), posy+(length/2));
			firstload = false;
		}
		  
      };
	
      imageObj.src = roomdata.Patterns.Folder+'/Rug-End-Rotate.png';	
	}
	else {
      var imageObj = new Image();
      imageObj.onload = function() {
        var rugend = ctx.createPattern(imageObj, 'repeat');
        ctx.rect(posx, (posy-10), width, length+20);
        ctx.fillStyle = rugend;
        ctx.fill();

		ctx.beginPath();
		ctx.rect(posx,posy,width,length);
		ctx.fillStyle = "#"+colour;
		ctx.fill();

		if(pattern !== "none") {
			var imageObj2 = new Image();
			imageObj2.onload = function() {
				var rugpattern = ctx.createPattern(imageObj2, 'repeat');
				ctx.rect(posx,posy,width,length);
				ctx.fillStyle = rugpattern;
				ctx.fill();

				for(var o=0; o<roomdata.Rooms[0].Objects.length; o++) {
					drawobj(roomdata.Rooms[0].Objects[o].pixelx, roomdata.Rooms[0].Objects[o].pixely, roomdata.Rooms[0].Objects[o].image);
				}		  
				
			}
			
			imageObj2.src = roomdata.Patterns.Folder+'/'+pattern;
			
		}
		else {
			for(var o=0; o<roomdata.Rooms[0].Objects.length; o++) {
				drawobj(roomdata.Rooms[0].Objects[o].pixelx, roomdata.Rooms[0].Objects[o].pixely, roomdata.Rooms[0].Objects[o].image);
			}		  
		}
		   
		if(firstload) {
			highlightrug(posx+(width/2), posy+(length/2));
			firstload = false;
		}
		  
      };
      imageObj.src = roomdata.Patterns.Folder+'/Rug-End.png';	
	}	
	
	//
}	

	
function highlightrug(xpos, ypos) {
	ctx.font = "16px Arial";
	ctx.fillStyle = "#000";
	ctx.textAlign = "center";
	ctx.fillText("My Rug", xpos, ypos);
}


function drawobj(posx, posy, img) {
	var imageObj = new Image();
	imageObj.onload = function() {
		ctx.drawImage(imageObj, posx, posy);
	};
	imageObj.src = roomdata.Patterns.Folder+'/'+img;
}


function drawroom() {

  $("#drawspace").html('<canvas id="'+roomdata.Rooms[0].canvasid+'" width="'+roomdata.Rooms[0].pixelwidth+'" height="'+roomdata.Rooms[0].pixellength+'" style="border:1px solid #d3d3d3; background-image:url('+roomdata.Patterns.Folder+'/'+roomdata.Rooms[0].background+')">Your browser does not support the HTML5 canvas tag.</canvas>')

  c = document.getElementById(roomdata.Rooms[0].canvasid);
  ctx = c.getContext("2d");			
	
  var imageBG = new Image();
	
	var rug_width_feet = parseInt($("#width1").val());
	var rug_width_inches = parseInt($("#width2").val());
	var rug_length_feet = parseInt($("#length1").val());
	var rug_length_inches = parseInt($("#length2").val());

	var rug_top_feet = parseInt($("#top1").val());
	var rug_top_inches = parseInt($("#top2").val());
	var rug_left_feet = parseInt($("#left1").val());
	var rug_left_inches = parseInt($("#left2").val());
	
	
	if(roomdata.Rooms[0].Margins.HasMargins) {
		var marginhoriz = roomdata.Rooms[0].Margins.Left+roomdata.Rooms[0].Margins.Right;
		var marginvert = roomdata.Rooms[0].Margins.Top+roomdata.Rooms[0].Margins.Bottom;
		rug_width = convertpix(rug_width_feet, rug_width_inches, roomdata.Rooms[0].pixelwidth, roomdata.Rooms[0].roomwidth, marginhoriz);
		rug_length = convertpix(rug_length_feet, rug_length_inches, roomdata.Rooms[0].pixellength, roomdata.Rooms[0].roomheight, marginvert);	
	}
	else {
		rug_width = convertpix(rug_width_feet, rug_width_inches, roomdata.Rooms[0].pixelwidth, roomdata.Rooms[0].roomwidth, 0);
		rug_length = convertpix(rug_length_feet, rug_length_inches, roomdata.Rooms[0].pixellength, roomdata.Rooms[0].roomheight, 0);		
	}

		
	if(isrotated) {
		var tempsave = rug_width;
		rug_width = rug_length;
		rug_length = tempsave;
	}	
		
	if(roomdata.Rooms[0].Margins.HasMargins) {
		var marginhoriz = roomdata.Rooms[0].Margins.Left+roomdata.Rooms[0].Margins.Right;
		var marginvert = roomdata.Rooms[0].Margins.Top+roomdata.Rooms[0].Margins.Bottom;
		rug_posx = convertpix(rug_left_feet, rug_left_inches, roomdata.Rooms[0].pixelwidth, roomdata.Rooms[0].roomwidth, marginhoriz) + roomdata.Rooms[0].Margins.Left;
		rug_posy = convertpix(rug_top_feet, rug_top_inches, roomdata.Rooms[0].pixellength, roomdata.Rooms[0].roomheight, marginvert) + roomdata.Rooms[0].Margins.Top;
	}
	else {
		rug_posx = convertpix(rug_left_feet, rug_left_inches, roomdata.Rooms[0].pixelwidth, roomdata.Rooms[0].roomwidth, 0);
		rug_posy = convertpix(rug_top_feet, rug_top_inches, roomdata.Rooms[0].pixellength, roomdata.Rooms[0].roomheight, 0);
	}

	
	var rug_colour_hex = $("#color1").val();
	if(isHexaColor(rug_colour_hex)) {
		rug_colour = rug_colour_hex;
	}

	drawrug(rug_posx, rug_posy, rug_width, rug_length, rug_colour, rug_pattern);
	  
  //imageBG.src = roomdata.Patterns.Folder+'/'+roomdata.Rooms[0].background;
	
}

	

function init() {
	$('#myWizard').wizard();	

	$('#myWizard').on('stepclicked.fu.wizard', function (evt,data) {

		evt.preventDefault();
		currentStep = data.step;
		$('#myWizard').wizard('selectedItem', {
			step: currentStep
		});
		
		$( "ul.steps li" ).each(function() {
			  if(activeSteps.indexOf(parseInt($(this).attr("data-step"))) > -1) {
			   		//$(this).addClass("active");
				    $(this).addClass("complete");
			   }	

		});
	});
	
	
	$('#myWizard').on('actionclicked.fu.wizard', function (evt,data) {

		//Check the current step 
		currentStep = data.step;
		evt.preventDefault();
		
		if(data.direction == "next") {
			if($("#comment"+currentStep).val()=="") {
				$("#error"+currentStep).text("You must provide an explanation before you continue!");
			}
			else {
				$("#error"+currentStep).text("");
				if(currentStep == 5) {
					downloadpdf();
				}
				else {
					currentStep++;
					if(activeSteps.indexOf(currentStep) == -1) {
						activeSteps.push(currentStep);
					}
					$('#myWizard').wizard('selectedItem', {
						step: currentStep
					});
				}
			}
		}
		else {
			currentStep--;
			$('#myWizard').wizard('selectedItem', {
				step: currentStep
			});
		}

		$( "ul.steps li" ).each(function() {
			  if(activeSteps.indexOf(parseInt($(this).attr("data-step"))) > -1) {
			   		//$(this).addClass("active");
				    $(this).addClass("complete");
			   }	

		});		

	});
	
	drawroom();
	
	for(var p=0; p<patterndata.length; p++) {
		$("#patternselect").append('<a class="patternpreview" id="pattern'+p+'" href="javascript:selectpattern('+p+')"></a>');
		if(patterndata[p] !== "none") {
			$("#pattern"+p).css("background-image","url("+roomdata.Patterns.Folder+"/"+patterndata[p]+")");
		}
		else {
			$("#pattern"+p).addClass("selected");
		}
	}
	
}