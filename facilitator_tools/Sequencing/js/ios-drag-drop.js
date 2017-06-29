/**
* Contains all of the functionality for drag & drop on mobile devices
*
* @class IOSDragAndDrop
*/ 

(function(doc) {

   log = noop; // noOp, remove this line to enable debugging

   var coordinateSystemForElementFromPoint;

   /**
    * Initializes draggable and event listeners
    *
    * @method main
    * @param {json} config
    * @return {}
    */
   function main(config) {
      config = config || {};

      coordinateSystemForElementFromPoint = navigator.userAgent.match(/OS [1-4](?:_\d+)+ like Mac/) ? 'page' : 'client';

      var div = doc.createElement('div');
      var dragDiv = 'draggable' in div;
      var evts = 'ondragstart' in div && 'ondrop' in div;

      var needsPatch = !(dragDiv || evts) || /iPad|iPhone|iPod|Android/.test(navigator.userAgent);
      log((needsPatch ? '' : 'not ') + 'patching html5 drag drop');

      if (!needsPatch) {
         return;
      }

      if (!config.enableEnterLeave) {
         DragDrop.prototype.synthesizeEnterLeave = noop;
      }

      doc.addEventListener('touchstart', touchstart);
   }

   /**
    * Drag handler
    *
    * @method DragDrop
    * @param {event} event
    * @param {object} el
    * @return 
    */
   function DragDrop(event, el) {

      this.dragData = {};
      this.dragDataTypes = [];
      this.dragImage = null;
      this.dragImageTransform = null;
      this.dragImageWebKitTransform = null;
      this.el = el || event.target;

      log('dragstart');

      this.dispatchDragStart();
      this.createDragImage();

      this.listen();

   }

   DragDrop.prototype = {
      /**
       * Listens for touch events
       *
       * @method listen
       * @return 
       */
      listen: function() {
         var move = onEvt(doc, 'touchmove', this.move, this);
         var end = onEvt(doc, 'touchend', ontouchend, this);
         var cancel = onEvt(doc, 'touchcancel', cleanup, this);

         /**
          * Ends drag and calls cleanup on touch end
          *
          * @method ontouchend
          * @param {event} event
          * @return {}
          */
         function ontouchend(event) {
            this.dragend(event, event.target);
            cleanup.call(this);
         }

         /**
          * Resets vars and handlers
          *
          * @method cleanup
          * @return CallExpression
          */
         function cleanup() {
            log('cleanup');
            this.dragDataTypes = [];
            if (this.dragImage !== null) {
               this.dragImage.parentNode.removeChild(this.dragImage);
               this.dragImage = null;
               this.dragImageTransform = null;
               this.dragImageWebKitTransform = null;
            }
            this.el = this.dragData = null;
            return [move, end, cancel].forEach(function(handler) {
               return handler.off();
            });
         }
      },

      /**
       * Moves the drag image based on touch state
       *
       * @method move
       * @param {event} event
       * @return {}
       */
      move: function(event) {
         var pageXs = [], pageYs = [];
         [].forEach.call(event.changedTouches, function(touch) {
            pageXs.push(touch.pageX);
            pageYs.push(touch.pageY);
         });

         var x = average(pageXs) - (parseInt(this.dragImage.offsetWidth, 10) / 2);
         var y = average(pageYs) - (parseInt(this.dragImage.offsetHeight, 10) / 2);
         this.translateDragImage(x, y);

         this.synthesizeEnterLeave(event);
      },

      /**
       * Translates and transforms the drag image.
       * We use translate instead of top/left because of sub-pixel rendering and for the hope of better performance
       * http://www.paulirish.com/2012/why-moving-elements-with-translate-is-better-than-posabs-topleft/
       *
       * @method translateDragImage
       * @param {int} x
       * @param {int} y
       * @return {}
       */
      translateDragImage: function(x, y) {
         var translate = ' translate(' + x + 'px,' + y + 'px)';

         if (this.dragImageWebKitTransform !== null) {
            this.dragImage.style['-webkit-transform'] = this.dragImageWebKitTransform + translate;
         }
         if (this.dragImageTransform !== null) {
            this.dragImage.style.transform = this.dragImageTransform + translate;
         }
      },

      /**
       * Trigger enter, leave and over events based on touch state
       *
       * @method synthesizeEnterLeave
       * @param {event} event
       * @return {}
       */
      synthesizeEnterLeave: function(event) {
         var target = elementFromTouchEvent(this.el,event);
         if (target != this.lastEnter) {
            if (this.lastEnter) {
               this.dispatchLeave(event);
            }
            this.lastEnter = target;
            if (this.lastEnter) {
               this.dispatchEnter(event);
            }
         }
         if (this.lastEnter) {
            this.dispatchOver(event);
         }
      },

      /**
       * Trigger drop and drag-end based on touch state.
       * We'll dispatch drop if there's a target, then dragEnd.
       * Drop comes first http://www.whatwg.org/specs/web-apps/current-work/multipage/dnd.html#drag-and-drop-processing-model
       *
       * @method dragend
       * @param {} event
       * @return {}
       */
      dragend: function(event) {

         log('dragend');

         if (this.lastEnter) {
            this.dispatchLeave(event);
         }

         var target = elementFromTouchEvent(this.el,event);
         if (target) {
            log('found drop target ' + target.tagName);
            this.dispatchDrop(target, event);
         } else {
            log('no drop target');
         }

         var dragendEvt = doc.createEvent('Event');
         dragendEvt.initEvent('dragend', true, true);
         this.el.dispatchEvent(dragendEvt);
      },

      /**
       * Dispatches a drop event triggered by dragend
       *
       * @method dispatchDrop
       * @param {object} target
       * @param {event} event
       * @return {}
       */
      dispatchDrop: function(target, event) {
         var dropEvt = doc.createEvent('Event');
         dropEvt.initEvent('drop', true, true);

         var touch = event.changedTouches[0];
         var x = touch[coordinateSystemForElementFromPoint + 'X'];
         var y = touch[coordinateSystemForElementFromPoint + 'Y'];
         dropEvt.offsetX = x - target.x;
         dropEvt.offsetY = y - target.y;

         dropEvt.dataTransfer = {
            types: this.dragDataTypes,
            getData: function(type) {
               return this.dragData[type];
            }.bind(this)
         };
         dropEvt.preventDefault = function() {
            // https://www.w3.org/Bugs/Public/show_bug.cgi?id=14638 - if we don't cancel it, we'll snap back
         }.bind(this);

         once(doc, 'drop', function() {
            log('drop event not canceled');
         },this);

         target.dispatchEvent(dropEvt);
      },

      /**
       * Dispatches an enter event triggered by synthesizeEnterLeave
       *
       * @method dispatchEnter
       * @param {event} event
       * @return {}
       */
      dispatchEnter: function(event) {

         var enterEvt = doc.createEvent('Event');
         enterEvt.initEvent('dragenter', true, true);
         enterEvt.dataTransfer = {
            types: this.dragDataTypes,
            getData: function(type) {
               return this.dragData[type];
            }.bind(this)
         };

         var touch = event.changedTouches[0];
         enterEvt.pageX = touch.pageX;
         enterEvt.pageY = touch.pageY;

         this.lastEnter.dispatchEvent(enterEvt);
      },

      /**
       * Dispatches an over event triggered by synthesizeEnterLeave
       *
       * @method dispatchOver
       * @param {event} event
       * @return {}
       */
      dispatchOver: function(event) {

         var overEvt = doc.createEvent('Event');
         overEvt.initEvent('dragover', true, true);
         overEvt.dataTransfer = {
            types: this.dragDataTypes,
            getData: function(type) {
               return this.dragData[type];
            }.bind(this)
         };

         var touch = event.changedTouches[0];
         overEvt.pageX = touch.pageX;
         overEvt.pageY = touch.pageY;

         this.lastEnter.dispatchEvent(overEvt);
      },

      /**
       * Dispatches a leave event triggered by both dragend & synthesizeEnterLeave
       *
       * @method dispatchLeave
       * @param {event} event
       * @return {}
       */
      dispatchLeave: function(event) {

         var leaveEvt = doc.createEvent('Event');
         leaveEvt.initEvent('dragleave', true, true);
         leaveEvt.dataTransfer = {
            types: this.dragDataTypes,
            getData: function(type) {
               return this.dragData[type];
            }.bind(this)
         };

         var touch = event.changedTouches[0];
         leaveEvt.pageX = touch.pageX;
         leaveEvt.pageY = touch.pageY;

         this.lastEnter.dispatchEvent(leaveEvt);
         this.lastEnter = null;
      },

      /**
       * Dispatches a drag start event triggered by DragDrop
       *
       * @method dispatchDragStart
       * @return {}
       */
      dispatchDragStart: function() {
         var evt = doc.createEvent('Event');
         evt.initEvent('dragstart', true, true);
         evt.dataTransfer = {
            setData: function(type, val) {
               this.dragData[type] = val;
               if (this.dragDataTypes.indexOf(type) == -1) {
                  this.dragDataTypes[this.dragDataTypes.length] = type;
               }
               return val;
            }.bind(this),
            dropEffect: 'move'
         };
         this.el.dispatchEvent(evt);
      },

      /**
       * Creates a drag image triggered by DragDrop
       *
       * @method createDragImage
       * @return {} Appends the image to the document body
       */
      createDragImage: function() {
         this.dragImage = this.el.cloneNode(true);

         duplicateStyle(this.el, this.dragImage);

         this.dragImage.style.opacity = '0.5';
         this.dragImage.style.position = 'absolute';
         this.dragImage.style.left = '0px';
         this.dragImage.style.top = '0px';
         this.dragImage.style.zIndex = '999999';

         var transform = this.dragImage.style.transform;
         if (typeof transform !== 'undefined') {
            this.dragImageTransform = '';
            if (transform != 'none') {
               this.dragImageTransform = transform.replace(/translate\(\D*\d+[^,]*,\D*\d+[^,]*\)\s*/g, '');
            }
         }

         var webkitTransform = this.dragImage.style['-webkit-transform'];
         if (typeof webkitTransform !== 'undefined') {
            this.dragImageWebKitTransform = '';
            if (webkitTransform != 'none') {
               this.dragImageWebKitTransform = webkitTransform.replace(/translate\(\D*\d+[^,]*,\D*\d+[^,]*\)\s*/g, '');
            }
         }

         this.translateDragImage(-9999, -9999);

         doc.body.appendChild(this.dragImage);
      }
   };

    /**
    * Touch start event listener
    *
    * @method touchstart
    * @param {event} evt
    * @return {}
    */
   function touchstart(evt) {
      var el = evt.target;
      do {
         if (el.draggable === true) {
            // If draggable isn't explicitly set for anchors, then simulate a click event.
            // Otherwise plain old vanilla links will stop working.
            // https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Touch_events#Handling_clicks
            if (!el.hasAttribute('draggable') && el.tagName.toLowerCase() == 'a') {
               var clickEvt = document.createEvent('MouseEvents');
               clickEvt.initMouseEvent('click', true, true, el.ownerDocument.defaultView, 1,
                  evt.screenX, evt.screenY, evt.clientX, evt.clientY,
                  evt.ctrlKey, evt.altKey, evt.shiftKey, evt.metaKey, 0, null);
               el.dispatchEvent(clickEvt);
               log('Simulating click to anchor');
            }
            evt.preventDefault();
            new DragDrop(evt,el);
         }
      } while ((el = el.parentNode) && el !== doc.body);
   }

   /**
    * Element under the touch event DOM helper
    *
    * @method elementFromTouchEvent
    * @param {object} el
    * @param {event} event
    * @return {object} target
    */
   function elementFromTouchEvent(el, event) {
      var touch = event.changedTouches[0];
      var target = doc.elementFromPoint(
         touch[coordinateSystemForElementFromPoint + 'X'],
         touch[coordinateSystemForElementFromPoint + 'Y']
      );
      return target;
   }

   /**
    * Event handler
    *
    * @method onEvt
    * @param {object} el
    * @param {string} event
    * @param {object} handler
    * @param {object} context
    * @return ObjectExpression
    */
   function onEvt(el, event, handler, context) {
      if (context) {
         handler = handler.bind(context);
      }
      el.addEventListener(event, handler);
      return {
         /**
          * Removes element event listener
          *
          * @method off
          * @return CallExpression
          */
         off: function() {
            return el.removeEventListener(event, handler);
         }
      };
   }

   /**
    * Event handler
    *
    * @method once
    * @param {} el
    * @param {} event
    * @param {} handler
    * @param {} context
    * @return CallExpression
    */
   function once(el, event, handler, context) {
      if (context) {
         handler = handler.bind(context);
      }
      /**
       * Removes element event listener
       * @method listener
       * @param {event} evt
       * @return CallExpression
       */
      function listener(evt) {
         handler(evt);
         return el.removeEventListener(event,listener);
      }
      return el.addEventListener(event,listener);
   }

   /**
    * Clones the properties of the source node to the destination node. duplicateStyle expects dstNode to be a clone of srcNode
    *
    * @method duplicateStyle
    * @param {object} srcNode
    * @param {object} dstNode
    * @return {}
    */
   function duplicateStyle(srcNode, dstNode) {
      // Is this node an element?
      if (srcNode.nodeType == 1) {
         // Remove any potential conflict attributes
         dstNode.removeAttribute('id');
         dstNode.removeAttribute('class');
         dstNode.removeAttribute('style');
         dstNode.removeAttribute('draggable');

         // Clone the style
         var cs = window.getComputedStyle(srcNode);
         for (var i = 0; i < cs.length; i++) {
            var csName = cs[i];
            dstNode.style.setProperty(csName, cs.getPropertyValue(csName), cs.getPropertyPriority(csName));
         }

         // Pointer events as none makes the drag image transparent to document.elementFromPoint()
         dstNode.style.pointerEvents = 'none';
      }

      // Do the same for the children
      if (srcNode.hasChildNodes()) {
         for (var j = 0; j < srcNode.childNodes.length; j++) {
            duplicateStyle(srcNode.childNodes[j], dstNode.childNodes[j]);
         }
      }
   }

   /**
    * General helper: log message
    *
    * @method log
    * @param {string} msg
    * @return {} console logs output
    */
   function log(msg) {
      console.log(msg);
   }

   /**
    * General helper: Average value of an array integers
    *
    * @method average
    * @param {} arr
    * @return BinaryExpression
    */
   function average(arr) {
      if (arr.length === 0) {
         return 0;
      }
      return arr.reduce((function(s, v) {
         return v + s;
      }), 0) / arr.length;
   }

   /**
    * An empty function. Called when you want nothing to happen.
    *
    * @method noop
    * @return {} 
    */
   function noop() {}

   main(window.iosDragDropShim);

})(document);
