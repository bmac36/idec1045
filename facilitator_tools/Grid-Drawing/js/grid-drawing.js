  var textselect = [];
  var textcurrent = -1;
  var colorcurrent = "#000000";
  var canvas, context, canvaso, contexto;

  // The active tool instance.
  var tool;
  var tool_default = 'pencil';

  function init () {
	
	$(".texturetitle").text(appdata.Textures[textcurrent].Title);
	$("#answerimage").html('<img src="img/'+appdata.Textures[textcurrent].ImgFile+'" class="img-responsive">');
	setColor(1, "000000");	  
    // Find the canvas element.
    canvaso = document.getElementById('imageView');
    if (!canvaso) {
      alert('Error: I cannot find the canvas element!');
      return;
    }

    if (!canvaso.getContext) {
      alert('Error: no canvas.getContext!');
      return;
    }

    // Get the 2D canvas context.
    contexto = canvaso.getContext('2d');
    if (!contexto) {
      alert('Error: failed to getContext!');
      return;
    }

    // Add the temporary canvas.
    var container = canvaso.parentNode;
    canvas = document.createElement('canvas');
    if (!canvas) {
      alert('Error: I cannot create a new canvas element!');
      return;
    }

    canvas.id     = 'imageTemp';
    canvas.width  = canvaso.width;
    canvas.height = canvaso.height;
    container.appendChild(canvas);

    context = canvas.getContext('2d');

    // Get the tool select input.
    var tool_select = document.getElementById('dtool');
    if (!tool_select) {
      alert('Error: failed to get the dtool element!');
      return;
    }
    tool_select.addEventListener('change', ev_tool_change, false);

    // Activate the default tool.
    if (tools[tool_default]) {
      tool = new tools[tool_default]();
      tool_select.value = tool_default;
    }

    // Attach the mousedown, mousemove and mouseup event listeners.
    canvas.addEventListener('mousedown', ev_canvas, false);
    canvas.addEventListener('mousemove', ev_canvas, false);
    canvas.addEventListener('mouseup',   ev_canvas, false);
  }

  // The general-purpose event handler. This function just determines the mouse 
  // position relative to the canvas element.
  function ev_canvas (ev) {

    // Call the event handler of the tool.
    var func = tool[ev.type];
    if (func) {
      func(ev);
    }
  }

  // The event handler for any changes made to the tool selector.
  function ev_tool_change (ev) {
    if (tools[this.value]) {
      tool = new tools[this.value]();
    }
  }

  // This function draws the #imageTemp canvas on top of #imageView, after which 
  // #imageTemp is cleared. This function is called each time when the user 
  // completes a drawing operation.
  function img_update () {
		contexto.drawImage(canvas, 0, 0);
		context.clearRect(0, 0, canvas.width, canvas.height);
  }

  // This object holds the implementation of each drawing tool.
  var tools = {};

  // The drawing pencil.
  tools.pencil = function () {
    var tool = this;
    this.started = false;
	 
    // This is called when you start holding down the mouse button.
    // This starts the pencil drawing.
    this.mousedown = function (ev) {
        context.beginPath();
		context.strokeStyle = colorcurrent;
        context.moveTo(ev.offsetX, ev.offsetY);
        tool.started = true;
    };

    // This function is called every time you move the mouse. Obviously, it only 
    // draws if the tool.started state is set to true (when you are holding down 
    // the mouse button).
    this.mousemove = function (ev) {
      if (tool.started) {
        context.lineTo(ev.offsetX, ev.offsetY);
        context.stroke();
      }
    };

    // This is called when you release the mouse button.
    this.mouseup = function (ev) {
      if (tool.started) {
        tool.mousemove(ev);
        tool.started = false;
        img_update();
      }
    };
  };

  // The rectangle tool.
  tools.rect = function () {
    var tool = this;
    this.started = false;

    this.mousedown = function (ev) {
      tool.started = true;
      tool.x0 = ev.offsetX;
      tool.y0 = ev.offsetY;
    };

    this.mousemove = function (ev) {
      if (!tool.started) {
        return;
      }

      var x = Math.min(ev.offsetX,  tool.x0),
          y = Math.min(ev.offsetY,  tool.y0),
          w = Math.abs(ev.offsetX - tool.x0),
          h = Math.abs(ev.offsetY - tool.y0);

      context.clearRect(0, 0, canvas.width, canvas.height);

      if (!w || !h) {
        return;
      }
		
	  context.strokeStyle = colorcurrent;
	  context.lineWidth = 2;
      context.strokeRect(x, y, w, h);
    };

    this.mouseup = function (ev) {
      if (tool.started) {
        tool.mousemove(ev);
        tool.started = false;
        img_update();
      }
    };
  };

  // The line tool.
  tools.line = function () {
    var tool = this;
    this.started = false;

    this.mousedown = function (ev) {
      tool.started = true;
      tool.x0 = ev.offsetX;
      tool.y0 = ev.offsetY;
    };

    this.mousemove = function (ev) {
      if (!tool.started) {
        return;
      }

      context.clearRect(0, 0, canvas.width, canvas.height);

      context.beginPath();
      context.moveTo(tool.x0, tool.y0);
      context.lineTo(ev.offsetX,   ev.offsetY);
	  context.strokeStyle = colorcurrent;
	  context.lineWidth = 2;
      context.stroke();
      context.closePath();
    };

    this.mouseup = function (ev) {
      if (tool.started) {
        tool.mousemove(ev);
        tool.started = false;
        img_update();
      }
    };
  };


function clearCanvas() {
	context.clearRect(0, 0, canvas.width, canvas.height);
	contexto.clearRect(0, 0, canvas.width, canvas.height);
}

function checkAnswer() {
	$("#answercover").animate({
		left:"960px"
	}, function(){
		
	});
}

function nextTexture() {
	$("#answercover").animate({
		left:"0px"
	}, function() {
		selectTexture();
		context.clearRect(0, 0, canvas.width, canvas.height);
		contexto.clearRect(0, 0, canvas.width, canvas.height);
		init();
	});
}

function selectTexture() {
	if(textselect.length > 0) {
		var textindex = Math.floor((Math.random() * (textselect.length)));
		textcurrent = textselect[textindex];
		textselect.splice(textindex,1);
		
		if(textselect.length == 0) {
			$("#textNext").addClass("disabled");
			$("#textNext").removeAttr("onClick");
		}
		
	}
	else {
		
	}
}

function setColor(index, hex) {
	$('.colorselect').removeClass('selected');
	$('#color'+index).addClass('selected');
	colorcurrent = "#"+hex;
}

$(document).ready(function () {
	$.getJSON( "data/"+datafilename, function( data ) {
	  	appdata = data;
		
		for(var i=0; i<appdata.Textures.length; i++) {
			textselect.push(i);
		}
		
		selectTexture();
		init();
	});
});