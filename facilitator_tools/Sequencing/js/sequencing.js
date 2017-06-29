/**
 * Contains all of the functionality for Sequencing Vanilla.
 *
 * @class SequencingApp
 */

var D2LDEBUG = false;

var SequencingApp = {
    headingLevel: null,
    reportData: [],
    totalsortItems: 0,
    userResult: [],
    activityStatus: 'intro',
    usersSequence: '',
    sortOrderList: [],
    isRetry: false,
    noPost: false
};

/**
 * Sets up the Sequencing app
 *
 * @method setupApp
 * @param {string} file
 * @param {string} location
 * @return {} Logs on error
 */
SequencingApp.setupApp = function(file, location) {
    questionFile = file;
    if (document.getElementById(location) !== null) {
        SequencingApp.containerRef = document.getElementById(location);
        SequencingApp.getAppData(SequencingApp.buildApp);
    } else {
        d2log('Error! Missing Proper DOM object.');
    }
};

/**
 * Gets the Sequencing app data from the JSON file
 *
 * @method getAppData
 * @param {object} callback
 * @return {} If the json data fails, inform the users and give some data to developers using the debug console.
 */
SequencingApp.getAppData = function(callback) {
    var jqxhr = $.getJSON(questionFile, function(data) {
        SequencingApp.AppData = data;
        d2log(SequencingApp.AppData);
        callback(SequencingApp.AppData);
    });

    jqxhr.fail(function(e) {
        d2log('ERROR!!: failed to load data from specified file. Ensure file is at that location and that JSON data is vaild. (tip: use a vaildator like: http://jsonformatter.curiousconcept.com/ )');
        d2log(e);
    });
};

/**
 * Controller that builds the Sequencing app
 *
 * @method buildApp
 * @return {}
 */
SequencingApp.buildApp = function() {
    SequencingApp.headingLevel = parseInt(SequencingApp.AppData.HeadingLevel);
    if (SequencingApp.headingLevel === null ||
        SequencingApp.headingLevel === undefined ||
        SequencingApp.headingLevel === 'none' ||
        isNaN(SequencingApp.headingLevel) ||
        SequencingApp.headingLevel === '') {
        SequencingApp.headingLevel = 1;
    } else if (SequencingApp.headingLevel > 3) {
        SequencingApp.headingLevel = 3;
    }

    if (SequencingApp.AppData.layoutStyle !== 'horizontal') {
        SequencingApp.AppData.layoutStyle = 'horizontal'
    }

    if (SequencingApp.AppData.placholderTitleStyle !== 'box') {
        SequencingApp.AppData.placholderTitleStyle = 'box'
    }

    if (SequencingApp.AppData.PostActivityText === 'none' ||
        SequencingApp.AppData.PostActivityText === '' ||
        SequencingApp.AppData.PostActivityText === null ||
        SequencingApp.AppData.PostActivityText === undefined) {
        if (SequencingApp.AppData.PostActivityMedia === 'none' ||
            SequencingApp.AppData.PostActivityMedia === '' ||
            SequencingApp.AppData.PostActivityMedia === null ||
            SequencingApp.AppData.PostActivityMedia === undefined) {
            SequencingApp.noPost = true;
        }
    }

    SequencingApp.buildAppFrame();
    if (SequencingApp.AppData.PreActivityText === 'none') {
        if (SequencingApp.AppData.PreActivityMedia === 'none') {
            SequencingApp.buildActivity();
        } else {
            SequencingApp.buildPreActivity();
        }
    } else {
        SequencingApp.buildPreActivity();
    }
    SequencingApp.loadButtons();

    $(SequencingApp.containerRef).addClass('rs_preserve');
};

/**
 * Builds the Sequencing app outer frame
 *
 * @method buildAppFrame
 * @return {}
 */
SequencingApp.buildAppFrame = function() {
    var SEQ_container = document.createElement('section');
    SEQ_container.id = 'SEQ_container';
    var SEQ_content = document.createElement('section');
    SEQ_content.id = 'SEQ_content';
    var SEQ_header = document.createElement('section');
    SEQ_header.id = 'SEQ_header';
    $(SEQ_header).addClass('bg-dark');
    SEQ_header.innerHTML = '<h' + SequencingApp.headingLevel + ' id=\'head\'>' + SequencingApp.AppData.ActivityName + '</h' + SequencingApp.headingLevel + '1>';
    SEQ_container.appendChild(SEQ_content);
    // SEQ_content.appendChild( SEQ_header );
    $(SEQ_container).appendTo(SequencingApp.containerRef);
    var SEQ_appContainer = document.createElement('div');
    SEQ_appContainer.id = 'SEQ_appContainer';

    $(SEQ_header).hide().appendTo(SEQ_content).slideDown(500);
    SEQ_content.appendChild(SEQ_appContainer);
    SequencingApp.loadButtons();
};

/**
 * Builds the Sequencing app activity buttons
 *
 * @method buildActivityButtons
 * @return {}
 */
SequencingApp.buildActivityButtons = function() {
    var SEQ_buttonSet = document.createElement('div');
    SEQ_buttonSet.id = 'SEQ_buttonSet';
    // SEQ_appContainer.appendChild(SEQ_buttonSet);
    $(SEQ_buttonSet).hide().appendTo(SEQ_appContainer).fadeIn(500);

    $('#SEQ_buttonSet').append('<div class="legendcnt"></div>');

    if (SequencingApp.AppData.FeedbackType === 'report') {
        SEQ_buttonSet.appendChild(SequencingApp.checkAnswersButton);
    }
    SequencingApp.ti = 1;
    // SequencingApp.instructionButton.setAttribute('tabindex', SequencingApp.ti);
    // SequencingApp.ti++;
    SequencingApp.checkAnswersButton.setAttribute('tabindex', SequencingApp.ti);
    SequencingApp.ti++;
    if (SequencingApp.AppData.FeedbackType === 'continuous') {
        SEQ_buttonSet.appendChild(SequencingApp.resetButton);
        SequencingApp.resetButton.setAttribute('tabindex', SequencingApp.ti);
        SequencingApp.ti++;
    }
    // else {
    //     SEQ_buttonSet.appendChild(SequencingApp.resetButton);
    //     SequencingApp.resetButton.setAttribute('tabindex', SequencingApp.ti);
    //     SequencingApp.ti++;
    // }
};

/**
 * Builds the Sequencing app instructions
 *
 * @method buildInstructions
 * @return {}
 */
SequencingApp.buildInstructions = function() {
    var instructions;
    instructions = SequencingApp.AppData.Instructions;
    var SEQ_instructions = document.createElement('div');
    SEQ_instructions.id = 'SEQ_instructions';
	SEQ_instructions.classList = "callout callout-light";
    // SEQ_instructions.setAttribute('class', 'toggledOff');
    SEQ_appContainer.appendChild(SEQ_instructions);

    var SEQ_instructionText = document.createElement('p');
    SEQ_instructionText.id = 'SEQ_instructionText';
    // SEQ_instructionText.setAttribute('class', 'd2ltooltip');
    SEQ_instructionText.innerHTML = instructions;
    // SEQ_instructions.appendChild(SEQ_instructionText);
    $(SEQ_instructionText).hide().appendTo(SEQ_instructions).fadeIn(500);
    // $('#SEQ_instructions').toggle();

    var SEQ_iToggle = document.createElement('span');
    SEQ_iToggle.id = 'SEQ_iToggle'
    SEQ_iToggle.setAttribute('tabindex', '1');
    $(SEQ_iToggle).addClass('iDown');
    SEQ_iToggle.innerHTML = '▲<span class="sr-only">Collapse instructions</span>';
    $(SEQ_iToggle).click(function() {
        if ($(this).hasClass('iDown') === true) {
            $(this).removeClass('iDown');
            $(this).addClass('iUp');
            $("#SEQ_instructions").slideUp(500);
            this.innerHTML = '▼<span class="sr-only">Collapse instructions</span>';
        } else {
            $(this).addClass('iDown');
            $(this).removeClass('iUp');
            $("#SEQ_instructions").slideDown(500);
            this.innerHTML = '▲<span class="sr-only">Collapse instructions</span>';
        }
    });
    $(SEQ_iToggle).keyup(function(event) {
        if (event.keyCode === 13) {
            $(this).click();
        }
    });
    //$(SEQ_iToggle).hide().appendTo(SEQ_appContainer).fadeIn(500);
};

/**
 * Builds the required Sequencing app buttons
 *
 * @method loadButtons
 * @return {}
 */
SequencingApp.loadButtons = function() {
    var SEQ_buttonIcon = document.createElement('div');
    SEQ_buttonIcon.setAttribute('class', 'SEQ_buttonIcon');
    var SEQ_checkButton = document.createElement('button');
    SEQ_checkButton.id = 'SEQ_checkButton';
    SEQ_checkButton.setAttribute('class', 'SEQ_button');
    SEQ_checkButton.setAttribute('title', 'Checks the Answers');
    SEQ_checkButton.onclick = function() {
        SequencingApp.checkAnswers();
    };
    var SEQ_checkLabel = document.createElement('span');
    SEQ_checkLabel.setAttribute('class', 'SEQ_buttonLabel');
    SEQ_checkLabel.innerHTML = 'Check Answers';
    SEQ_checkButton.appendChild(SEQ_buttonIcon);
    SEQ_checkButton.appendChild(SEQ_checkLabel);
    SequencingApp.checkAnswersButton = SEQ_checkButton;
    SEQ_buttonIcon = document.createElement('div');
    SEQ_buttonIcon.setAttribute('class', 'SEQ_buttonIcon');
    var SEQ_resetButton = document.createElement('button');
    SEQ_resetButton.id = 'SEQ_resetButton';
    SEQ_resetButton.setAttribute('class', 'SEQ_button');
    SEQ_resetButton.setAttribute('title', 'Resets the activity');
    SEQ_resetButton.onclick = function() {
        SequencingApp.reset();
    };
    var SEQ_resetLabel = document.createElement('span');
    SEQ_resetLabel.setAttribute('class', 'SEQ_buttonLabel');
    SEQ_resetLabel.innerHTML = 'Reset Activity';
    SEQ_resetButton.appendChild(SEQ_buttonIcon);
    SEQ_resetButton.appendChild(SEQ_resetLabel);
    SequencingApp.resetButton = SEQ_resetButton;

    SEQ_buttonIcon = document.createElement('div');
    SEQ_buttonIcon.setAttribute('class', 'SEQ_buttonIcon');
    var SEQ_restartButton = document.createElement('button');
    SEQ_restartButton.id = 'SEQ_restartButton';
    SEQ_restartButton.setAttribute('class', 'SEQ_button');
    SEQ_restartButton.setAttribute('title', 'Resets the Activity');
    SEQ_restartButton.onclick = function() {
        SequencingApp.clearStage();
        SequencingApp.reset();
    };
    var SEQ_restartLabel = document.createElement('span');
    SEQ_restartLabel.setAttribute('class', 'SEQ_buttonLabel');
    SEQ_restartLabel.innerHTML = 'Reset Activity';
    SEQ_restartButton.appendChild(SEQ_buttonIcon);
    SEQ_restartButton.appendChild(SEQ_restartLabel);
    SequencingApp.restartButton = SEQ_restartButton;

    var SEQ_finishLabel = document.createElement('span');
    SEQ_finishLabel.setAttribute('class', 'SEQ_buttonLabel');
    SEQ_finishLabel.innerHTML = 'Finish Activity';
    SEQ_buttonIcon = document.createElement('div');
    SEQ_buttonIcon.setAttribute('class', 'SEQ_buttonIcon');
    var SEQ_postQuizButton = document.createElement('button');
    SEQ_postQuizButton.id = 'SEQ_postQuizButton';
    SEQ_postQuizButton.setAttribute('class', 'SEQ_button');
    SEQ_postQuizButton.setAttribute('title', 'Finishes the Activity');
    SEQ_postQuizButton.appendChild(SEQ_buttonIcon);
    SEQ_postQuizButton.appendChild(SEQ_finishLabel);
    SEQ_postQuizButton.onclick = function() {
        SequencingApp.clearStage();
        SequencingApp.buildPostActivity();
    };
    SequencingApp.postQuizButton = SEQ_postQuizButton;

    // SEQ_buttonIcon = document.createElement('div');
    // SEQ_buttonIcon.setAttribute('class', 'SEQ_buttonIcon');
    // var SEQ_instructionButton = document.createElement('button');
    // SEQ_instructionButton.id = 'SEQ_instructionButton';
    // SEQ_instructionButton.setAttribute('class', 'SEQ_button');
    // SEQ_instructionButton.setAttribute('title', 'Toggles the Instructions');
    // SEQ_instructionButton.onclick = function() {
    //     SequencingApp.toggleInstructions();
    // };
    // SequencingApp.instructionButton = SEQ_instructionButton;

    var SEQ_buttonIcon = document.createElement('div');
    SEQ_buttonIcon.setAttribute('class', 'SEQ_buttonIcon');
    SEQ_buttonIcon = document.createElement('div');
    SEQ_buttonIcon.setAttribute('class', 'SEQ_buttonIcon');
    SEQ_postQuizButton = document.createElement('button');
    SEQ_postQuizButton.id = 'SEQ_tryAgainButton';
    SEQ_postQuizButton.setAttribute('class', 'SEQ_button');
    SEQ_postQuizButton.setAttribute('title', 'Returns to the Activity');
    SEQ_postQuizButton.appendChild(SEQ_buttonIcon);
    SEQ_finishLabel = document.createElement('span');
    SEQ_finishLabel.setAttribute('class', 'SEQ_buttonLabel');
    SEQ_finishLabel.innerHTML = 'Try Again';
    SEQ_postQuizButton.appendChild(SEQ_finishLabel);
    SEQ_postQuizButton.onclick = function() {
        SequencingApp.clearStage();
        $('html, body').animate({ scrollTop: 0 }, 'slow');
        if (window.parent !== null) {
            $('html, body', window.parent.document).animate({ scrollTop: 0 }, 'slow');
        }
        SequencingApp.rebuildActivity();
        SequencingApp.addFeedbackLegend();
    };
    SequencingApp.tryAgainButton = SEQ_postQuizButton;
};

