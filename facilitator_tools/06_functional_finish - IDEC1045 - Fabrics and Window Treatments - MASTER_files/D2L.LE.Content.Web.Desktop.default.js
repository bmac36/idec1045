D2L.LE.Content={Desktop:{}};
D2L.LE.Content.Desktop.CompletionMethod={JsFunction:undefined,RegisterHandler:function(jsFunction){this.JsFunction=jsFunction},CompletionChanged:function(){if(this.JsFunction!==undefined)this.JsFunction.call()}};
D2L.LE.Content.Desktop.ContentObjectDatalistRefreshed={Actions:function(){var that={};var JsFunctions=[];that.RegisterHandler=function(jsFunction){JsFunctions.push(jsFunction)};that.Refreshed=function(){for(var i=0;i<JsFunctions.length;i++){JsFunctions[i].call();JsFunctions.splice(i,1)}};return that}()};D2L.LE.Content.Desktop.Topic={OpenInNewWindow:function(url){var win=window.open(url,"_blank");if(win)win.focus()}};if(window["D2L"]!==undefined&&D2L.LP.Web.Packaging!==undefined)D2L.LP.Web.Packaging.Register("D2L.LE.Content.Web.Desktop.default");
