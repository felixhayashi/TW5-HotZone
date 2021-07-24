/*\

title: $:/plugins/felixhayashi/hotzone/hotzone.js
type: application/javascript
module-type: startup

@preserve

\*/

(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

// Export name and synchronous status
exports.name = "hotzone";
exports.platforms = ["browser"];
exports.after = ["render"];
exports.synchronous = true;

exports.startup = function() {

/***************************** IMPORTS *****************************/
 
var config = require("$:/plugins/felixhayashi/hotzone/config.js").config;

/*************************** VARIABLES *****************************/

var curRef = null;
var storyRiverElement = document.getElementsByClassName(config.classNames.storyRiver)[0];
var userConf = $tw.wiki.getTiddlerData(config.references.userConfig, {});
var focusOffset = (isNaN(parseInt(userConf.focusOffset))
                   ? 150 : parseInt(userConf.focusOffset)); // px

/*************************** FUNCTIONS *****************************/
          
/**
 * Extracts the tiddler title from dom elements holding it.
 * 
 * @param {Element} target - The tiddler frame element.
 * @return {string} The title or undefined
 */
var extractTitleFromFrame = function(target, frameClass, titleClass) {
    
  if(!(target instanceof Element)) return;
  if(!$tw.utils.hasClass(target, config.classNames.tiddlerFrame)) return;

  var el = target.getElementsByClassName(config.classNames.tiddlerTitle)[0];
  if(el) {
    var title = el.innerText || el.textContent;
    return title.trim();
  }

};

/**
 * Set a flag (class) to the active tiddler frame element and also
 * register the change at the focussed-tiddler-store.
 * 
 * @param {string} tRef - The title of the newly focussed tiddler.
 * @param {Element} [target] - If available, the frame that corresponds
 *     to the focussed tiddler.
 */
var registerFocusChange = function(tRef, target) {
  
  // console.log("hotzone:", "changed focus; now at:", tRef);
  
  $tw.wiki.addTiddler(new $tw.Tiddler({
      title: config.references.focussedTiddlerStore,
      text: tRef
    },
    $tw.wiki.getModificationFields()
  ));
  
  if(target) {
    var prevTarget = document.getElementsByClassName("hzone-focus")[0];
    // remove class from previous
    if(prevTarget) {
      $tw.utils.removeClass(prevTarget, "hzone-focus");
    }
    // add class to current
    $tw.utils.addClass(target, "hzone-focus");
  }
  
};

/**
 * Tries to extract the title from the frame that is currently in
 * focus and to register any changes.
 */
var checkForFocusChange = function() {
  
  // console.log("hotzone:", "check for focus change");
  
  var tObj = $tw.wiki.getTiddler("$:/StoryList");
  if(tObj && tObj.fields.list.length) {
    
    var target = null;
    var minDistance = Number.MAX_VALUE;
    var childElements = storyRiverElement.children;
    var tiddlerFrameClass = config.classNames.tiddlerFrame;
    for(var i = childElements.length; i--;) {
      if($tw.utils.hasClass(childElements[i], tiddlerFrameClass)) {
        var frameElRect = childElements[i].getBoundingClientRect();
        var distance = Math.min(
                         Math.abs(focusOffset - frameElRect.top),
                         Math.abs(focusOffset - frameElRect.bottom)
                      );
        if(distance < minDistance) {
          // register frame with closer distance
          target = childElements[i];
          minDistance = distance;
        }
      }
    }
            
    var title = extractTitleFromFrame(target);
    
    // console.log("hotzone:", "Target", title, "distance to threshold", minDistance);
    
    if(title !== curRef && $tw.wiki.getTiddler(title)) { // focus changed
      curRef = title;
      registerFocusChange(curRef, target);
      return;
    }
    
  } else if(curRef) {
    curRef = "";
    registerFocusChange(curRef);
  }
  
  
  
};

/**
 * Return a function wrapping `func` and limiting the frequency of executions of
 * `func`.
 *
 * Calls to the resulting function with a truthy value for `stopOthers`
 * cause any call with falsey `stopOthers` value to be a no-op for `wait` milliseconds,
 * after which the wrapped `func` is called. Any previous delayed executions are cancelled.
 *
 * Calls with falsey `stopOthers` occuring outside such a period are debounced
 * such that `func` will be called `wait` milliseconds after the last call.
 */
var debounce = function(func) {
  var timeout;
  var dontStart = false;
  return function(wait, stopOthers) {
    var context = this;

    if (dontStart && !stopOthers) {
      // do nothing
    } else {
      dontStart = stopOthers

      if (timeout != null) {
        clearTimeout(timeout);
      }

      timeout = setTimeout(function () {
        timeout = null;
        dontStart = false;
        func.apply(context);
      }, wait);
    }
  };
};

var update = debounce(checkForFocusChange);

/**
 * Handler to react to tiddler changes
 */
var handleChangeEvent = function(changedTiddlers) {

  // console.log("hotzone:", "handleChangeEvent", changedTiddlers);

  if(changedTiddlers["$:/HistoryList"]) {
    
    // A navigation-scroll occurs if the current tiddler of the
    // history list changed and this tiddler also exists in the
    // current story list.
    
    if(!$tw.wiki.tiddlerExists("$:/HistoryList")) return;
    
    var curTiddler = $tw.wiki.getTiddler("$:/HistoryList").fields["current-tiddler"];
    var storyList = $tw.wiki.getTiddlerList("$:/StoryList");
    var isInStoryList = storyList.indexOf(curTiddler) >= 0;
    if(!isInStoryList) return;
    
    // navigation-scroll took place; use animation duration as delay
    // add a bit of delay to make sure the scroll handler is not triggered
    // by the scroll listener
    update($tw.utils.getAnimationDuration() + 10, true);
    
  } else if(changedTiddlers["$:/StoryList"]) {
        
    // console.log("hotzone:", "story list change triggers recalculation");
    update($tw.utils.getAnimationDuration() + 10, true);
    
  }
  
};

/**
 * Handler to react to scroll events
 */
var handleScrollEvent = function(event) {
    
  // update with a delay of 300ms to avoid uncessary calculations
  update(300, false);
  
};
  
/**************************** RUNTIME ******************************/

// register listeners
$tw.wiki.addEventListener("change", handleChangeEvent);
window.addEventListener('scroll', handleScrollEvent, false);  

// simulate a scroll after startup
handleScrollEvent();
      
};

})();