/**
 * Rebuilds the Sequencing app incorporating feedback
 *
 * @method rebuildActivity
 * @return {}
 */
SequencingApp.rebuildActivity = function() {
    SequencingApp.isRetry = true;
    // SEQ_appContainer.appendChild(SequencingApp.instructionButton);
    SequencingApp.buildInstructions();
    SequencingApp.ti = 2;
    var mediaDomContent = document.createElement('div');
    mediaDomContent.setAttribute('id', 'sortContainer');
    SEQ_appContainer.appendChild(mediaDomContent);
    var sortAppContainer = mediaDomContent;
    mediaDomContent = document.createElement('ol');
    mediaDomContent.setAttribute('id', 'placeholderContent');
    mediaDomContent.setAttribute('class', 'placholderTitles');
    mediaDomContent.setAttribute('role', 'list');
    mediaDomContent.setAttribute('aria-hidden', 'true');

    $(mediaDomContent).append(SequencingApp.usersSequence.html());
    sortAppContainer.appendChild(mediaDomContent);
    mediaDomContent = document.createElement('ol');
    mediaDomContent.setAttribute('id', 'sortList');
    mediaDomContent.setAttribute('role', 'list');
    mediaDomContent.setAttribute('class', SequencingApp.sortlistClass);

    sortAppContainer.appendChild(mediaDomContent);
    $(mediaDomContent).append(SequencingApp.usersSequence3.html());
    setTimeout(function() {
        $('.sortItem').css('height', SequencingApp.sortlistliHeight);
        $('.sortItem').css('margin-top', SequencingApp.sortlistliTop);
        $('.sortItem').css('margin-bottom', SequencingApp.sortlistlibottom);

    }, 0);
    for (var i = 0; i < SequencingApp.AppData.sortItems.length; i++) {
        $('#' + $(SequencingApp.usersSequence3.children()[i]).attr('id')).data('correctPos', $(SequencingApp.usersSequence3.children()[i]).data('correctPos'));
        if (i === $('#' + $(SequencingApp.usersSequence3.children()[i]).attr('id')).data('correctPos')) {
            // $('#'+$(SequencingApp.usersSequence3.children()[i]).attr('id')).addClass('disabled')
            $('#' + $(SequencingApp.usersSequence3.children()[i]).attr('id')).children('.feedbackBar').addClass('correct');
        } else {
            $('#' + $(SequencingApp.usersSequence3.children()[i]).attr('id')).children('.feedbackBar').addClass('incorrect');
        }
    }
    SequencingApp.addFeedbackLegend();
    SequencingApp.buildActivityButtons();
    $($(window.top.document.documentElement).find('.d2l-page-collapsepane-container')[0]).css('min-height', '');
    $('.exclude').sortable({
		opacity: 1,
        items: ':not(.disabled)',
        forcePlaceholderSize: true
    });
    if (SequencingApp.AppData.layoutStyle === 'vertical') {
        setTimeout(function() {
            $('#sortList li.vertical img').each(function(index, element) {
                $(element).css('margin-top', $('.sortItem').height() / 2 - $(element).height() / 2);
                $(element).css('margin-bottom', $('.placeholderTitle').outerHeight() + 'px');
            });
            $('.sortItem').css('width', $('#placeholderContent').width());
            $('.triangle-down-border').css('padding-left', $('.placeholder').width() / 2 - 20 + 'px');
            $('.triangle-down-inside').css('padding-left', $('.placeholder').innerWidth() / 2 - 20);
        }, 0);
    }
};

/**
 * Toggles the Sequencing app instructions container
 *
 * @method toggleInstructions
 * @return {}
 */
SequencingApp.toggleInstructions = function() {
    $('#SEQ_instructions').toggle();
    if ($('#SEQ_instructions').css('display') === 'block') {
        $('#SEQ_instructionButton').addClass('toggleOn');
        $('#SEQ_instructionButton').removeClass('toggleOff');
    } else {
        $('#SEQ_instructionButton').addClass('toggleOff');
        $('#SEQ_instructionButton').removeClass('toggleOn');
    }
    if (SequencingApp.AppData.layoutStyle === 'horizontal') {
        $('#sortList').css('top', $('#placeholderContent').position().top);
    } else {
        $('#sortList').css('top', $('#placeholderContent').position().top);
    }
    $('#SEQ_instructions').focus();
};

/**
 * Builds the Sequencing pre-activity page
 *
 * @method buildPreActivity
 * @return {}
 */
SequencingApp.buildPreActivity = function() {
    var hasImage = false;
    var hasVideo = false;

    SequencingApp.activityStatus = 'introduction';
    if (SequencingApp.AppData.PreActivityText !== 'none') {
        var SEQ_preActivityText = document.createElement('p');
        SEQ_preActivityText.id = 'SEQ_preActivityText';
        SEQ_preActivityText.innerHTML = SequencingApp.AppData.PreActivityText;
        // SEQ_appContainer.appendChild(SEQ_preActivityText);
        $(SEQ_preActivityText).hide().appendTo(SEQ_appContainer).fadeIn(500);
    }
    if (SequencingApp.AppData.PreActivityMedia !== 'none') {
        for (var i = 0; i < SequencingApp.AppData.PreActivityMedia.length; i++) {
            if (SequencingApp.AppData.PreActivityMedia[i].type === 'image') {
                hasImage = true;
            } else if (SequencingApp.AppData.PreActivityMedia[i].type === 'YouTubeVideo') {
                hasVideo = true;
            }
            SequencingApp.EmbedMedia('page', SEQ_appContainer, SequencingApp.AppData.PreActivityMedia[i]);
        }
    }
    if (hasVideo === false && hasImage === false) {
        SequencingApp.buildPreActivityButtons();
    } else {
        $('.embedMedia:last').load(function() {
            SequencingApp.buildPreActivityButtons();
        });
    }
    $('#head').attr('tabindex', '1');
    $('#head').focus();
};

/**
 * Completely clears the Sequencing app container and scrolls the browser to top of page
 *
 * @method clearStage
 * @return {}
 */
SequencingApp.clearStage = function() {
    $('#SEQ_appContainer').empty()
};

/**
 * Builds the Sequencing app pre-activity page buttons
 *
 * @method buildPreActivityButtons
 * @return {}
 */
SequencingApp.buildPreActivityButtons = function() {
    var SEQ_buttonSet = document.createElement('div');
    SEQ_buttonSet.id = 'SEQ_buttonSet';
    SEQ_appContainer.appendChild(SEQ_buttonSet);
    var SEQ_buttonIcon = document.createElement('div');
    SEQ_buttonIcon.setAttribute('class', 'SEQ_buttonIcon');
    var SEQ_startButton = document.createElement('button');
    SEQ_startButton.id = 'SEQ_startButton';
    SEQ_startButton.setAttribute('class', 'SEQ_button');
    SEQ_startButton.setAttribute('title', 'Starts the Activity');
    SEQ_startButton.onclick = function() {
        SequencingApp.clearStage();
        SequencingApp.pageNum++;
        SequencingApp.buildActivity();
    };
    var SEQ_startLabel = document.createElement('span');
    SEQ_startLabel.setAttribute('class', 'SEQ_buttonLabel');
    SEQ_startLabel.innerHTML = 'Start Activity';
    SEQ_startButton.appendChild(SEQ_buttonIcon);
    SEQ_startButton.appendChild(SEQ_startLabel);
    SequencingApp.startButton = SEQ_startButton;
    // SEQ_buttonSet.appendChild(SequencingApp.startButton);
    $(SequencingApp.startButton).hide().appendTo(SEQ_buttonSet).fadeIn(500);
};

/**
 * Builds the Sequencing app post-activity page
 *
 * @method buildPostActivity
 * @return {}
 */
SequencingApp.buildPostActivity = function() {
    var hasImage = false;
    var hasVideo = false;
    if (SequencingApp.AppData.PostActivityText !== 'none' && SequencingApp.AppData.PostActivityText !== undefined && SequencingApp.AppData.PostActivityText !== '') {
        var SEQ_postActivityText = document.createElement('p');
        SEQ_postActivityText.id = 'SEQ_postActivityText';
        SEQ_postActivityText.innerHTML = SequencingApp.AppData.PostActivityText;
        // SEQ_appContainer.appendChild(SEQ_postActivityText);
        $(SEQ_postActivityText).hide().appendTo(SEQ_appContainer).fadeIn(500);
    } else {
        var SEQ_postActivityText = document.createElement('p');
        SEQ_postActivityText.id = 'SEQ_postActivityText';
        SEQ_postActivityText.innerHTML = 'You have completed the activity!';
        // SEQ_appContainer.appendChild(SEQ_postActivityText);
        $(SEQ_postActivityText).hide().appendTo(SEQ_appContainer).fadeIn(500);
    }
    if (SequencingApp.AppData.PostActivityMedia !== 'none' && SequencingApp.AppData.PostActivityMedia !== undefined) {
        for (var i = 0; i < SequencingApp.AppData.PostActivityMedia.length; i++) {
            if (SequencingApp.AppData.PostActivityMedia[i].type === 'image') {
                hasImage = true;
            } else if (SequencingApp.AppData.PostActivityMedia[i].type === 'YouTubeVideo') {
                hasVideo = true;
            }
            SequencingApp.EmbedMedia('page', SEQ_appContainer, SequencingApp.AppData.PostActivityMedia[i]);
        }
    }
    if (hasVideo === false && hasImage === false) {
        SequencingApp.buildPostActivityButtons();
    } else {
        $('.embedMedia:last').load(function() {
            SequencingApp.buildPostActivityButtons();
        });
    }
    $('#head').attr('tabindex', '1').css('outline', 'none');
    $('#head').focus();
    SequencingApp.activityStatus = 'postActivity';
};

/**
 * Builds the Sequencing app post-activity page buttons
 *
 * @method buildPostActivityButtons
 * @return
 */
