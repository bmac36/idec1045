'use strict';

$(function () {
    var d2lNextClickHandler,
		d2lPrevClickHandler,

        D2L_NEXT_BUTTON_SELECTOR = '.d2l-iterator-button-next, .mobile_next',
        D2L_PREV_BUTTON_SELECTOR = '.d2l-iterator-button-prev, .mobile_prev';

    D2LnavHost.init(overrideNavigation);

    function overrideNavigation(data) {
        var $next = $(D2L_NEXT_BUTTON_SELECTOR),
            $prev = $(D2L_PREV_BUTTON_SELECTOR);

        // Restore nav actions, then override just the requested ones
        D2LnavHost.restore($next, d2lNextClickHandler);
        D2LnavHost.restore($prev, d2lPrevClickHandler);

        if (data.hasNext) {
            d2lNextClickHandler = D2LnavHost.override($next, 'next');
        }

        if (data.hasPrev) {
            d2lPrevClickHandler = D2LnavHost.override($prev, 'prev');
        }
    }
});