/*
 * HTML5 Sortable jQuery Plugin
 * http://farhadi.ir/projects/html5sortable
 * 
 * Copyright 2012, Ali Farhadi
 * Released under the MIT license.
 */
(function($) {
var dragging, placeholders = $();
 $.support.touch = 'ontouchend' in document;
var scrollAni;
var dropped = false;
$.fn.sortable = function(options) {
	var method = String(options);
	options = $.extend({
		connectWith: false
	}, options);
	return this.each(function() {
		if (/^enable|disable|destroy$/.test(method)) {
			var items = $(this).children($(this).data('items')).attr('draggable', method == 'enable');
			if (method == 'destroy') {
				items.add(this).removeData('connectWith items')
					.off('dragstart.h5s dragend.h5s selectstart.h5s dragover.h5s dragenter.h5s drop.h5s');
			}
			return;
		}
		var isHandle, index, items = $(this).children(options.items);
		//d2log(items);
		var placeholder = $('<' + (/^ul|ol$/i.test(this.tagName) ? 'li' : 'div') + ' class="sortable-placeholder">');

		if(SequencingApp.AppData.layoutStyle ==="horizontal"){
				$(placeholder).addClass('horizontal');
			}



		items.find(options.handle).mousedown(function() {
			isHandle = true;
		}).mouseup(function() {
			isHandle = false;
		});
		$(this).data('items', options.items);
		placeholders = placeholders.add(placeholder);
		if (options.connectWith) {
			$(options.connectWith).add(this).data('connectWith', options.connectWith);
		}


$.fn.hitTest = function(x, y){
	
    var bounds = $(this).offset();
    bounds.right = bounds.left + this.innerWidth();
    bounds.bottom = bounds.top + this.innerHeight();

    if(x >= bounds.left){
        if(x <= bounds.right){
            if(y >= bounds.top){
                if(y <= bounds.bottom){
                    return true;
                }
            }
        }
    }
    return false;
}

var mouse_x;
var mouse_y;

		items.attr('draggable', 'true').on('touchstart', function(e) {
			SequencingApp.prevIndex = $(this).index();
			e.preventDefault();
         
			if(e.originalEvent.touches === undefined || e.originalEvent.touches.length>1){
				return;
			}

			for(var i=0;i<$('#sortList').children('li').length;i++){
				$('#sortItem'+i).attr('aria-hidden', true);
			}
			var orig = e.originalEvent;
					dragging = this
					$(this).data('index',$(this).addClass('sortable-dragging').index());
					$(this).children('.feedbackBar').css('display','none');
					$('.sortable-placeholder').remove();
					if(SequencingApp.AppData.layoutStyle ==="horizontal"){
						$('.sortable-placeholder').addClass('horizontal');
						$(this).addClass('horizontal');
					}else{
						$('.sortable-placeholder').addClass('vertical');
						$(this).addClass('vertical');
						$(this).width($('#placeholderContent li').width())
					}
					var dragOBJ = $('#'+$(this).attr('id'));
					$('<li class="sortable-placeholder"></li>').insertBefore(dragOBJ);
					if(SequencingApp.AppData.layoutStyle ==="horizontal"){
						$('.sortable-placeholder').css('float','left');
					}
					
					$('.sortable-placeholder').css('margin-left',$(dragging).css('margin-left'))
					$('.sortable-placeholder').css('margin-right',$(dragging).css('margin-right'))
					$('.sortable-placeholder').css('margin-top',$(dragging).css('margin-top'))
					$('.sortable-placeholder').css('margin-bottom',$(dragging).css('margin-bottom'))
					//alert($('.sortable-placeholder').index())

					if(SequencingApp.AppData.layoutStyle ==="horizontal"){
						$('.sortable-placeholder').addClass('horizontal');
						$('.sortable-placeholder').css('margin-top',$(dragging).css('margin-top'))
						$('.sortable-placeholder').height($(dragging).height());
						$('.sortable-placeholder').width($(dragging).outerWidth());
						$('.sortable-placeholder').css('margin-bottom','5px !important');
					}else{ 
   					//$('.sortable-placeholder').height($(dragging).innerHeight());
   					$('.sortable-placeholder').height($(dragging).height());
   					$('.sortable-placeholder').width($('#placeholderContent li').outerWidth());
   					$('.sortable-placeholder').css('padding-left','0px');
   					$('.sortable-placeholder').css('padding-right','0px');
				   }

					
					
					locY = (orig.changedTouches[0].pageY - ($(dragging).height() / 2) + 'px')
					locX = (orig.changedTouches[0].pageX - ($(dragging).width() /2)*2 + 'px')
					$('body').append($(this));
					//$('.sortItem.vertical').css('display','block');

					$(this).css('z-index','99999')
					if(SequencingApp.AppData.layoutStyle ==="vertical"){
						$(dragging).css({
       					position:"absolute",
   	    				top:locY,
   	    				left:$('#sortList').position().left
  					   });
  				   	mouse_X = locX;
					}else{
					 $(this).css({
    				    position:"absolute",
		    		    top: (orig.changedTouches[0].pageY - ($(dragging).height() / 2) + 'px'),
    				    left: (orig.changedTouches[0].pageX - ($(dragging).width() / 2) + 'px')
  				    });
  					  mouse_X = locX;
  					  mouse_y = locY;
  				   }

		});
		var lastX 
		var lastY;
		SequencingApp.prevIndex;

		items.attr('draggable', 'true').on('touchmove', function(e) {
			//if(e.originalEvent.touches.length>1){ Commented this out as it breaks 2 finger drag on android.
			//	$(dragging).trigger('touchend');
			//	return;
			//}
			  e.preventDefault();

			var orig = e.originalEvent;
			var hitterTest = false;
			var hitObject;
			var offsetX = $(window).scrollLeft();
			var offsetY = $(window).scrollTop();
			var direction;
			var tmpIndex;

			if(SequencingApp.AppData.layoutStyle ==="vertical"){

				$(this).css({
    				position:"absolute",
	    			top: (orig.changedTouches[0].pageY - ($(dragging).height() / 2) + 'px')
    				//left: (orig.changedTouches[0].pageX - ($(dragging).width() / 2) + 'px')
  				});
			}else{
				$(this).css({
    				position:"absolute",
		    		top: (orig.changedTouches[0].pageY - ($(dragging).height() / 2) + 'px'),
    				left: (orig.changedTouches[0].pageX - ($(dragging).width() / 2) + 'px')
  				});
			}
			var offsetX = $(window).scrollLeft();
			var offsetY = $(window).scrollTop();
			for(var i=0;i<$('#sortList').children('li').length;i++){
				hitterTest = $('#sortItem'+i).hitTest((orig.changedTouches[0].clientX+offsetX),(orig.changedTouches[0].clientY+offsetY));
				if(hitterTest ==true  && $('#sortItem'+i).attr('id')!=$(dragging).attr('id')){
					hitObject = $('#sortItem'+i);
					tmpIndex = hitObject.index();
					break;
				}
			}
			//d2log((orig.changedTouches[0].screenY+offsetY) +" "+this.scrollHeight)
			var currentY = e.originalEvent.touches ? e.originalEvent.touches[0].pageY : e.pageY;
			var directionY;
			var directionX;
    				if (currentY > lastY) {
        				directionY ='down'
    				} else {
        				directionY = 'up'
    				}
    				lastY = currentY;
    				
			if(hitObject){

				//scrollAni = $(window.top.document.body).stop().animate({ scrollTop: $(hitObject).offset().top-20  }, 3000);

				if(SequencingApp.AppData.layoutStyle ==="vertical"){
					$('.sortable-placeholder').remove();
					
				/*	var currentY = e.originalEvent.touches ? e.originalEvent.touches[0].pageY : e.pageY;
    				if (currentY > lastY) {
        				direction ='down'
    				} else {
        				direction = 'up'
    				}
    				lastY = currentY;*/
    				//d2log(directionY)
						if(directionY=='down'){
							$('.sortable-placeholder').remove();
							$('<li class="sortable-placeholder"></li>').insertAfter(hitObject);
						}else{
							$('<li class="sortable-placeholder"></li>').insertBefore(hitObject);
						}

						//$('.sortable-placeholder').height($(dragging).height()+10);
						//$('.sortable-placeholder').width($(dragging).outerWidth());
					$('.sortable-placeholder').css('margin-top',$(dragging).css('margin-top'))
					$('.sortable-placeholder').css('margin-bottom',$(dragging).css('margin-bottom'));
					$('.sortable-placeholder').css('padding-left','0px');
					$('.sortable-placeholder').css('padding-right','0px');
					$('.sortable-placeholder').height($(dragging).innerHeight());
				//	alert(">")

					if(SequencingApp.AppData.layoutStyle ==="horizontal"){
						$('.sortable-placeholder').addClass('horizontal');
					}else{
						$('.sortable-placeholder').addClass('vertical');
					}
					$('.sortable-placeholder').height($(dragging).height());
					$('.sortable-placeholder').width($(dragging).outerWidth());
					return
				}

				if(SequencingApp.AppData.layoutStyle ==="horizontal"){
					$('.sortable-placeholder').remove();
					var currentX = e.originalEvent.touches ? e.originalEvent.touches[0].pageX: e.pageX;
    				if (currentX > lastX) {
        				directionX ='right'
    				} else {
        				directionX = 'left'
    				}
    				lastX = currentX;
				

					if(hitObject){
						if(directionX=='right'){	
								$('<li class="sortable-placeholder"></li>').insertAfter(hitObject);
							}else{
								if((tmpIndex)===($('.sortItem').length-1)){
									$('<li class="sortable-placeholder"></li>').insertAfter(hitObject);	
								}else{
									$('<li class="sortable-placeholder"></li>').insertBefore(hitObject);
								}	
							}
							$('.sortable-placeholder').height($(dragging).height());
							$('.sortable-placeholder').width($(dragging).outerWidth());
							if(SequencingApp.AppData.layoutStyle ==="horizontal"){
								$('.sortable-placeholder').addClass('horizontal');
							}else{
								$('.sortable-placeholder').addClass('vertical');
							}
							$('.sortable-placeholder').addClass('horizontal');
							$('.sortable-placeholder').css('margin-top',$(dragging).css('margin-top'));
							$('.sortable-placeholder').height($(dragging).innerHeight());
							$('.sortable-placeholder').css('margin-bottom','5px !important');
						}
					}
				}
			});
		
		items.attr('draggable', 'true').on('touchend', function(e) {
			//d2log('dragover')
			//d2log($("#sortList li").children().length);

			if(scrollAni){
				scrollAni.stop();
			}

			$(this).children('.feedbackBar').css('display','block');
			$(this).width('');
			var nextItem = $("#sortList li").get($(this).data('index'));

			if($(this).data('index')===$("#sortList").children().length){

				$("#sortList").append(this);
				$(this).css({
    				position:""
  				});
			}else{

				$(this).insertBefore('.sortable-placeholder');
				$('.sortable-placeholder').remove();
			
				//$(this).css('margin-top','39px')
				$(this).css({
    				position:""
  				});
			}
			$(this).removeClass('sortable-dragging');
			setTimeout(function(){
				$('.sortable-placeholder').remove();
				$('li').removeClass('sortable-dragging');
				if(SequencingApp.AppData.FeedbackType !=="continuous"){
					$('#sortList li').each(function(index, element){
						$(element).attr('aria-label', $('#placeholder'+$(element).index()+" div").children('div').text()+" "+$(element).children().text());
						$(element).attr('aria-posinset',($(element).index()+1)); 
						$(element).children().attr('aria-label',$(element).attr('aria-label'));
						//d2log($(element).attr('id')+" "+$(element).children().attr('aria-label'))
					});
				}
			},0);
			for(var i=0;i<$('#sortList').children('li').length;i++){
				$('#sortItem'+i).attr('aria-hidden', false);
			}
			$(this).append('<div id="ariaAlert" role="alert" aria-live="assertive" style="left:9999;position:absolute"> You moved the tile from '+SequencingApp.AppData.sortItems[(SequencingApp.prevIndex)].placeHolderText+" to "+ SequencingApp.AppData.sortItems[($(this).index())].placeHolderText+'</div>');
			$(this).focus();
			

			if(SequencingApp.AppData.FeedbackType ==="continuous"  ||SequencingApp.isRetry==true){
				SequencingApp.checkContinuousAnswers();
			}
			setTimeout(function(e){
				$(dragging).focus();
					dragging = null;
				$('#ariaAlert').remove();
			},1000);
		});

/* end of mobile functionality */

		items.attr('draggable', 'true').on('dragstart.h5s ', function(e) {
			SequencingApp.prevIndex = $(this).index();
			if (options.handle && !isHandle) {
				return false;
			}
			d2log($(this));
			isHandle = false;
			//if(document.body.getAttribute('browser')==="firefox"){
			var dt = e.originalEvent.dataTransfer;
				dt.effectAllowed = 'move';
				dt.setData('Text', '');
			//}

			for(var i=0;i<$('#sortList').children('li').length;i++){
				$('#sortItem'+i).attr('aria-hidden', true);
			}
			$(this).width($('#placeholderContent li').width());
			index = (dragging = $(this)).addClass('sortable-dragging').index();
			$('.sortItem.vertical').css('display','block');
			$(this).children('.feedbackBar').css('display','none');
			
		}).on('dragend', function(e) {
			//d2log('stopDrag')
			e.preventDefault();
			if(scrollAni){
				scrollAni.stop();
			}
			
				//d2log(dropped);
				//d2log(dragging.parent().id)
				dropped = true;
			//return
			d2log(dragging);
			dragging.removeClass('sortable-dragging').show();
			placeholders.detach();
			$(this).width('');
			if (index !== dragging.index()) {
				items.parent().trigger('sortupdate', {item: dragging});
			}
			//dragging = null;
			setTimeout(function(){
				$(dragging).css('display','block');
				//dragging = null;
			},0);
			
			$(this).children('.feedbackBar').css('display','block');
			$('.sortItem').each(function(index, element){
				$(element).attr('aria-label',$('#placeholder'+index).text()+' '+$($(element).children()[0]).text());
			});
			for(var i=0;i<$('#sortList').children('li').length;i++){
				$('#sortItem'+i).attr('aria-hidden', false);
			}
			$(this).append('<div id="ariaAlert" role="alert" aria-atomic="true" aria-live="assertive" style="left:0;position:absolute"> You moved the tile from '+SequencingApp.AppData.sortItems[(SequencingApp.prevIndex)].placeHolderText+" to "+ SequencingApp.AppData.sortItems[($(this).index())].placeHolderText+'</div>');

			setTimeout(function(e){
				//$(dragging).focus();
				//dragging = null;
				$('#ariaAlert').remove();

			},500)
			setTimeout(function(e){
				$(dragging).focus();
				
			},5000)
			if(SequencingApp.AppData.FeedbackType ==="continuous" ||SequencingApp.isRetry==true){
				SequencingApp.checkContinuousAnswers();
			}
			dragging = null;
			
			$('#sortList li.vertical img').each(function(index, element){
				$(element).css('margin-top',($('.sortItem').height()/2)-($(element).height()/2))
				$(element).css('margin-bottom',$('.placeholderTitle').outerHeight()+'px');
			});
		}).not('a[href]').on('selectstart.h5s', function() {
			if(document.body.getAttribute('browser')==='ie' && document.body.getAttribute('browserversion')==='9.0'){
				this.dragDrop && this.dragDrop();
				return false;
			}
		}).end().add([this, placeholder]).on('dragover.h5s dragenter.h5s drop.h5s', function(e) {

			if (!items.is(dragging) && options.connectWith !== $(dragging).parent().data('connectWith')) {
				return true;
			}
			if($('body').attr('browser')=='firefox'){
				if(SequencingApp.AppData.layoutStyle ==="vertical"){
					if($('.sortable-placeholder').offset()){
						if(($(parent.document).find('.d2l-iframe')[0] !== undefined) && ($('.sortable-placeholder').offset().top+($(parent.document).find('.d2l-iframe')[0].offsetTop-$(window.top).scrollTop()))>($(window.top).height()-250)){
				 			scrollAni =  $(window.top.document.documentElement).stop(true).animate({ scrollTop: $(window.top).scrollTop()+5}, 0);
						}else if(($(parent.document).find('.d2l-iframe')[0] !== undefined) &&  ($('.sortable-placeholder').offset().top+($(parent.document).find('.d2l-iframe')[0].offsetTop-$(window.top).scrollTop()))<(150)){
							scrollAni =  $(window.top.document.documentElement).stop(true).animate({ scrollTop: $(window.top).scrollTop()-5}, 0);
						}else{
							if(scrollAni){
								scrollAni.stop();
							}
						}
					}
				}else{
					if($('.sortable-placeholder').offset()){
						if(($(parent.document).find('.d2l-iframe')[0] !== undefined) && (e.originalEvent.offsetY+$('.sortable-placeholder').height())+($(parent.document).find('.d2l-iframe')[0].offsetTop-$(window.top).scrollTop())>($(window.top).height()-150)){
							scrollAni =  $(window.top.document.documentElement).stop(true).animate({ scrollTop: $(window.top).scrollTop()+5}, 0);
						}else if(($(parent.document).find('.d2l-iframe')[0] !== undefined) &&(e.originalEvent.pageY)+($(parent.document).find('.d2l-iframe')[0].offsetTop-$(window.top).scrollTop())<(50)){
							scrollAni =  $(window.top.document.documentElement).stop(true).animate({ scrollTop: $(window.top).scrollTop()-5}, 0);
						}else{
							if(scrollAni){
								scrollAni.stop();
							}
						}
					}
				}
			}
			if($('.sortable-placeholder').length>0){
				if($('body').attr('browser')=='ie'){
					if((e.originalEvent.clientY-$(window.top).scrollTop())>=($(window.top).height()-100)){
						scrollAni =  $(window.top.document.documentElement).stop(true).animate({ scrollTop: $(window.top).scrollTop()+1}, 0);
					}else if((e.originalEvent.clientY)<=(100)){
						scrollAni =  $(window.top.document.documentElement).stop(true).animate({ scrollTop: $(window.top).scrollTop()-1}, 0);
					}else{
						if(scrollAni){
							scrollAni.stop();
						}
					}
				}
			}

			if (e.type == 'drop') {
				e.preventDefault();
				e.stopPropagation();
				placeholders.filter(':visible').after(dragging);
				return false;
			}

			e.preventDefault();
			e.originalEvent.dataTransfer.dropEffect = 'move';

			if (items.is(this)) {

				if (options.forcePlaceholderSize) {
					//$('.sortable-placeholder').html($(dragging).html())
					if(SequencingApp.AppData.layoutStyle ==="horizontal"){
						$('.sortable-placeholder').addClass('horizontal');
					}else{
						$('.sortable-placeholder').addClass('vertical');
					}
				}

				dragging.hide();
				$(dragging).css('display','none');

				setTimeout(function(){
				$('.sortItem').not(dragging).css('display','');
			},0);
				$(this)[placeholder.index() < $(this).index() ? 'after' : 'before'](placeholder);
				placeholders.not(placeholder).detach();
				if(SequencingApp.AppData.layoutStyle ==="horizontal"){
						$('.sortable-placeholder').addClass('horizontal');
						$('.sortable-placeholder').css('margin-top',$(dragging).css('margin-top'));
						$('.sortable-placeholder').height($(dragging).height());
						$('.sortable-placeholder').css('margin-bottom',$(dragging).css('margin-bottom'));
					}else{
						/*$('.sortable-placeholder').addClass('vertical');
						$('.sortable-placeholder').height($(dragging).height());
						$('.sortable-placeholder').width($(dragging).outerWidth());
						$('.sortable-placeholder').css('margin-top',$(dragging).css('margin-top'));*/
					//	$('.sortable-placeholder').css('margin-bottom',0);
				//	setTimeout(function(){
			$('.sortable-placeholder').height($(dragging).innerHeight());
			$('.sortable-placeholder').width($(dragging).width());
			$('.sortable-placeholder').css('margin-top',$(dragging).css('margin-top'));
			$('.sortable-placeholder').css('margin-bottom',0);
			$('.sortable-placeholder').css('padding-left','0px');
			$('.sortable-placeholder').css('padding-right','0px');
		//},500);

					}
				
			} else if (!placeholders.is(this) && !$(this).children(options.items).length) {
				placeholders.detach();
				$(this).append(placeholder);
			}

			return false;
		});
	});

};


})(jQuery);