SequencingApp.buildPostActivityButtons = function() {
    var SEQ_buttonSet = document.createElement('div');
    SEQ_buttonSet.id = 'SEQ_buttonSet';
    SEQ_appContainer.appendChild(SEQ_buttonSet);
    // SEQ_buttonSet.appendChild(SequencingApp.restartButton);
    $(SequencingApp.restartButton).hide().appendTo(SEQ_buttonSet).fadeIn(500);
};

/**
 * Creates the Sequencing app embedded media elements
 *
 * @method EmbedMedia
 * @param {string} type
 * @param {string} containerRef
 * @param {object} mediaData
 * @return {}
 */
SequencingApp.EmbedMedia = function(type, containerRef, mediaData) {
    var mediaDomObj = document.createElement('div');
    mediaDomObj.setAttribute('class', 'SEQ_Media');
    if (type == 'feedback') {
        $(mediaDomObj).addClass('feedbackMedia');
    } else if (type === 'page') {
        $(mediaDomObj).addClass('pageMedia');
    }
    switch (mediaData.type) {
        case 'link':
            mediaDomContent = document.createElement('a');
            mediaDomContent.setAttribute('class', 'SEQ_MediaLink');
            mediaDomContent.setAttribute('href', mediaData.src);
            mediaDomContent.setAttribute('target', '_blank');
            if (mediaData.description) {
                mediaDomContent.innerHTML = mediaData.description;
            } else {
                mediaDomContent.innerHTML = 'Link';
            }
            mediaDomObj.appendChild(mediaDomContent);
            break;
        case 'audio':
            mediaDomContent = document.createElement('audio');
            mediaDomContent.id = mediaData.id;
            mediaDomContent.setAttribute('class', 'SEQ_MediaAudio');
            mediaDomContent.setAttribute('target', '_blank');
            mediaDomContent.innerHTML = '<source src="' + mediaData.mp3 + '" type="audio/mpeg">' + '<source src="' + mediaData.ogg + '" type="audio/ogg">' + '<source src="' + mediaData.wav + '" type="audio/wav"> Your browser does not support the audio tag.';
            mediaDomObj.appendChild(mediaDomContent);
            var SEQ_audioButton = document.createElement('button');
            SEQ_audioButton.setAttribute('class', 'SEQ_audioButton');
            SEQ_audioButton.setAttribute('title', 'Play Audio Button');
            SEQ_audioButton.onclick = function() {
                var audioClip = document.getElementById(mediaData.id);
                audioClip.play();
            };
            mediaDomObj.appendChild(SEQ_audioButton);
            break;
        case 'image':
            if (mediaData.mediaLink !== 'none' && mediaData.mediaLink !== null && mediaData.mediaLink !== undefined && mediaData.mediaLink !== '') {
                var mediaDomLink = document.createElement('a');
                mediaDomLink.setAttribute('class', 'SEQ_MediaImageLink');
                mediaDomLink.setAttribute('href', mediaData.mediaLink);
                mediaDomLink.setAttribute('target', '_blank');
            }
            mediaDomContent = document.createElement('img');
            mediaDomContent.setAttribute('class', 'SEQ_MediaImage embedMedia');
            mediaDomContent.setAttribute('src', mediaData.src);
            mediaDomContent.setAttribute('tabindex', 0);
            if (mediaData.width != 'none') {
                mediaDomContent.setAttribute('width', mediaData.width);
            } else {
                mediaDomContent.setAttribute('width', '420');
            }
            if (mediaData.height != 'none') {
                mediaDomContent.setAttribute('height', mediaData.height);
            } else {
                mediaDomContent.setAttribute('height', '315');
            }
            mediaDomObj.setAttribute('style', 'text-align:center;');
            if (mediaData.description) {
                mediaDomContent.setAttribute('alt', mediaData.description);
            }
            mediaDomContent.onerror = function() {
                mediaDomContent.setAttribute('src', 'data:image/png;base64,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');
                mediaDomContent.setAttribute('alt', 'Error. Image could not be loaded.');
            };
            if (mediaData.mediaLink === 'none' || mediaData.mediaLink === null || mediaData.mediaLink === undefined || mediaData.mediaLink === '') {
                mediaDomObj.appendChild(mediaDomContent);
            } else {
                mediaDomLink.appendChild(mediaDomContent);
                mediaDomObj.appendChild(mediaDomLink);
            }
            break;
        case 'YouTubeVideo':
            validSrc = SequencingApp.validateYouTubeLink(mediaData.src);
            if (validSrc) {
                mediaDomContent = document.createElement('iframe');
                mediaDomContent.setAttribute('class', 'SEQ_MediaEmbeddedVideo embedMedia');
                if (mediaData.width !== 'none') {
                    mediaDomContent.setAttribute('width', mediaData.width);
                } else {
                    mediaDomContent.setAttribute('width', '420');
                }
                if (mediaData.height !== 'none') {
                    mediaDomContent.setAttribute('height', mediaData.height);
                } else {
                    mediaDomContent.setAttribute('height', '315');
                }
                mediaDomContent.setAttribute('frameborder', '0');
                mediaDomContent.setAttribute('allowfullscreen', 'true');
                mediaDomContent.setAttribute('style', 'padding-bottom: 10px 0px;');
                mediaDomContent.setAttribute('src', validSrc);
                if (type === 'page') {
                    mediaDomObj.setAttribute('style', 'text-align:center;');
                }
                if (mediaData.description) {
                    mediaDomContent.setAttribute('alt', mediaData.description);
                }
                mediaDomObj.appendChild(mediaDomContent);
                var mediaDomLink = document.createElement('a');
                mediaDomLink.setAttribute('class', 'SEQ_MediaAltLink');
                mediaDomLink.setAttribute('href', mediaData.altLink);
                mediaDomLink.setAttribute('target', '_blank');
                mediaDomLink.innerHTML = 'Alternate Link.';
                mediaDomObj.appendChild(mediaDomLink);
            } else {
                var mediaDomContent = document.createElement('img');
                mediaDomContent.setAttribute('class', 'SEQ_MediaImage embedMedia');
                mediaDomContent.setAttribute('src', 'data:image/png;base64,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');
                mediaDomContent.setAttribute('alt', 'Error. Video could not be loaded.');
                mediaDomContent.setAttribute('width', '420');
                mediaDomContent.setAttribute('width', '360');
                mediaDomContent.setAttribute('tabindex', 0);
                if (type === 'page') {
                    mediaDomObj.setAttribute('style', 'text-align:center;');
                }
                mediaDomObj.appendChild(mediaDomContent);
            }
            break;
        case 'text':
            mediaDomContent = document.createElement('p');
            mediaDomContent.setAttribute('class', 'SEQ_MediaText');
            mediaDomContent.setAttribute('target', '_blank');
            mediaDomContent.innerHTML = mediaData.content;
            mediaDomObj.appendChild(mediaDomContent);
            break;
        default:
            break;
    }
    $(mediaDomObj).hide().appendTo(containerRef).fadeIn(500);
    // containerRef.appendChild(mediaDomObj);
};

/**
 * Validates a youtube link and returns a normalized link or false
 *
 * @method validateYouTubeLink
 * @param {string} src
 * @return {bool|string} Normalized YouTube link or false
 */
SequencingApp.validateYouTubeLink = function(src) {
    if (src.indexOf('www.youtube.com') !== -1) {
        if (src.indexOf('</iframe>') === -1) {
            if (src.indexOf('watch?v=') !== -1) {
                code = src.slice(src.indexOf('?v=') + 3);
                return 'https://www.youtube.com/embed/' + code;
            } else {
                return false;
            }
        } else {
            if (src.indexOf('https://www.youtube.com/embed/') !== -1) {
                return link.slice(link.indexOf('src') + 5, link.indexOf('"', link.indexOf('src') + 5));
            } else {
                return false;
            }
        }
    } else {
        return false;
    }
};

/**
 * Builds the Sequencing app activity 
 *
 * @method buildActivity
 * @return {}
 */
