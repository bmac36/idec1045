/*
Copyright © 2015 S. William & A.M. Pritchard
Licensed Under MIT
*/

(function( $ ){

    //Globals
	var clonedItems,
			clonedItemsOriginal,
			gridLayout,
			gridLayoutItems,
			temp = null,
			duration = 1000,
			s = null;

    /*
    Window Debounce Resize Function START
    Copyright © 2014 Louis-Rémi Babé - MIT Licensed - https://github.com/louisremi/jquery-smartresize
    */
    function on_resize(c,t){onresize=function(){clearTimeout(t);t=setTimeout(c,100)};return c};
    /*
    Window DeBounce Resize Function END
    */

	function resizeColumns() {
             var  pixelWidth = $('.b-by-b-item').width(),
                     columnsFloat = 100 / (parseInt(pixelWidth) / gridLayout.width() * 100),
                     columns = Math.round(columnsFloat);

             return columns;
	};

	 function resetColumns() {
		gridLayoutItems = gridLayout.children('.b-by-b-item');
		gridLayoutItems.remove();

		$(clonedItems).appendTo(gridLayout);
		gridLayoutItems.removeAttr('data-column');
		$('.single-column').remove();
	};

	function style(elems) {
        elems.css({
        'padding' : s.itemPadding,
        'margin-top' : s.itemMargin,
        'margin-bottom' : s.itemMargin,
        'box-sizing' : 'border-box'
        })
	};

	function createColumns(columns) {
				 //Create columns
				for(var i = 0; i < columns; i++) {
					gridLayout.prepend('<div class="single-column 1of' + columns + '"></div>')
				}

				//Add css to columns
				gridLayout.children('.single-column').css({
					'float' : 'left',
					'width' : 100 / columns + '%',
                    'padding-left' : s.itemMargin / 2,
                    'padding-right' : s.itemMargin / 2,
                    'box-sizing' : 'border-box'
				});

			gridLayoutItems = gridLayout.children('.b-by-b-item');
			style(gridLayoutItems);

			    //Populate data-column data tag to determine which column each content item belongs to
				for(var i = 0; i < columns; i++) {
					  gridLayoutItems.filter(function( index ) {
						return index % columns === i;
					}).attr('data-column', i);

				}

				//Append each content item to column
				$.each(gridLayoutItems , function(index, item) {
								var itemId = '#' + $(item).attr("id"),
										columnNo = $(item).attr('data-column'),
										colAddress = '.1of' + columns + ':eq(' + columnNo + ')';

								$(this).appendTo(colAddress);
				});

			$('.b-by-b-item').fadeIn(500);

	};

    function getLayout() {

        var layoutSelector;

        if (gridLayout.prop('id').length > 0) {
            layoutSelector = '#' + gridLayout.prop('id');
        } else {
            layoutSelector = '.' + gridLayout.prop('class');
        }

        $('head').append('<style>' + layoutSelector + ':after { content:""; display:table; clear:both; }</style>')

    };

    var methods = {
        init : function(options) {

            var columns, resizedColumns;

            s = $.extend({
                itemMargin : 5,
                itemPadding : 5
            }, options);

            $(this).children('div, section, article, img, a').addClass('b-by-b-item');
            gridLayout = $(this);
            gridLayoutItems = gridLayout.children('.b-by-b-item');
            gridLayout.css('width', '100%');

             clonedItems = gridLayoutItems.clone();
             temp = clonedItems;
             clonedItemsOriginal = gridLayoutItems.clone();

                    on_resize(function(){
                        if(!gridLayout.hasClass('no-grid')) {
                            resetColumns();
                            resizedColumns = resizeColumns();
                            createColumns(resizedColumns);
                        }
                    gridLayout.css('width', '100%');
                    });

                    $(window).resize();

            resetColumns();
            columns = resizeColumns();
            createColumns(columns);
            getLayout();

            return this;

        },

        addAfter : function(itemArray) {
			var columns;

			for(var i=0; i < itemArray.length; i++) {
				var newItem  = $(itemArray[i]).addClass('b-by-b-item');
                [].push.apply(temp, $.makeArray(newItem));
				[].push.apply(clonedItemsOriginal, $.makeArray(newItem));
			}

			clonedItems = $.grep(temp, function(n) { return typeof n !== "undefined"; });
			resetColumns();

			if(!gridLayout.hasClass('no-grid')) {
				columns = resizeColumns();
				createColumns(columns);
			} else{ style(gridLayout.children('.b-by-b-item')); }

		},

        addBefore : function(itemArray) {
			var columns;
			for(var i=0; i < itemArray.length; i++) {
					var newItem  = $(itemArray[i]).addClass('b-by-b-item');
					[].unshift.apply(clonedItemsOriginal, $.makeArray(newItem));
					[].unshift.apply(temp, $.makeArray(newItem));
			}

			clonedItems = $.grep(temp, function(n) { return typeof n !== "undefined"; });
			resetColumns();

			if(!gridLayout.hasClass('no-grid')) {
				columns = resizeColumns();
				createColumns(columns);
			} else { style(gridLayout.children('.b-by-b-item')); }

		},

        removeItems : function(array, removeFade) {
			var columns;
			if(typeof removeFade === "undefined") { removeFade = duration; }
			
			$.each(array, function(j, selector) {
				for(var i=0; i < clonedItemsOriginal.length; i++) {
					if($(clonedItemsOriginal[i]).is(selector)) {
						$(selector).animate({'opacity': 0}, removeFade);
						clonedItemsOriginal.splice(i,1); temp.splice(i, 1); i--;
					}
				}
			});

			clonedItems= $.grep(temp, function(n) { return typeof n !== "undefined"; });

			setTimeout(function() {
						resetColumns();
						if(!gridLayout.hasClass('no-grid')) {
							columns = resizeColumns();
							createColumns(columns);
						}
				}, removeFade + 1);
		},

        hideItems : function(array, hideFade) {
				var columns;
				if(typeof hideFade === "undefined") { hideFade = duration; }
				
				$.each(array, function(j, selector) {
					for(var i=0; i < temp.length; i++) {
						$(selector).animate({'opacity': 0}, hideFade);
						if($(temp[i]).is(selector)) { delete temp[i]; i--; }
					}
				});

			clonedItems= $.grep(temp, function(n) { return typeof n !== "undefined"; });

				setTimeout(function() {
						resetColumns();
						if(!gridLayout.hasClass('no-grid')) {
							columns = resizeColumns();
							createColumns(columns);
						}
				}, hideFade + 1);
		},

        showItems : function(array, showFade) {
			if(typeof showFade === "undefined") { showFade = duration; }
		
				var cio = clonedItemsOriginal, columns;
				$.each(array, function(j, selector) {
					for(var i=0; i < cio.length; i++) {
						if($(cio[i]).is(selector)) { temp[i] = cio[i]; }
					}
				});

			clonedItems = $.grep(temp, function(n) { return typeof n !== "undefined"; });
			resetColumns();
			$.each(array, function(l, s) { $(s).css('opacity', 0 ); });

			if(!gridLayout.hasClass('no-grid')) {
				columns = resizeColumns();
				createColumns(columns);
			}

			$.each(array, function(l, s) { $(s).animate({'opacity': 1 }, showFade); style($(s)); });

		},

        reload: function() {
			var columns;
			if(gridLayout.hasClass('no-grid')) {
				gridLayout.removeClass('no-grid');
				resetColumns();
				columns = resizeColumns();
				createColumns(columns);
			}
		},

        end: function() {
			if(!gridLayout.hasClass('no-grid')) {
				resetColumns();
				gridLayout.addClass('no-grid');
			}
		}

    };

    $.fn.layout = function(methodOrOptions) {
        if ( methods[methodOrOptions] ) {
            return methods[ methodOrOptions ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof methodOrOptions === 'object' || ! methodOrOptions ) {
            // Default to "init"
            return methods.init.apply( this, arguments );
        } else {
            $.error( 'Method ' +  methodOrOptions + ' does not exist in Brick by Brick JS' );
        }
    };

})( jQuery );
