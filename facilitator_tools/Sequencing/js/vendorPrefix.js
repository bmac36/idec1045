/**
* Detects browser, version and operating system and inserts as data attributes into the body tag
*
* @class VendorPrefix
*/ 
var userBrowser = null;
var userDesktopBrowserVersion = null;
var verOffset= null;
var ver= null;
var trimmer = null;
var userDevice = null;
var userOS = null;

/**
 * Main controller
 *
 * @method detectBrowserData
 * @return 
 */
function detectBrowserData(){
   userDevice = "desktop";
   var ua = window.navigator.userAgent
   if(ua.match(/(iPhone|iPod|iPad)/)){
      userDevice = "mobile"
   }
   if(ua.match(/(Android)/)){
      userDevice = "mobile"
   }
   document.body.setAttribute('userDevice',userDevice);
   browserDetection();
   OSDetection();
}

/**
 * Detects browser and browser version
 *
 * @method browserDetection
 * @return 
 */
function browserDetection() {
   //Check if browser is IE or not
   if (navigator.userAgent.search("Safari") >= 0 && navigator.userAgent.search("Windows") >= 0 && window.chrome === undefined && navigator.userAgent.search("Firefox") < 0&&window.opr === undefined) {
      verOffset=navigator.userAgent.indexOf("Safari")
      ver= navigator.userAgent.substring(verOffset+7);
      userDesktopBrowserVersion = ver//.substring(0,trimmer);
      userBrowser = 'safari'
      document.body.setAttribute('browser',userBrowser);
      document.body.setAttribute('browserversion',userDesktopBrowserVersion);
      return
   } else if (navigator.userAgent.search("Windows") >= 0 && navigator.userAgent.search("Chrome") < 0 && window.chrome === undefined && navigator.userAgent.search("Firefox") < 0&&window.opr === undefined) {
      verOffset=navigator.userAgent.indexOf("rv")
      if(verOffset!==-1){
         ver= navigator.userAgent.substring(verOffset+3);
         trimmer = ver.indexOf(') ')
         userDesktopBrowserVersion = ver.substring(0,trimmer);
      } else {
         verOffset=navigator.userAgent.indexOf("MSIE");
         ver= navigator.userAgent.substring(verOffset+5);
         trimmer = ver.indexOf('; ')
         userDesktopBrowserVersion = ver.substring(0,trimmer);
      }
      userBrowser = 'ie';
      document.body.setAttribute('browser',userBrowser);
      document.body.setAttribute('browserversion',userDesktopBrowserVersion);
      return
   } else if (navigator.userAgent.search("Chrome") >= 0&&window.opr===undefined) { //Check if browser is Chrome or not
      verOffset=navigator.userAgent.indexOf("Chrome")
      ver= navigator.userAgent.substring(verOffset+7);
      trimmer = ver.indexOf(' ')
      userDesktopBrowserVersion = ver.substring(0,trimmer);
      userBrowser = 'chrome'
      document.body.setAttribute('browser',userBrowser);
      document.body.setAttribute('browserversion',userDesktopBrowserVersion);
      return
   } else if (navigator.userAgent.search("Firefox") >= 0&&window.opr===undefined) { //Check if browser is Firefox or not
      verOffset=navigator.userAgent.indexOf("Firefox")
      ver= navigator.userAgent.substring(verOffset+8);  
      userDesktopBrowserVersion = ver//.substring(0,trimmer);
      userBrowser = 'firefox'
      document.body.setAttribute('browser',userBrowser);
      document.body.setAttribute('browserversion',userDesktopBrowserVersion);
      return
   } else if (navigator.userAgent.search("Safari") >= 0 && window.chrome===undefined&&window.opr===undefined) { //Check if browser is Safari or not
      verOffset=navigator.userAgent.indexOf("Safari")
      ver= navigator.userAgent.substring(verOffset+5);
      trimmer = ver.indexOf(' ')
      userDesktopBrowserVersion = ver//.substring(0,trimmer);
      userBrowser = 'safari'
      document.body.setAttribute('browser',userBrowser);
      document.body.setAttribute('browserversion',userDesktopBrowserVersion);
      return
   } else if (navigator.userAgent.search("Opera") >= 0||window.opr!==undefined) { //Check if browser is Opera or not
      verOffset=navigator.userAgent.indexOf("OPR")
      ver= navigator.userAgent.substring(verOffset+4);
      trimmer = ver.indexOf(' ')
      userDesktopBrowserVersion = ver//.substring(0,trimmer);
      userBrowser = 'opera'
      document.body.setAttribute('browser',userBrowser);
      document.body.setAttribute('browserversion',userDesktopBrowserVersion);
      return
   }
}



/**
* Detects operating system 
*
* @method OSDetection
* @return 
*/
function OSDetection(){
   if(navigator.oscpu === undefined){
      if(navigator.appVersion.indexOf('Windows')>-1){
         if(navigator.appVersion.indexOf('Windows NT 6.2')>-1){
            userOS = 'Windows 8'
         }
         if(navigator.appVersion.indexOf('Windows NT 6.1')>-1){
            userOS = 'Windows 7'
         }
         if(navigator.appVersion.indexOf('Windows NT 5.1')>-1||navigator.appVersion.indexOf('Windows XP')>-1){
            userOS = 'Windows XP'
         }
         if(navigator.appVersion.indexOf('Windows NT 6.0')>-1){
            userOS = 'Windows Vista'
         }
      }
      if(navigator.appVersion.indexOf('Mac')>-1){
         userOS = "Mac"
      }
      if(navigator.appVersion.indexOf('X11')>-1){
         userOS = "UNIX"
      }
      if(navigator.appVersion.indexOf('Linux')>-1){
         userOS = "Linux"
      }            
   } else {
      if(navigator.oscpu.indexOf('Windows NT 6.2')>-1){
         userOS = 'Windows 8'
      }
      if(navigator.oscpu.indexOf('Windows NT 6.1')>-1){
         userOS = 'Windows 7'
      }
      if(navigator.oscpu.indexOf('Windows NT 5.1')>-1||navigator.oscpu.indexOf('Windows XP')>-1){
         userOS = 'Windows XP'
      }
      if(navigator.oscpu.indexOf('Windows NT 6.0')>-1){
         userOS = 'Windows Vista'
      }
      if(navigator.oscpu.indexOf('Mac')>-1){
         userOS = "Mac"
      }
   }
   document.body.setAttribute('os',userOS)
}