SequencingApp.buildActivity = function() {
    var hasImage = false;
    SequencingApp.activityStatus = 'main';
    // SEQ_appContainer.appendChild(SequencingApp.instructionButton);
    SequencingApp.buildInstructions();
    if (SequencingApp.continuousFeedback === true && SequencingApp.endReport === false) {
        for (var i = 0; i < SequencingApp.Questions.length; i++) {
            SequencingApp.submitCheck.push(false);
        }
        SequencingApp.submitInterval = setInterval(SequencingApp.CheckAllSubmits, 250);
    }
    SequencingApp.ti = 2;
    var mediaDomContent = document.createElement('div');
    mediaDomContent.setAttribute('id', 'sortContainer');
    // SEQ_appContainer.appendChild(mediaDomContent);
    $(mediaDomContent).hide().appendTo(SEQ_appContainer).fadeIn(500);
    var sortAppContainer = mediaDomContent;
    mediaDomContent = document.createElement('ol');
    mediaDomContent.setAttribute('id', 'placeholderContent');
    mediaDomContent.setAttribute('class', 'placholderTitles');
    mediaDomContent.setAttribute('role', 'list');
    mediaDomContent.setAttribute('aria-hidden', 'true');
    var placeholderTitles = mediaDomContent;
    sortAppContainer.appendChild(mediaDomContent);
    if (SequencingApp.AppData.layoutStyle === 'horizontal') {
        $(mediaDomContent).addClass('horizontal_ol');
    } else {
        $(mediaDomContent).addClass('vertical_ol');
    }
    mediaDomContent = document.createElement('ol');
    mediaDomContent.setAttribute('id', 'sortList');
    mediaDomContent.setAttribute('role', 'listbox');
    mediaDomContent.setAttribute('class', 'exclude list');
    sortAppContainer.appendChild(mediaDomContent);
    if (SequencingApp.AppData.layoutStyle === 'horizontal') {
        $(mediaDomContent).addClass('horizontal_ol');
    } else {
        $(mediaDomContent).addClass('vertical_ol');
    }
    var sortAppList = mediaDomContent;
    SequencingApp.sortOrderList = [];
    if (SequencingApp.AppData.layoutStyle === 'horizontal') {
        $(placeholderTitles).addClass('horizontal');
    } else {
        $(placeholderContent).addClass('vertical');
    }
    if (typeof SequencingApp.AppData.sortOrder === 'string' && SequencingApp.AppData.sortOrder === 'random') {
        SequencingApp.sortOrderList = SequencingApp.shuffleArray(SequencingApp.AppData.correctOrder);
    } else if ($.isArray(SequencingApp.AppData.sortOrder)) {
        SequencingApp.sortOrderList = SequencingApp.AppData.sortOrder;
    }
    SequencingApp.totalsortItems = SequencingApp.AppData.sortItems.length;
    for (var listItem = 0; listItem < SequencingApp.AppData.sortItems.length; listItem++) {
        var placeholderContent = document.createElement('li');
        placeholderContent.setAttribute('id', 'placeholder' + listItem);
        placeholderContent.setAttribute('aria-setsize', SequencingApp.AppData.sortItems.length);
        placeholderContent.setAttribute('aria-posinset', listItem + 1);
        if (SequencingApp.AppData.placholderTitleStyle === 'arrow') {
            placeholderContent.setAttribute('class', 'placeholder placeholderArrow');
            var className = 'ieFix';
            if (document.body.getAttribute('browser') === 'chrome') {
                if ($('body').attr('userDevice') === 'mobile') {
                    className = 'mobileChromeFix';
                } else {
                    className = 'chromeFix';
                }
            }
            if (document.body.getAttribute('browser') === 'firefox') {
                className = 'firefoxFix';
            }
            if (document.body.getAttribute('browser') === 'safari') {
                if ($('body').attr('userDevice') === 'mobile') {
                    className = 'mobileSafariFix';
                } else {
                    className = 'safariFix';
                }
            }
            if (listItem === SequencingApp.AppData.sortItems.length - 1 && SequencingApp.AppData.layoutStyle === 'horizontal') {
                var className = 'ie';
                if (document.body.getAttribute('browser') === 'chrome') {
                    //D2log($('body').attr('userDevice'))
                    if ($('body').attr('userDevice') === 'mobile') {
                        className = 'mobileChromeFix';
                    } else {
                        className = 'chromeFix';
                    }
                }
                if (document.body.getAttribute('browser') === 'firefox') {
                    className = 'firefox';
                }
                className += ' listEnd';
            }
            if (listItem == SequencingApp.totalsortItems - 1 && SequencingApp.AppData.layoutStyle === 'horizontal') {
                placeholderContent.innerHTML = '<div class=\'placeholderTitle \'><div>' + SequencingApp.AppData.sortItems[listItem].placeHolderText + '</div></div>';
            } else {
                if (SequencingApp.AppData.layoutStyle === 'horizontal') {
                    placeholderContent.innerHTML = '<div class=\'triangle-right-border\'><div></div></div><div class=\'triangle-right-inside\'><div></div></div><div class=\'placeholderTitle \'><div>' + SequencingApp.AppData.sortItems[listItem].placeHolderText + '</div></div>';
                } else {
                    placeholderContent.innerHTML = '<div class=\'triangle-down-border\'><div></div></div><div class=\'triangle-down-inside\'><div></div></div><div class=\'placeholderTitle \'><div>' + SequencingApp.AppData.sortItems[listItem].placeHolderText + '</div></div>';
                }
            }
            if (SequencingApp.AppData.layoutStyle === 'horizontal') {
                $(placeholderContent).addClass('horizontal');
                $(placeholderContent).children('div').addClass('horizontalLayout');
                $('#placeholder' + (SequencingApp.totalsortItems - 1)).children('.triangle-right-border').remove();
            } else {
                $(placeholderContent).addClass('vertical');
                $(placeholderContent).children('div').addClass('verticalLayout');
            } //   If($('#placeholder'+(SequencingApp.totalsortItems-1))){
            //alert("?")
            //}
            /*   $(window).resize(function(e){

                       for(var listItem=0;listItem<$('.placeholderArrow').length;listItem++){
                          if(listItem>0&& $('#placeholder'+listItem).offset().left===$('#placeholder0').offset().left){
                             $('#placeholder'+(listItem-1)).children('span').addClass('arrowHeadEndLine')

                          }else{
                             //d2log($('.placeholder').width()/2)
                             $('#placeholder'+(listItem-1)).children('span').removeClass('arrowHeadEndLine');
                             var currentPLCHeight =0;
                             var currentPLCHeightObject = '';
                             $('.placeholderTitle').children('div').each(function(index,element){
                             if(currentPLCHeight<$(element).height()){
                                currentPLCHeight = $(element).height();
                                currentPLCHeightObject = element;
                             }
                          });
                          $('.placeholderTitle').height(currentPLCHeight+'px');
                          $('.triangle-down-border').css('padding-left',($('.placeholder').width()/2)-20+"px");
                          $('.triangle-down-inside').css('padding-left',($('.placeholder').innerWidth()/2)-20);
                          $('.placeholderArrow.vertical').height($('.placeholderTitle').outerHeight());
                          $('.triangle-down-border').css('top','100%');
                          if(document.body.getAttribute('browser')==="firefox"){
                             $('.triangle-down-inside').css('top','95%');
                          }else{
                             $('.triangle-down-inside').css('top','96%');
                          }
                          $('.placeholderArrow.vertical').height($('.placeholderTitle').outerHeight());
                          $('#sortList').width($('#placeholderContent').width());
                          $('.sortItem').width($('.placeholder').innerWidth()-(Number($('.sortItem.vertical').css('padding').split('px')[0])*2));
                          $('.sortItem').css('margin-top',$('.placeholderTitle').outerHeight()+'px');
                          $('.sortItem').css('margin-bottom',$('.placeholderTitle').outerHeight()+'px');
                          }
                          d2log(SequencingApp.AppData.layoutStyle)
                          if(SequencingApp.AppData.layoutStyle ==="vertical"){
                          $('#sortList li.vertical img').each(function(index, element){
                             $(element).css('margin-top',($('.sortItem').height()/2)-($(element).height()/2))
                          });
                       }
                    }

                 });*/
        } else {
            placeholderContent.setAttribute('class', 'placeholder placeholderRect');
            var className = 'ie';
            if (document.body.getAttribute('browser') === 'chrome') {
                className = 'chrome';
            }
            if (document.body.getAttribute('browser') === 'firefox') {
                className = 'firefox';
            }
            if (document.body.getAttribute('browser') === 'safari') {
                className = 'safari';
            }
            placeholderContent.innerHTML = '<div class=\'placeholderTitle ' + className + '\'><div>' + SequencingApp.AppData.sortItems[listItem].placeHolderText + '</div></div>';
            var holderTitle = $(placeholderContent).children();
            setTimeout(function() {
                for (var i = 0; i <= $(placeholderTitles).children().length; i++) {
                    if (SequencingApp.AppData.layoutStyle === 'horizontal') {
                        $($('#placeholder' + i).children('div')).children().css('margin-top', $('.placeholderTitle').height() / 2 - $($('#placeholder' + i).children('div')).children().height() / 2);
                    } else {
                        $($('#placeholder' + i).children('div')).children().css('margin-top', $('.placeholderTitle').height() / 2 - $($('#placeholder' + i).children('div')).children().height() / 2);
                    }
                }
            }, 0);
            if (SequencingApp.AppData.layoutStyle === 'horizontal') {
                $(placeholderContent).addClass('horizontal');
            } else {
                $(placeholderContent).addClass('vertical');
            }
        }

        placeholderTitles.appendChild(placeholderContent);
        if (listItem > 0 && $(placeholderContent).offset().left === $('#placeholder0').offset().left) {
            $('#placeholder' + (listItem - 1)).children('span').addClass('arrowHeadEndLine');
        }
        mediaDomContent = document.createElement('li');
        mediaDomContent.setAttribute('id', 'sortItem' + listItem);
        mediaDomContent.setAttribute('class', 'sortItem');
        mediaDomContent.setAttribute('tabindex', 1);
        mediaDomContent.setAttribute('aria-setsize', SequencingApp.AppData.sortItems.length);
        mediaDomContent.setAttribute('aria-posinset', listItem + 1);
        mediaDomContent.setAttribute('role', 'listitem');
        mediaDomContent.setAttribute('onmousedown', 'SequencingApp.autoSelect(this);');
        $(mediaDomContent).mouseenter(function() {
            $(this).addClass('hovering');
        }).mouseleave(function() {
            $(this).removeClass('hovering');
        });
        mediaDomContent.addEventListener('dragend', function() {
            setTimeout(function() {
                for (var i = 0; i < $('.sortItem').length; i++) {
                    $('#sortItem' + i).attr('aria-posinset', $('#sortItem' + i).index());
                }
            }, 1000);
        });

        //$('.placeholder').height($('.placeholderTitle').outerHeight());
        $('.triangle-down-border').css('padding-left', $('.placeholder').innerWidth() / 2 - 20);
        $('.triangle-down-inside').css('padding-left', $('.placeholder').innerWidth() / 2 - 20);
        var currentPLCHeight = 0;
        var currentPLCHeightObject = '';

        //If(SequencingApp.AppData.placholderTitleStyle==="box"){
        $('.placeholderTitle').children('div').each(function(index, element) {
            if (currentPLCHeight < $(element).height()) {
                currentPLCHeight = $(element).height();
                currentPLCHeightObject = element;
            }
        });
        $('.placeholderTitle').height(currentPLCHeight + 'px');
        $('.placeholderArrow.vertical').height($('.placeholderTitle').outerHeight());
        $('.sortItem').css('margin-top', currentPLCHeight + 50 + 'px');

        //Alert("?")
        //$('.sortItem').css('margin-top',$('.placeholderTitle').outerHeight());
        //},1000);
        $(mediaDomContent).focus(function() {
            $(this).attr('aria-selected', true);
        });
        $(mediaDomContent).blur(function() {
            $(this).attr('aria-selected', false);
        });
        if (SequencingApp.AppData.layoutStyle === 'horizontal') {
            $(mediaDomContent).addClass('horizontal');
        } else {
            $(mediaDomContent).addClass('vertical');
        }
        $(mediaDomContent).keydown(function(e) {
            //D2log($($(this).children()[0]).text())
            if (e.keyCode == 39 && $(this).attr('draggable') != false) {
                var currentIndex = $(this).index();
                if (currentIndex === SequencingApp.totalsortItems - 1) {
                    return;
                }
                for (var i = 0; i < $('#sortList').children('li').length; i++) {
                    $('#sortItem' + i).attr('aria-hidden', true);
                }
                var currentItem = $(this);
                var nextItem = $($('#sortList li').get($(this).index() + 1)).attr('id');
                if (nextItem != undefined) {
                    $(this).insertAfter('#' + nextItem);
                } else {
                    nextItem = $($('#sortList li').get(0)).attr('id');
                    $(this).insertBefore('#' + nextItem);
                }
                $('#sortList li').each(function(index, element) {
                    if ($($(element).children('div')[0]).children('img').length != 0) {
                        $(element).attr('aria-label', $('#placeholder' + $(element).index() + ' div').children('div').text() + '. Graphic. ' + $($(element).children('div')[0]).children('img').attr('alt') + ' ' + $(element).children().text());
                    } else {
                        $(element).attr('aria-label', $('#placeholder' + $(element).index() + ' div').children('div').text() + '. ' + $(element).children().text());
                    }
                    $(element).attr('aria-posinset', $(element).index() + 1);
                    $(element).children().attr('aria-label', $(element).attr('aria-label'));
                });
                for (var i = 0; i < $('#sortList').children('li').length; i++) {
                    $('#sortItem' + i).attr('aria-hidden', false);
                }
                if ($('body').attr('browser') === 'firefox') {
                    setTimeout(function() {
                        $('body').append('<div id="ariaAlert" aria-live="aggressive" role="alert" title=" " aria-relevant="additions" aria-atomic="true" style="left:9999;position:absolute"> You moved the tile from ' + SequencingApp.AppData.sortItems[currentIndex].placeHolderText + ' to ' + SequencingApp.AppData.sortItems[currentIndex + 1].placeHolderText + '</div>');
                    }, 0);
                } else {
                    setTimeout(function() {
                        $('body').append('<div id="ariaAlert" aria-live="aggressive" role="alert" title=" " aria-relevant="additions" aria-atomic="true" style="left:9999;position:absolute"> You moved the tile from ' + SequencingApp.AppData.sortItems[currentIndex].placeHolderText + ' to ' + SequencingApp.AppData.sortItems[currentIndex + 1].placeHolderText + '</div>');
                    }, 0);
                }
                if ($('body').attr('browser') === 'ie') {
                    setTimeout(function() {
                        $(currentItem).focus();
                        $('#ariaAlert').remove();
                    }, 2000);
                } else if ($('body').attr('browser') === 'chrome') {
                    setTimeout(function() {
                        $(currentItem).focus();
                        $('#ariaAlert').remove();
                    }, 800);
                } else if ($('body').attr('browser') === 'firefox') {
                    $('#sortList').attr('aria-hidden', true);
                    $('#sortList').attr('tabindex', -1);
                    setTimeout(function() {
                        $(currentItem).focus();
                        $('#ariaAlert').remove();
                    }, 800);
                } else {
                    setTimeout(function() {
                        $(currentItem).focus();
                        $('#ariaAlert').remove();
                    }, 3000);
                }
                if (SequencingApp.AppData.FeedbackType === 'continuous') {
                    SequencingApp.checkContinuousAnswers();
                }
                e.preventDefault ? e.preventDefault() : e.returnValue = false;
            }
            if (e.keyCode === 37 && $(this).attr('draggable') !== false) {
                var currentIndex = $(this).index();
                if (currentIndex === 0) {
                    return;
                }
                var currentItem = $(this);
                var nextItem = $($('#sortList li').get($(this).index() - 1)).attr('id');
                for (var i = 0; i < $('#sortList').children('li').length; i++) {
                    $('#sortItem' + i).attr('aria-hidden', true);
                }
                if (nextItem !== undefined) {
                    $(this).insertBefore('#' + nextItem);
                }
                $('#sortList li').each(function(index, element) {
                    if ($($(element).children('div')[0]).children('img').length != 0) {
                        $(element).attr('aria-label', $('#placeholder' + $(element).index() + ' div').children('div').text() + '. Graphic. ' + $($(element).children('div')[0]).children('img').attr('alt') + ' ' + $(element).children().text());
                    } else {
                        $(element).attr('aria-label', $('#placeholder' + $(element).index() + ' div').children('div').text() + '. ' + $(element).children().text());
                    }
                    $(element).attr('aria-posinset', $(element).index() + 1);
                    $(element).children().attr('aria-label', $(element).attr('aria-label'));
                });
                for (var i = 0; i < $('#sortList').children('li').length; i++) {
                    $('#sortItem' + i).attr('aria-hidden', false);
                    $('#sortItem' + i).children('.tileTitle').attr('aria-hidden', true);
                }
                if ($('body').attr('browser') === 'firefox') {
                    setTimeout(function() {
                        $(currentItem).append('<div id="ariaAlert" aria-live="aggressive" role="alert"  title=" " aria-atomic="true" style="left:9999;position:absolute"> You moved the tile from ' + SequencingApp.AppData.sortItems[currentIndex].placeHolderText + ' to ' + SequencingApp.AppData.sortItems[currentIndex - 1].placeHolderText + '</div>');
                    }, 0);
                } else {
                    $(currentItem).append('<div id="ariaAlert" aria-live="aggressive" role="alert"  title=" " aria-atomic="true" style="left:9999;position:absolute"> You moved the tile from ' + SequencingApp.AppData.sortItems[currentIndex].placeHolderText + ' to ' + SequencingApp.AppData.sortItems[currentIndex - 1].placeHolderText + '</div>');
                }
                if ($('body').attr('browser') === 'ie') {
                    setTimeout(function() {
                        $(currentItem).focus();
                    }, 2000);
                } else if ($('body').attr('browser') === 'chrome') {
                    setTimeout(function() {
                        $(currentItem).focus();
                        $('#ariaAlert').remove();
                    }, 800);
                } else if ($('body').attr('browser') === 'firefox') {
                    setTimeout(function() {
                        $(currentItem).focus();
                        $('#ariaAlert').remove();
                    }, 800);
                } else {
                    setTimeout(function() {
                        $(currentItem).focus();
                        $('#ariaAlert').remove();
                    }, 2000);
                }
                if (SequencingApp.AppData.FeedbackType === 'continuous') {
                    SequencingApp.checkContinuousAnswers();
                }
                e.preventDefault ? e.preventDefault() : e.returnValue = false;
            }
        });
        var srtObj = $.grep(SequencingApp.AppData.sortItems, function(obj) {
            if (obj.id.toString() === SequencingApp.sortOrderList[listItem]) {
                return obj;
            }
        });
        for (var i = 0; i < SequencingApp.AppData.correctOrder.length; i++) {
            if (SequencingApp.sortOrderList[listItem] === SequencingApp.AppData.correctOrder[i]) {
                var correctSrtPosition = i;
            }
        }
        $(mediaDomContent).data('correctPos', correctSrtPosition);
        mediaDomContent.setAttribute('aria-label', SequencingApp.AppData.sortItems[listItem].placeHolderText + '. ' + srtObj[0].text);
        if (SequencingApp.AppData.sortItemsType === 'image') {
            var imgDrag = false;
            if (SequencingApp.AppData.sortItemsType === 'image' && SequencingApp.AppData.layoutStyle === 'horizontal') {
                mediaDomContent.innerHTML = '<div style="vertical-align:top;width: 50%;max-height:132px"><img id="img' + listItem + '" src="' + srtObj[0].imageSrc + '" draggable="' + imgDrag + '" alt="' + srtObj[0].altText + '" title="' + srtObj[0].altText + '" aria-labelledby="sortItem' + listItem + '"/></div>';
            } else {
                if (srtObj[0].text === '') {
                    mediaDomContent.innerHTML = '<div style="float:left;margin-right: 4%;margin-top:0px;vertical-align:top;width: 99.5%;display: inline-block;"><img id="img' + listItem + '" src="' + srtObj[0].imageSrc + '" draggable="' + imgDrag + '" alt="' + srtObj[0].altText + '" title="' + srtObj[0].altText + '" aria-labelledby="sortItem' + listItem + '"/></div>';
                } else {
                    mediaDomContent.innerHTML = '<div style="margin-right: 4%;margin-top:0px;vertical-align:top;width: 50%;display: inline-block;"><img id="img' + listItem + '" src="' + srtObj[0].imageSrc + '" draggable="' + imgDrag + '" alt="' + srtObj[0].altText + '" title="' + srtObj[0].altText + '" aria-labelledby="sortItem' + listItem + '"/></div>';
                }
            }
            /*$('#sortList li.vertical img').each(function(index, element){
                        $(element).css('margin-top',($('.sortItem').height()/2)-($(element).height()/2));

                     });*/
            if (SequencingApp.AppData.showSortTitle === false) {
                setTimeout(function() {
                    $('#sortList li.vertical').css('width', '100px');
                    $('.sortable-placeholder .vertical').css('width', '100px');
                    $('.feedbackBar').css('margin-top', -5);
                }, 0);
            } else {
                setTimeout(function() {
                    $('.sortable-placeholder .vertical').css('width', '380px');
                }, 0);
            }

            if (SequencingApp.AppData.sortItemsType === 'image') {
                mediaDomContent.setAttribute('aria-label', SequencingApp.AppData.sortItems[listItem].placeHolderText + '. Graphic. ' + srtObj[0].altText + '. ' + srtObj[0].text);
            }

            if (SequencingApp.AppData.showSortTitle === true) {
                if (srtObj[0].text !== '' && srtObj[0].text != undefined) {
                    $(mediaDomContent).append('<div id="srtObj' + listItem + '" role="option" class="tileTitle"  aria-label="' + SequencingApp.AppData.sortItems[listItem].placeHolderText + '. graphic' + srtObj[0].altText + '. ' + srtObj[0].text + ' ">' + srtObj[0].text + '</div>');
                }
                if (SequencingApp.AppData.layoutStyle === 'vertical') {
                    $(mediaDomContent).append('<div id="feedbackBar" tabindex="-1" class="feedbackBar vertical"></div>');
                    if (srtObj[0].text === '') {
                        $(mediaDomContent).children('#feedbackBar').css('margin-top', '0px');
                    }
                } else {
                    $(mediaDomContent).append('<div id="feedbackBar" tabindex="-1" class="feedbackBar horizontal"></div>');
                }
            } else {
                $(mediaDomContent).append('<div id="feedbackBar" tabindex="-1" class="feedbackBar"></div>');
            }
        } else {
            if (SequencingApp.AppData.layoutStyle === 'vertical') {
                $(mediaDomContent).append('<div class="txt" role="option" aria-label="' + SequencingApp.AppData.sortItems[listItem].placeHolderText + '. ' + srtObj[0].text + ' "> ' + srtObj[0].text + '</div>');
                $(mediaDomContent).append('<div id="feedbackBar"  tabindex="-1"  class="feedbackBar vertical"></div>');
            } else {
                $(mediaDomContent).append('<div id="srtObj' + listItem + '" role="option" aria-label="' + SequencingApp.AppData.sortItems[listItem].placeHolderText + '. ' + srtObj[0].text + ' " class="tileTitle">' + srtObj[0].text + '</div>');
                $(mediaDomContent).append('<div id="feedbackBar"  tabindex="-1"  class="feedbackBar horizontal"></div>');
            }
        }
        sortAppList.appendChild(mediaDomContent);
        if (SequencingApp.AppData.layoutStyle === 'vertical') {
            $(mediaDomContent).children('.txt').css('top', $(mediaDomContent).height() / 2 - $(mediaDomContent).children('.txt').innerHeight() / 2);
            $('#img' + listItem).bind('load', function(e) {
                $(e.currentTarget).css('margin-top', $('.sortItem').height() / 2 - $(e.currentTarget).height() / 2);
            });
        }
    }
    if (SequencingApp.AppData.layoutStyle === 'vertical') {
        if (document.body.getAttribute('browser') === 'firefox') {
            $('#sortList, #placeholderContent').css('margin-top', '20px');
            $('#sortList').css('top', $('#placeholderContent').offset().top);
            if (SequencingApp.AppData.sortItemsType === 'text') {
                setTimeout(function() {
                    $('.placholderTitles .vertical').css('margin-bottom', $('#sortList li.vertical').outerHeight());
                    $('#sortList').css('top', $('#placeholderContent').offset().top - ($('#sortList').offset().top - $('#placeholderContent').offset().top));
                    $('.sortItem').css('margin-top', '39px');
                }, 0);
            } else {
                setTimeout(function() {
                    if (SequencingApp.AppData.placholderTitleStyle === 'arrow') {
                        //$('#sortList').css('top',$('#placeholderContent').offset().top-($('#sortList').offset().top-$('#placeholderContent').offset().top));
                        $('.placholderTitles .vertical').css('margin-bottom', $('.sortItem').height() + 2);
                        $('.sortItem').css('margin-top', $('.placholderTitles .vertical').outerHeight());
                        setTimeout(function() {
                            //$('#sortList li.vertical').height('143px');
                            $('#sortList').css('top', $('#placeholderContent').offset().top - ($('#sortList').offset().top - $('#placeholderContent').offset().top));
                        }, 0);
                    } else {
                        $('.placholderTitles .vertical').css('margin-bottom', $('.sortItem').height() + 2);
                        $('.sortItem').css('margin-top', $('.placholderTitles .vertical').outerHeight());
                        setTimeout(function() {
                            $('#sortList').css('top', $('#placeholderContent').offset().top - ($('#sortList').offset().top - $('#placeholderContent').offset().top));
                        }, 0);
                    }
                }, 0);
            }
        } else {
            if (document.body.getAttribute('browser') === 'chrome') {
                $('#placeholderContent').css('top', Math.round($('#placeholderContent').offset().top));
                $('#sortList').css('top', Math.round($('#placeholderContent').offset().top));
                setTimeout(function() {
                    $('#sortList').css('margin-top', '13px');
                    $('#placeholderContent').css('margin-top', '13px');
                    if (SequencingApp.AppData.sortItemsType === 'image') {
                        $('.placholderTitles .vertical').css('margin-bottom', $('#sortList li.vertical').outerHeight());
                    } else {
                        $('.placholderTitles .vertical').css('margin-bottom', $('#sortList li.vertical').outerHeight());
                    }

                    //$('.sortItem').css('margin-top','38px');
                    //$('.placeholderArrow.vertical').height($('.placeholderTitle').outerHeight());
                    // $('.sortItem').css('margin-top', $('.placeholderTitle').outerHeight() + 'px');
                }, 0);
            }
            if (document.body.getAttribute('browser') === 'safari') {
                $('#placeholderContent').css('top', Math.round($('#placeholderContent').offset().top));
                $('#sortList').css('top', Math.round($('#placeholderContent').offset().top));
                setTimeout(function() {
                    $('#sortList').css('margin-top', '13px');
                    $('#placeholderContent').css('margin-top', '13px');
                    if (SequencingApp.AppData.sortItemsType === 'image') {
                        $('.placholderTitles .vertical').css('margin-bottom', $('#sortList li.vertical').outerHeight());
                    } else {
                        $('.placholderTitles .vertical').css('margin-bottom', '156px');
                    }

                    //$('.sortItem').css('margin-top','38px');
                    // $('.sortItem').css('margin-top', $('.placeholderTitle').outerHeight() + 'px');
                    $('.sortItem').css('margin-bottom', $('.placeholderTitle').outerHeight() + 'px');
                }, 0);
            }
            if (document.body.getAttribute('browser') === 'ie') {
                if (SequencingApp.AppData.sortItemsType === 'text') {
                    $('.placholderTitles .vertical').css('margin-bottom', $('#sortList li.vertical').outerHeight());

                    //$('.sortItem').css('margin-top','0px');
                    $('#sortList').css('top', $('#placeholderContent').offset().top);
                    setTimeout(function() {
                        $('#sortList').css('top', $('#placeholderContent').offset().top - ($('#sortList').offset().top - $('#placeholderContent').offset().top));
                    }, 0);
                } else {
                    $('.placholderTitles .vertical').css('margin-bottom', $('#sortList li.vertical').outerHeight());
                    // $('.sortItem').css('margin-top', $('.placeholderTitle').outerHeight() + 'px');
                    $('.sortItem').css('margin-bottom', $('.placeholderTitle').outerHeight() + 'px');
                    $('#sortList').css('top', $('#placeholderContent').offset().top);
                    $('#sortList').css('margin-top', '13px');
                    $('#placeholderContent').css('margin-top', '13px');
                }
            }
        }
    }
    if (SequencingApp.AppData.sortItemsType === 'text' && SequencingApp.AppData.layoutStyle === 'vertical') {
        //$('#sortList li.vertical').css('padding','5px');
        $('#sortList li.vertical div').addClass('center');
        $('#sortList li.vertical').addClass('textonly');
        $('.placholderTitles .vertical').addClass('textonly');
        if (document.body.getAttribute('browser') === 'firefox') {
            $('#sortList li.vertical').addClass('firefox');
        }
        if (document.body.getAttribute('browser') === 'safari') {
            $('.sortItem.vertical.textonly').css('margin-top', $('.placeholder.placeholderRect.vertical.textonly').css('height'));
            $('#sortList li.vertical').addClass('safari');
            $('#sortList li.vertical').children('#feedbackBar').css('margin-top', '0px');
        }
    }
    $('.exclude').sortable({
		opacity: 1,
        items: ':not(.disabled)',
        forcePlaceholderSize: true
    });
    //$('#sortList').css('width', $('#placeholderContent').width());
    var currentHeight = 0;
    var currentHeightObject;
    if (SequencingApp.AppData.layoutStyle === 'horizontal') {
        setTimeout(function() {
            var currentPLCHeight = 0;
            var currentPLCHeightObject = '';

            //If(SequencingApp.AppData.placholderTitleStyle==="box"){
            $('.placeholderTitle').children('div').each(function(index, element) {
                if (currentPLCHeight < $(element).height()) {
                    currentPLCHeight = $(element).height();
                    currentPLCHeightObject = element;
                }
            });
            $('.placeholderTitle').height(currentPLCHeight + 'px'); //}
        }, 0);
        if (SequencingApp.AppData.placholderTitleStyle === 'arrow') {
            //D2log($('.placeholderTitle').height());
            $('.triangle-right-border div').css('border-top', $('.placeholderTitle').outerHeight() / 2 + 'px solid transparent');
            $('.triangle-right-border div').css('border-bottom', $('.placeholderTitle').outerHeight() / 2 + 'px solid transparent');
            $('.triangle-right-inside div').css('top', '1%');
            $('.triangle-right-inside div').css('border-top', $('.placeholderTitle').outerHeight() / 2 - 1 + 'px solid transparent');
            $('.triangle-right-inside div').css('border-bottom', $('.placeholderTitle').outerHeight() / 2 - 1 + 'px solid transparent');
        }

        //$('.placeholderTitle  div').css('margin-top',($('.placeholderTitle').outerHeight()/2)-($('.placeholderTitle  div').innerHeight/2))
        $('.placeholderTitle  div').each(function(index, element) {
            // D2log(($(element).innerHeight()/2));
            // $(element).css('margin-top', $(element).parent().height() / 2 - $(element).outerHeight() / 2);
        });
        currentHeight = 0;
        currentHeightObject = '';
        $('.sortItem').each(function(index, element) {
			console.log(currentHeightObject);
			console.log($(element).children().first());
			console.log($(element).children().first().outerHeight());
            if (currentHeight < $(element).outerHeight(true)) {
                currentHeight = $(element).outerHeight(true);
                currentHeightObject = element;
            }
        });
		
        if (SequencingApp.AppData.showSortTitle === false) {
            $('.sortItem').each(function(index, element) {
                if (element.id !== currentHeightObject.id) {
                    if ($(element).children('img').length === 0) {
                        $(element).height($(currentHeightObject).height());
                        $(element).children('.tileTitle').height($('.tileTitle').height());
                    }
                }
            });
        }
        if (SequencingApp.AppData.showSortTitle === true) {
            $('.tileTitle').css('max-height', 'none');
            $('.sortItem').each(function(index, element) {
                if (currentHeight < $(element).height()) {
                    currentHeight = $(element).height();
                    currentHeightObject = element;
                }
            });
            var imgHeight = 0;
            setTimeout(function() {
                $('.sortItem').height($(currentHeightObject).height());
                if ($(currentHeightObject).children('img').length > 0) {
                    imgHeight = $(currentHeightObject).children('img').height();
                }
                $('.sortItem').each(function(index, element) {
                    $(element).children('.tileTitle').height($(currentHeightObject).children('.tileTitle').height());
                });
            }, 0);
            setTimeout(function() {
                //d2log($(currentHeightObject).attr('id')+" "+$(currentHeightObject).outerHeight());
                // $('.placeholder').height($(currentHeightObject).height() + $('.placeholderTitle').height());
                // $('.placeholder').css('margin-bottom', $('.placeholderTitle').outerHeight() + 30);
                if (document.body.getAttribute('browser') === 'ie') {
                    $('.sortItem').css('margin-bottom', $('.placeholderTitle').height());
                } else {
                    //  $('.sortItem').css('margin-bottom',  $('.placeholderTitle').outerHeight());
                    // console.log($('.placeholderTitle').outerHeight())
                }
            }, 0);
        } else {
            $('.sortItem .tileTitle').height($(currentHeightObject).children('.tileTitle').height());
        }
    }
    if (document.body.getAttribute('browser') === 'safari') {
        $('#sortList.vertical_ol').css('margin-top', '67px');
    }
    SequencingApp.buildActivityButtons();
    setTimeout(function() {
        if (SequencingApp.AppData.layoutStyle === 'horizontal') {
            //$('#sortList').css('width', $('#placeholderContent').width());
        }
        if (SequencingApp.AppData.layoutStyle === 'vertical') {
            // $('#sortList').width($('#placeholderContent').width());
        }
        if (SequencingApp.AppData.layoutStyle === 'vertical') {
            $('.sortItem').width($('.placeholder').innerWidth() - Number($('.sortItem.vertical').css('padding').split('px')[0]) * 2);
            $('.sortItem').css('margin-top', $('.placeholderTitle').outerHeight() + 'px');
        } else {
            $('.placeholder').css('margin-bottom', $('.sortItem').outerHeight() + $('.placeholder').height());
            $('.sortItem').css('margin-top', $('.placeholderTitle').outerHeight());
            $('.sortItem').css('margin-bottom', $('.placeholder').height());
        }
        $('#head').focus();
    }, 0);
    $(window).resize(function() {
        for (var listItem = 0; listItem < $('.sortItem').length; listItem++) {
            if (listItem > 0 && $('#placeholder' + listItem).offset().left === $('#placeholder0').offset().left) {
                $('#placeholder' + (listItem - 1)).children('span').addClass('arrowHeadEndLine');
            } else {
                //D2log($('.placeholder').width()/2)
                $('#placeholder' + (listItem - 1)).children('span').removeClass('arrowHeadEndLine');
                var currentPLCHeight = 0;
                var currentPLCHeightObject = '';
                $('.placeholderTitle').children('div').each(function(index, element) {
                    if (currentPLCHeight < $(element).height()) {
                        currentPLCHeight = $(element).height();
                        currentPLCHeightObject = element;
                    }
                });
                $('.placeholderTitle').height(currentPLCHeight + 'px');
                $('.triangle-down-border').css('padding-left', $('.placeholder').width() / 2 - 20 + 'px');
                $('.triangle-down-inside').css('padding-left', $('.placeholder').innerWidth() / 2 - 20);
                $('.placeholderArrow.vertical').height($('.placeholderTitle').outerHeight());
                $('.triangle-down-border').css('top', '100%');
                if (document.body.getAttribute('browser') === 'firefox') {
                    $('.triangle-down-inside').css('top', '95%');
                } else {
                    $('.triangle-down-inside').css('top', '96%');
                }
                $('.placeholderArrow.vertical').height($('.placeholderTitle').outerHeight());
                $('#sortList').width($('#placeholderContent').width());
                if (SequencingApp.AppData.layoutStyle === 'vertical') {
                    $('.sortItem').width($('.placeholder').innerWidth() - Number($('.sortItem.vertical').css('padding').split('px')[0]) * 2);
                    $('.sortItem').css('margin-top', $('.placeholderTitle').outerHeight() + 'px');
                } else {
                }
            }

            //D2log(SequencingApp.AppData.layoutStyle)
            if (SequencingApp.AppData.layoutStyle === 'vertical') {
                $('#sortList li.vertical img').each(function(index, element) {
                    $(element).css('margin-top', $('.sortItem').height() / 2 - $(element).height() / 2);
                });
            }

            $('#sortList').width($('#placeholderContent').width());

        }
    });

   $('#sortList').width($('#placeholderContent').width());

};

