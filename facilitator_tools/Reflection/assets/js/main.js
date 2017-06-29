// Do not remove the following or lots of code will break
var D2LAUTH = true;

// Tooltips and Popovers // 
$('.tooltips-link').tooltip();
$('.popovers-link').popover({
   html: true
}); // enable html in popover

$('body').on('click', function(e) {
   $('[data-toggle="popover"]').each(function() {
      //the 'is' for buttons that trigger popups
      //the 'has' for icons within a button that triggers a popup
      if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
         $(this).popover('hide');
      }
   });
});


// Add/Remove active class from anchor in graphic tab
// Used to set font color of active tab
$('.graphic-tab a').click(function() {
   $('a.active').removeClass('active');
   $(this).addClass('active');
});
