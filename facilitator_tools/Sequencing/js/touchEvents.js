
(function ($) {
    // Detect touch support
    $.support.touch = 'ontouchend' in document;
    // Ignore browsers without touch support
    if (!$.support.touch) {
    return;
    };

    $.fn.touchEvent = function(options){
        console.log("?");
    }
})(jQuery);