/**
 * Shuffles an array of items
 *
 * @method shuffleArray
 * @param {array} arr
 * @return {array} arr
 */
SequencingApp.shuffleArray = function(arr) {
    var arr = arr.slice(0);
    for (var i = 0; i < arr.length; i++) {
        var j = Math.floor(Math.random() * i);
        var temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
    return arr;
};

/**
 * Auto-select fix for IE9
 *
 * @method autoSelect
 * @param {} selectTarget
 * @return {}
 */
SequencingApp.autoSelect = function(selectTarget) {
    // IE
    var browserName = document.body.getAttribute('browser');
    var browserversion = document.body.getAttribute('browserversion');
    if (browserName === 'ie' && browserversion === 9) {
        var range = document.body.createTextRange();
        range.moveToElementText(selectTarget);
        range.select();
    }
};

/**
 * Check answers for continuous version sequencing
 *
 * @method checkContinuousAnswers
 * @return {}
 */
SequencingApp.checkContinuousAnswers = function() {
    SequencingApp.userResult = [];
    SequencingApp.correct = 0;
    SequencingApp.addFeedbackLegend();
    $('#sortList li').each(function(index, element) {
        $(element).children('.feedbackBar').removeClass('correct');
        $(element).children('.feedbackBar').removeClass('incorrect');
        if (index === $(element).data('correctPos')) {
            if (SequencingApp.AppData.FeedbackType === 'continuous' || SequencingApp.isRetry === true) {
                $(element).children('.feedbackBar').addClass('correct');
                if ($(element).children('.tileTitle').length > 0) {
                    if (SequencingApp.AppData.sortItemsType === 'text') {
                        $(element).attr('aria-label', $('#placeholder' + $(element).index() + ' div').children('div').text() + '. ' + $(element).children('.tileTitle').text() + ' correct');
                    } else {
                        $(element).attr('aria-label', $('#placeholder' + $(element).index() + ' div').children('div').text() + '. Graphic. ' + $($(element).children('div')[0]).children('img').attr('alt') + ' ' + $(element).children('.tileTitle').text() + ' correct');
                    }
                    $(element).children('.tileTitle').attr('aria-label', $(element).attr('aria-label'));
                } else {
                    if ($($(element).children('div')[0]).children('img').length != 0) {
                        if ($(element).children('.txt').length === 0) {
                            $(element).attr('aria-label', $('#placeholder' + $(element).index() + ' div').children('div').text() + '. Graphic. ' + $($(element).children('div')[0]).children('img').attr('alt') + ' ' + ' correct');
                            $($(element).children('div')[0]).attr('aria-label', $(element).attr('aria-label'));
                            $($(element).children('div')[0]).children('img').attr('aria-labelledby', $(element).attr('id'));
                        } else {
                            $(element).attr('aria-label', $('#placeholder' + $(element).index() + ' div').children('div').text() + '. Graphic. ' + $($(element).children('div')[0]).children('img').attr('alt') + ' ' + $(element).children('.txt').text() + ' correct');
                        }
                    } else {
                        $(element).attr('aria-label', $('#placeholder' + $(element).index() + ' div').children('div').text() + ' ' + $(element).children('.txt').text() + ' correct');
                    }
                    $(element).children('.txt').attr('aria-label', $(element).attr('aria-label'));
                }
                $(element).attr('aria-posinset', $(element).index() + 1);
            }
            SequencingApp.correct++;
            SequencingApp.userResult.push({
                'result': 'Correct',
                'correctStepAnswer': SequencingApp.AppData.sortItems[$(element).index()],
                'userStepAnswer': SequencingApp.AppData.sortItems[$(element).data('correctPos')]
            });
        } else {
            SequencingApp.userResult.push({
                'result': 'Incorrect',
                'correctStepAnswer': SequencingApp.AppData.sortItems[$(element).index()],
                'userStepAnswer': SequencingApp.AppData.sortItems[$(element).data('correctPos')]
            });
            if (SequencingApp.AppData.FeedbackType === 'continuous' || SequencingApp.isRetry == true) {
                $(element).children('.feedbackBar').addClass('incorrect');
                if ($(element).children('.tileTitle').length > 0) {
                    if (SequencingApp.AppData.sortItemsType === 'text') {
                        $(element).attr('aria-label', $('#placeholder' + $(element).index() + ' div').children('div').text() + '. ' + $(element).children('.tileTitle').text() + ' incorrect');
                    } else {
                        $(element).attr('aria-label', $('#placeholder' + $(element).index() + ' div').children('div').text() + '. Graphic. ' + $($(element).children('div')[0]).children('img').attr('alt') + ' ' + $(element).children('.tileTitle').text() + ' incorrect');
                    }
                    $(element).children('.tileTitle').attr('aria-label', $(element).attr('aria-label'));
                } else {
                    if ($($(element).children('div')[0]).children('img').length != 0) {
                        if ($(element).children('.txt').length === 0) {
                            $(element).attr('aria-label', $('#placeholder' + $(element).index() + ' div').children('div').text() + '. Graphic. ' + $($(element).children('div')[0]).children('img').attr('alt') + ' ' + ' incorrect');
                            $($(element).children('div')[0]).attr('aria-label', $(element).attr('aria-label'));
                            $($(element).children('div')[0]).children('img').attr('aria-labelledby', $(element).attr('id'));
                        } else {
                            $(element).attr('aria-label', $('#placeholder' + $(element).index() + ' div').children('div').text() + '. Graphic. ' + $($(element).children('div')[0]).children('img').attr('alt') + ' ' + $(element).children('.txt').text() + ' incorrect');
                        }
                    } else {
                        $(element).attr('aria-label', $('#placeholder' + $(element).index() + ' div').children('div').text() + ' ' + $(element).children('.txt').text() + ' incorrect');
                    }
                }
                $(element).attr('aria-posinset', $(element).index() + 1);
            }
        }
    });
    if (SequencingApp.correct === SequencingApp.totalsortItems) {
        SequencingApp.activityStatus = 'answersChecked';
        $('.exclude').sortable('destroy');
        if (SequencingApp.isRetry === false) {
            SEQ_buttonSet.removeChild(SEQ_resetButton);

            if (SequencingApp.noPost === true) {
                SEQ_buttonSet.appendChild(SequencingApp.resetButton);
            } else {
                SEQ_buttonSet.appendChild(SequencingApp.postQuizButton);
            }
        }
        $('#sortList li').each(function(index, element) {
            $(element).unbind('keydown');
            $(element).unbind('touchstart');
            $(element).unbind('touchmove');
            $(element).unbind('touchEnd');
        });
        setTimeout(function() {
            $('body').append('<div id="ariaAlert" role="alert" aria-live="assertive" style="left:9999;position:absolute"> You have completed the activity. Click on the Finish Activity button to proceed.</div>');
            setTimeout(function() {
                $('#ariaAlert').remove();
            }, 1000);
        }, 3000);
    }
};

/**
 * Check answers for reporting version sequencing
 *
 * @method checkAnswers
 * @return {}
 */
SequencingApp.checkAnswers = function() {
    SequencingApp.userResult = [];
    SequencingApp.correct = 0;
    SequencingApp.activityStatus = 'answersChecked';
    $('.exclude').sortable('destroy');
    $('#sortList li.sortItem').each(function(index, element) {
        //$(element).removeClass('sortItem');
        $(element).unbind('keydown');
        $(element).unbind('touchstart');
        $(element).unbind('touchmove');
        $(element).unbind('touchEnd');
        $(element).children('.feedbackBar').removeClass('correct');
        $(element).children('.feedbackBar').removeClass('incorrect');
        if (index === $(element).data('correctPos')) {
            if (SequencingApp.AppData.FeedbackType === 'continuous') {
                $(element).children('.feedbackBar').addClass('correct');
                $(element).attr('aria-label', $('#placeholder' + $(element).index() + ' div').children('div').text() + ' ' + $(element).children('.tileTitle').text() + ' correct');
                $(element).children('.tileTitle').attr('aria-label', $(element).attr('aria-label'));
            }
            $(element).children('.feedbackBar').addClass('correct');
            SequencingApp.correct++;
            SequencingApp.userResult.push({
                'result': 'Correct',
                'correctStepAnswer': SequencingApp.AppData.sortItems[$(element).index()],
                'userStepAnswer': SequencingApp.AppData.sortItems[$(element).data('correctPos')]
            });
        } else {
            SequencingApp.userResult.push({
                'result': 'Incorrect',
                'correctStepAnswer': SequencingApp.AppData.sortItems[$(element).index()],
                'userStepAnswer': SequencingApp.AppData.sortItems[$(element).data('correctPos')]
            });
            if (SequencingApp.AppData.FeedbackType === 'continuous') {
                $(element).children('.feedbackBar').addClass('incorrect');
                $(element).attr('aria-label', $('#placeholder' + $(element).index() + ' div').children('div').text() + ' ' + $(element).children('.tileTitle').text() + ' incorrect');
                $(element).children('.tileTitle').attr('aria-label', $(element).attr('aria-label'));
            }
            $(element).children('.feedbackBar').addClass('incorrect');
        }
        SequencingApp.addFeedbackLegend();
    });
    SequencingApp.usersSequence = $('#placeholderContent').clone(true);
    SequencingApp.usersSequence2 = $('#sortList').clone(true);
    SequencingApp.usersSequence3 = $('#sortList').clone(true);
    SequencingApp.sortlistClass = $('#sortList').attr('class');
    SequencingApp.sortlistliHeight = $('.sortItem').css('height');
    SequencingApp.sortlistliTop = $('.sortItem').css('margin-top');
    SequencingApp.sortlistlibottom = $('.sortItem').css('margin-bottom');
    if (SequencingApp.AppData.FeedbackType === 'report') {
        SequencingApp.buildReport();
    }
    $('#SEQ_buttonSet').remove();
    var SEQ_buttonSet = document.createElement('div');
    SEQ_buttonSet.id = 'SEQ_buttonSet';
    SEQ_appContainer.appendChild(SEQ_buttonSet);
    // if (SequencingApp.correct < SequencingApp.totalsortItems) {
    //     SEQ_buttonSet.appendChild(SequencingApp.tryAgainButton);
    //     SequencingApp.tryAgainButton.setAttribute('tabindex', SequencingApp.ti);
    //     SequencingApp.ti++;
    // }

    if (SequencingApp.noPost === true) {
        SEQ_buttonSet.appendChild(SequencingApp.restartButton);
        SequencingApp.resetButton.setAttribute('tabindex', SequencingApp.ti);
        SequencingApp.ti++;
    } else {
        SEQ_buttonSet.appendChild(SequencingApp.postQuizButton);
        SequencingApp.resetButton.setAttribute('tabindex', SequencingApp.ti);
        SequencingApp.ti++;
    }
};

/**
 * Builds the report for reporting version sequencing
 *
 * @method buildReport
 * @return {}
 */
SequencingApp.buildReport = function() {
    $('#head').focus();
    SequencingApp.clearStage();
    var SEQ_report = document.createElement('div');
    SEQ_report.setAttribute('id', 'SEQ_report');
    SEQ_report.setAttribute('aria-live', 'agressive');
    SEQ_report.setAttribute('tabindex', '1');
    SEQ_report.setAttribute('role', 'region');
    SEQ_appContainer = document.getElementById('SEQ_appContainer');
    SEQ_appContainer.appendChild(SEQ_report);
    SEQ_appContainer.style.width = '100%';

    var resultsHeader = document.createElement('h' + (SequencingApp.headingLevel + 1));
    resultsHeader.setAttribute('class', 'SEQ_reportHeader');
    resultsHeader.innerHTML = 'Results:';
    SEQ_report.appendChild(resultsHeader);

    var userResultsHeader = document.createElement('h' + (SequencingApp.headingLevel + 2));
    userResultsHeader.setAttribute('role', 'heading');
    userResultsHeader.setAttribute('class', 'SEQ_scoreHeader');
    SEQ_report.setAttribute('aria-label', 'Results: You scored ' + SequencingApp.correct + ' out of ' + SequencingApp.totalsortItems + ' tab over each section for more detail');
    userResultsHeader.innerHTML = 'You scored ' + SequencingApp.correct + '/' + SequencingApp.totalsortItems + '.';
    userResultsHeader.setAttribute('aria-label', 'You scored ' + SequencingApp.correct + ' out of ' + SequencingApp.totalsortItems);

    var sectionTitle = document.createElement('p');
    sectionTitle.innerHTML = '<strong>Correct Sequence:</strong>';
    sectionTitle.id = 'correctSeq';
    SEQ_report.appendChild(userResultsHeader);
    // SEQ_report.appendChild(sectionTitle);

    var sectionContainer = document.createElement('div');
    sectionContainer.id = 'userResults';
    // var mediaDomContent = document.createElement('ol');
    // mediaDomContent.setAttribute('id', 'placeholderContent');
    // mediaDomContent.setAttribute('class', 'placholderTitles');
    // mediaDomContent.setAttribute('role', 'list');
    // mediaDomContent.setAttribute('aria-hidden', 'true');
    // mediaDomContent.style.display = 'inline-block';
    // $(mediaDomContent).append(SequencingApp.usersSequence.html());

    // var mediaDomContent = document.createElement('ol');
    // mediaDomContent.setAttribute('id', 'sortList');
    // mediaDomContent.setAttribute('role', 'list');
    // mediaDomContent.setAttribute('class', SequencingApp.sortlistClass);
    // mediaDomContent.style.position = 'absolute';
    // SEQ_report.appendChild(mediaDomContent);

    //SortAppContainer.appendChild(mediaDomContent);
    // SEQ_report.appendChild(mediaDomContent);
    SEQ_report.appendChild(sectionContainer);

    // $('#userResults').height($('.placeholderContent').innerHeight());
    // $('#sortList').css('top', $('#placeholderContent').offset().top);
    // $('#sortList').attr('aria-label', $('#correctSeq').text());
    for (var n in SequencingApp.userResult) {
        // for (var i = 0; i < SequencingApp.totalsortItems; i++) {
        //     if (SequencingApp.usersSequence2.children('#sortItem' + i).data('correctPos') === Number(n)) {
        //         $(SequencingApp.usersSequence2.children('#sortItem' + i)).attr('aria-posinset', i + 1);
        //         $(mediaDomContent).append(SequencingApp.usersSequence2.children('#sortItem' + i));
        //         $(mediaDomContent).children('#sortItem' + i).attr('aria-posinset', Number(n) + 1);
        //         if ($($(mediaDomContent).children('#sortItem' + i).children('div')[0]).children('img').length > 0) {
        //             $(mediaDomContent).children('#sortItem' + i).attr('aria-label', $('#placeholder' + n).children('.placeholderTitle ').text() + '. Graphic. ' + $($(mediaDomContent).children('#sortItem' + i).children('div')[0]).children('img').attr('alt') + ' ' + $(mediaDomContent).children('#sortItem' + i).children().text());
        //             $($(mediaDomContent).children('#sortItem' + i)).children('.tileTitle').attr('aria-label', $(mediaDomContent).children('#sortItem' + i).attr('aria-label'));
        //         } else {
        //             $(mediaDomContent).children('#sortItem' + i).attr('aria-label', $('#placeholder' + n).children('.placeholderTitle ').text() + '. ' + $(mediaDomContent).children('#sortItem' + i).children().text());
        //             $($(mediaDomContent).children('#sortItem' + i)).children('.tileTitle').attr('aria-label', $(mediaDomContent).children('#sortItem' + i).attr('aria-label'));
        //         }
        //     }
        // }
        // setTimeout(function() {
        //     $('.sortItem').css('height', SequencingApp.sortlistliHeight);
        //     $('.sortItem').css('margin-top', SequencingApp.sortlistliTop);
        //     $('.sortItem').css('margin-bottom', SequencingApp.sortlistlibottom);
        //     $('#sortList').css('top', $('#placeholderContent').position().top);
        // }, 0);

        // Step breakdown starts
		
        var imageSrc;
        if (SequencingApp.userResult[n].result === 'Correct') {
            imageSrc = '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAAaVBMVEUAAAD///8AtE8AtE8AtE8AtE8AtE8AtE8AtE8AtE8AtE8AtE8AtE8AtE8AtE8AtE8AtE8AtE8AtE8AtE8AtE8AtE8AtE8AtE8AtE8AtE8AtE8AtE8AtE8AtE8AtE8AtE8AtE8AtE8AtE/Gi+VPAAAAInRSTlMAAAMGCg8VGxwkRk5bYWl4f4CIpbK6vsjJy9HT3OPk9vr9CZah7wAAAI1JREFUKM+V0ssSwiAMheF4q1Cq1Xq3SPF//4d0IXacEmY0K/KdTSZBZoWSYqBV14nuoCZ7gF3uLQCHks+nvgXguPjVNwCcMm+eAOflp210dzG69AC4rkaH6HKXG0CspY4A99Gl6gGGdgDoq69R3gmZixif3K8n46fEm2xxJgAPo5zABoJVj2Yvmf/9S17ioBIDP/nF2AAAAABJRU5ErkJggg==" alt="">';
        } else {
            imageSrc = '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYBAMAAAASWSDLAAAAFVBMVEUAAADsAETsAETsAETsAETsAETsAESbXnh7AAAABnRSTlMAHDfN3PHYCvCAAAAAaklEQVQY02NgUBZgAANGIwYGpjBHCEckVYFBNS0FLMXolhbEYJaWBpYSSUtLBhEgKaAEUBBCwsTAFFQIIgWVgEhBJSBSMAmwFEwCIgWTQOUgK0MxANloFEuRnYPiUBQvoHgOxdsoAYIcVACPxDI1J3AY4QAAAABJRU5ErkJggg==" alt="">';
        }		
		
        var sectionContainer = document.createElement('div');
        sectionContainer.setAttribute('aria-describedby', 'step' + (Number(n) + 1));
        sectionContainer.setAttribute('tabindex', 1);
        SEQ_report.appendChild(sectionContainer);

        var stepResultsHeader = document.createElement('h' + (SequencingApp.headingLevel + 2));
        stepResultsHeader.innerHTML = 'Step ' + (Number(n) + 1);
		stepResultsHeader.innerHTML += '<div id=\'userResult\'>' + imageSrc + ' <strong style=\'vertical-align: super;\'>' + SequencingApp.userResult[n].result + '.</strong></div>'
		
        sectionContainer.appendChild(stepResultsHeader);
        sectionContainer.id = 'step' + (Number(n) + 1);
        if (n % 2 === 1) {
            stepResultsHeader.setAttribute('class', 'placeholderTitle SEQ_stepHeader');

        } else {
            stepResultsHeader.setAttribute('class', 'placeholderTitle2 SEQ_stepHeader');
        }


        var stepYourAnswer = document.createElement('div');
        $(stepYourAnswer).addClass('SEQ_userAns');
		
        stepYourAnswer.id = 'yourChoice' + (Number(n) + 1);
        if (SequencingApp.userResult[n].result !== 'Correct') {
            stepYourAnswer.setAttribute('aria-label', 'Your choice incorrect.');
        } else {
            stepYourAnswer.setAttribute('aria-label', 'Your choice correct.');
        }

        // sectionContainer.appendChild(stepYourAnswer);
        if (SequencingApp.userResult[n].result !== 'Correct') {
            var stepYourImg = document.createElement('div');
            if (SequencingApp.AppData.sortItemsType === 'image') {
                stepYourAnswer.innerHTML += '<div class="result hasImage" id="result' + n + '"><img class="imgthumb" alt="' + SequencingApp.userResult[n].userStepAnswer.altText + '" src="' + SequencingApp.userResult[n].userStepAnswer.imageSrc + '" /><div>' + SequencingApp.userResult[n].userStepAnswer.text + '</div></div>';
            } else {
                stepYourAnswer.innerHTML += '<div class="result" id="result' + n + '"><div><strong>Your choice:</strong> ' + SequencingApp.userResult[n].userStepAnswer.text + '</div></div>';
            }
            // sectionContainer.appendChild(stepYourImg);
        } else {
            var stepYourImg = document.createElement('div');
            if (SequencingApp.AppData.sortItemsType === 'image') {
                stepYourAnswer.innerHTML += '<div class="result hasImage" id="result' + n + '"><img class="imgthumb" alt="' + SequencingApp.userResult[n].userStepAnswer.altText + '" src="' + SequencingApp.userResult[n].userStepAnswer.imageSrc + '" /><div>' + SequencingApp.userResult[n].userStepAnswer.text + '</div></div>';
            } else {
                stepYourAnswer.innerHTML += '<div class="result" id="result' + n + '"><strong>Your choice:</strong> ' + SequencingApp.userResult[n].userStepAnswer.text + '</div>';
            }
            // sectionContainer.appendChild(stepYourImg);
        }


        // sectionContainer.appendChild(stepYourAnswer);
        $(stepYourAnswer).hide().appendTo(sectionContainer).fadeIn(500);

        var stepCorrectAnswer = document.createElement('div');
        $(stepCorrectAnswer).addClass('SEQ_corrAns')
            // stepCorrectAnswer.innerHTML = '<strong>Correct choice:</strong>';
        stepCorrectAnswer.setAttribute('aria-describedby', 'correctResult' + n);
        // sectionContainer.appendChild(stepCorrectAnswer);

        if (SequencingApp.userResult[n].result !== 'Correct') {
            // var stepCorrectAnswer = document.createElement('p');
            if (SequencingApp.AppData.sortItemsType === 'image') {
                stepCorrectAnswer.innerHTML = '<p><strong>Correct choice:</strong></p><div class="result hasImage" id="correctResult' + n + '"><img class="imgthumb" alt="' + SequencingApp.userResult[n].correctStepAnswer.altText + '" src="' + SequencingApp.userResult[n].correctStepAnswer.imageSrc + '" /><div>' + SequencingApp.userResult[n].correctStepAnswer.text + '</div></div>';
            } else {
                stepCorrectAnswer.innerHTML = '<div class="result" id="correctResult' + n + '"><strong>Correct choice:</strong> ' + SequencingApp.userResult[n].correctStepAnswer.text + '</div>';
            }
        }
        // else {
        //     var stepCorrectAnswer = document.createElement('p');
        //     if (SequencingApp.AppData.sortItemsType === 'image') {
        //         stepCorrectAnswer.innerHTML = '<p><strong>Correct choice:</strong></p><div class="result" id="correctResult' + n + '"><img class="imgthumb" alt="' + SequencingApp.userResult[n].correctStepAnswer.altText + '" src="' + SequencingApp.userResult[n].userStepAnswer.imageSrc + '" /><div>' + SequencingApp.userResult[n].userStepAnswer.text + '</div></div>';
        //     } else {
        //         stepCorrectAnswer.innerHTML = '<p><strong>Correct choice:</strong></p><div class="result" id="correctResult' + n + '"><div>' + SequencingApp.userResult[n].userStepAnswer.text + '</div></div>';
        //     }
        // }
        // sectionContainer.appendChild(stepCorrectAnswer);
        $(stepCorrectAnswer).hide().appendTo(sectionContainer).fadeIn(500);

        var stepFeedback = document.createElement('div');
        $(stepFeedback).addClass('SEQ_feedback bg-light');
        if (SequencingApp.userResult[n].result !== 'Correct') {
			
            if (SequencingApp.AppData.sortItems[n].incorrectFeedback !== 'none' &&
                SequencingApp.AppData.sortItems[n].incorrectFeedback !== null &&
                SequencingApp.AppData.sortItems[n].incorrectFeedback !== undefined &&
                SequencingApp.AppData.sortItems[n].incorrectFeedback !== '') {
                stepFeedback.innerHTML = '<p><strong>Feedback:</strong><br>' + SequencingApp.AppData.sortItems[n].incorrectFeedback + '</p>';
                // sectionContainer.appendChild(stepFeedback);
                $(stepFeedback).hide().appendTo(sectionContainer).slideDown(500);
            }
        } else {
            if (SequencingApp.AppData.sortItems[n].correctFeedback !== 'none' &&
                SequencingApp.AppData.sortItems[n].correctFeedback !== null &&
                SequencingApp.AppData.sortItems[n].correctFeedback !== undefined &&
                SequencingApp.AppData.sortItems[n].correctFeedback !== '') {

                stepFeedback.innerHTML = '<p><strong>Feedback:</strong><br>' + SequencingApp.AppData.sortItems[n].correctFeedback + '</p>';
                // sectionContainer.appendChild(stepFeedback);
                $(stepFeedback).hide().appendTo(sectionContainer).slideDown(500);
            }
        }

    }
    if (SequencingApp.AppData.layoutStyle === 'vertical') {
        $('#sortList').css('width', $('#placeholderContent').children().width());
    } else {
        $('#sortList').css('width', $('#placeholderContent').width());
    }
    setTimeout(function() {
        $('.result div').children('iframe').attr('tabindex', 1);
        $('.result div').children('a').attr('tabindex', 1);
        if (SequencingApp.AppData.layoutStyle === 'vertical') {
            $('#sortList').css('width', $('#placeholderContent').children().width());
            $('.sortItem').css('width', $('#placeholderContent').width());
        } else {
            $('#sortList').css('width', $('#placeholderContent').width());
        }

        //
        $('.placeholderArrow.vertical').height($('.placeholderTitle').outerHeight());
        $('#SEQ_appContainer').focus();
    }, 0);
};

/**
 * Resets the activity to original state
 *
 * @method reset
 * @return
 */
SequencingApp.reset = function() {
    SequencingApp.isRetry = false;
    SequencingApp.clearStage();
    if (SequencingApp.AppData.PreActivityText === 'none') {
        if (SequencingApp.AppData.PreActivityMedia === 'none') {
            SequencingApp.buildActivity();
        } else {
            SequencingApp.buildPreActivity();
        }
    } else {
        SequencingApp.buildPreActivity();
    }
    $('html, body').animate({ scrollTop: 0 }, 'slow');
    if (window.parent !== null) {
        $('html, body', window.parent.document).animate({ scrollTop: 0 }, 'slow');
    }
};

/**
 * Adds a legend explaining what the feedback colors mean
 *
 * @method addFeedbackLegend
 * @return {} outputs HTML
 */
SequencingApp.addFeedbackLegend = function() {
    // $('.legendcnt').html('<span class="legend correct" title="Solid Green legend"></span><span>Correct</span> <span class="legend incorrect" title="Striped Red legend"></span><span>Incorrect</span>');
};


/**
 * Generic D2L logging method. Used to try and prevent large amounts of console logging in production
 *
 * @method d2log
 * @param {string} m
 * @return {} Console logs m
 */
function d2log(m) {
    if (typeof D2LDEBUG !== 'undefined') {
        if (D2LDEBUG) {
            console.log(m);
        }
    }
}