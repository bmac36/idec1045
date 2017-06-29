        $('body').on('click', function (e) {
          $('[data-toggle="popover"]').each(function () {
            //the 'is' for buttons that trigger popups
            //the 'has' for icons within a button that triggers a popup
            if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
              $(this).popover('hide');
            }
          });
        });
// Modal dynamic centering // =================================================== //
function modalCentering(){$(".modal").each(function(){$(this).hasClass("in")===!1&&$(this).show();{var i=$(window.parent,window.parent.document).height()-60,o=($(this).find(".modal-header").outerHeight()||2,$(this).find(".modal-footer").outerHeight()||2,$(this).find(".modal-content").outerHeight()),t=($(this).find(".modal-dialog").offset().top,window.top.pageYOffset);$(window).height()}$(this).find(".modal-dialog").addClass("modal-dialog-center").css({"margin-top":function(){return 0>(i-o)/2+t-230?0:(i-o)/2+t-230<$(window).height()-o?(i-o)/2+t-230:void 0},top:"",left:""}),$(this).hasClass("in")===!1&&$(this).hide()})}$(".modal").on("shown.bs.modal",function(){modalCentering()});