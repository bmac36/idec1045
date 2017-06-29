'use strict';

var D2LnavHost = (function() {
    var instance = {},
        clientWindow = window.frames[0], // best guess; the client frame should contact us in time if this is not the right frame
        isClientCommunicationEstablished = false,

        NAV_CLIENT_HANDLER = 'd2l.nav.client',
        NAV_CUSTOMIZE_EVENT = 'd2l.nav.customize';

    instance.init = function (handler) {
        instance.overrideNavigation = handler;

        // Listen for messages from the child iframe then notify it that we are listening
        window.addEventListener("message", overrideNavigation, false);
        send('init');
    }

    // override() and restore() are utility methods for use by the caller of init()
    instance.override = function ($el, action) {
        var oldHandler = null;

        if ($el.length) {
            oldHandler = $el.attr('onclick');
            $el.removeAttr('onclick');
            $el.off('click').on('click', onClick(action));
        }

        return oldHandler;
    }

    instance.restore = function ($el, oldHandler) {
        $el.off('click');
        if (oldHandler) {
            $el.attr('onclick', oldHandler);
        }
    }

    function overrideNavigation(event) {
        try {
            var data = JSON.parse(event.data);

            if (data.handler !== NAV_CUSTOMIZE_EVENT) {
                return;
            }

            clientWindow = event.source;

            // if this is the first time the client window has reached us, let it know we're listening
            if (!isClientCommunicationEstablished) {
                isClientCommunicationEstablished = true;
                send('ack');
            }

            // nav host implementation must set instance.overrideNavigation by calling init()
            instance.overrideNavigation && instance.overrideNavigation(data);
        } catch (e) {
            D2L.LP.Web.UI.Html.JavaScript.Console.Warn('d2l-nav-host-base: not handling unexpected message posted by another window: ', event.data);
        }
    }

    function onClick(action) {
        return function (e) {
            e.preventDefault();
            send(action);
        }
    }

    function send(action) {
        // NB: payload must be stringified for IE
        clientWindow && clientWindow.postMessage(JSON.stringify({ action: action, handler: NAV_CLIENT_HANDLER }), '*');
    }

    return instance;
})();