        $('body').on('click', function (e) {
          $('[data-toggle="popover"]').each(function () {
            //the 'is' for buttons that trigger popups
            //the 'has' for icons within a button that triggers a popup
            if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
              $(this).popover('hide');
            }
          });
        });


// Modal dynamic centering
  // =================================================== //
        function modalCentering() {
  $('.modal').each(function(){
 
    if($(this).hasClass('in') === false){
        $(this).show();
    }
 
    var contentHeight = $(window.parent, window.parent.document).height() - 60;
    var headerHeight = $(this).find('.modal-header').outerHeight() || 2;
    var footerHeight = $(this).find('.modal-footer').outerHeight() || 2;
    var modalHeight = $(this).find('.modal-content').outerHeight();
    var modalYPosition = $(this).find('.modal-dialog').offset().top;
    var windowPageYOffset = window.top.pageYOffset;
    var windowHeight = $(window).height();
 
    $(this).find('.modal-dialog').addClass('modal-dialog-center').css({
        'margin-top': function () {
 
             if ( (((contentHeight - modalHeight) / 2) + windowPageYOffset - 230) < 0) {
                    return 0;
             } else if((((contentHeight - modalHeight) / 2) + windowPageYOffset - 230) < $(window).height() - modalHeight ) {
                    return (( (contentHeight - modalHeight) / 2) + windowPageYOffset - 230);
             }
 
        },
      'top': '',
      'left': ''
    });
    if($(this).hasClass('in') === false){
        $(this).hide();
    }
  });
  }
       
    $('.modal').on('shown.bs.modal', function() {
      modalCentering();
  });

 
// Modal End
  // =================================================== //
   