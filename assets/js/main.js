// Tooltips and Popovers // 
// =================================================== // 
$('.tooltips-link').tooltip();
        $('.popovers-link').popover({
            html: true
        }); // enable html in popover

        $('body').on('click', function (e) {
            $('[data-toggle="popover"]').each(function () {
                //the 'is' for buttons that trigger popups
                //the 'has' for icons within a button that triggers a popup
                if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
                    $(this).popover('hide');
                }
            });
        });
// Script for Accordions // 
// =================================================== // 
        $('.panel-collapse').on('show.bs.collapse', function () {
            var title_elem = $(this).parent('.panel-default').find('.panel-title');
            $('.panel-title').removeClass('active');
            $('.collapse.in').collapse('hide');
            title_elem.addClass('active');
            setIconOpened(title_elem);
        });

        $('.panel-collapse').on('hide.bs.collapse', function () {
            var title_elem = $(this).parent('.panel-default').find('.panel-title');
            title_elem.removeClass('active');
            setIconOpened(null);

        });

        // create a function to set the open icon for the given panel
        // clearing out all the rest (activePanel CAN be null if nothing is open)
        function setIconOpened(activePanel) {
            $('.panel-title').find('b').addClass('closed').removeClass('opened');

            if (activePanel) {
                $(activePanel).find('b').addClass('opened').removeClass('closed');
            }
        }
// Double Accordion // 
// =================================================== // 
