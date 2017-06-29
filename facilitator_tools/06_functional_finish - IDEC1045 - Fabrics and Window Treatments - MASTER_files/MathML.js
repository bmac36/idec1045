/**
* @namespace
*/
D2LMathML = {

	IsLatex: false,

	IsMathJaxRequested: false,

	ReadyState: null,

	/**
	* @private
	*/
	m_message: '',

	/**
	* @private
	*/
	m_afterPartialHandler: null,

	/**
	* @private
	*/
	m_hasAfterPartialEvent: function() {
		return (window.D2L && window.D2L.LP && window.D2L.LP.Web
			&& window.D2L.LP.Web.UI && window.D2L.LP.Web.UI.Html
			&& window.D2L.LP.Web.UI.Html.PartialRendering
			&& window.D2L.LP.Web.UI.Html.PartialRendering.OnAfter);
	},

	/**
	* @private
	*/
	MobileInit: function (message) {
		D2LMathML.m_message = message;
	},

	DesktopInit: function (mathMLUrl, latexUrl) {

		var isMathJaxLoaded = function () {
			if (document.head.querySelector('#mathJax')) {
				return true;
			}
			return false;
		};

		var isMathJaxRequired = function () {
		    if (this.IsLatex || this.IsMathJaxRequested || document.querySelector('math')) {
				return true;
			}
			return false;
		}.bind(this);

		var loadMathJax = function () {

			if (D2LMathML.ReadyState) {
				return;
			}

			D2LMathML.ReadyState = 'loading';

			var mathJaxConfig = {
				delayStartupUntil: "onload",
				showProcessingMessages: false,
				messageStyle: "none",
				menuSettings: {
					context: "MathJax",
					zoom: "None"
				},
				NativeMML: {
					showMathMenuMSIE: false,
					scale: 140
				},
				"HTML-CSS": {
					linebreaks: {
						automatic: true,
						width: "container"
					},
					imageFont: null,
					scale: 130
				},
				styles: {
					".MathJax .merror": {
						"background-color": "#fff !important",
						color: "#565a5c !important",
						border: "1px solid #cd2026 !important"
					}
				}
			};

			var configScript = 'MathJax.Hub.Config(' + JSON.stringify(mathJaxConfig) + ');';
			var script = document.createElement('script');
			script.type = 'text/x-mathjax-config';
			script.textContent = configScript;
			document.head.appendChild(script);

			var mathJaxScript = document.createElement('script');
			mathJaxScript.id = 'mathJax';
			mathJaxScript.type = 'text/javascript';
			mathJaxScript.async = 'async';
			mathJaxScript.onload = function () {
				D2LMathML.ReadyState = 'ready';
			};
			mathJaxScript.src = D2LMathML.IsLatex ? latexUrl : mathMLUrl;
			document.head.appendChild(mathJaxScript);

		}.bind(this);

		if (isMathJaxLoaded()) {
			return;
		}

		if (isMathJaxRequired()) {
			loadMathJax();
		} else if (this.m_hasAfterPartialEvent() && !this.m_afterPartialHandler) {
			this.m_afterPartialHandler = function () {
				if (isMathJaxLoaded() || !isMathJaxRequired()) {
					return;
				}
				loadMathJax();
				D2L.LP.Web.UI.Html.PartialRendering.OnAfter.RemoveListener(this.m_afterPartialHandler);
				D2L.LP.Web.UI.Common.Controls.HtmlBlock.OnAfterRender.RemoveListener(this.m_afterPartialHandler);
				this.m_afterPartialHandler = null;
			}.bind(this);
			D2L.LP.Web.UI.Html.PartialRendering.OnAfter.AddListener(this.m_afterPartialHandler);
			D2L.LP.Web.UI.Common.Controls.HtmlBlock.OnAfterRender.AddListener(this.m_afterPartialHandler);
		}

	}
};