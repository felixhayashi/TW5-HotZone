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
exports.after = ["story"];
exports.synchronous = true;

exports.startup = function() {

/***************************** IMPORTS *****************************/
 
var config = require("$:/plugins/felixhayashi/hotzone/config.js").config;

/*************************** VARIABLES *****************************/

var curRef = null;
var isTimeoutActive = false;
var storyRiverElement = document.getElementsByClassName(config.classNames.storyRiver)[0];
var frames = storyRiverElement.getElementsByClassName(config.classNames.tiddlerFrame);
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

// Return a function wrapping `func` and limiting the frequency of executions of
// `func`.
//
// Calls to the resulting function with a truthy value for `stopOthers`
// cause any call with falsey `stopOthers` value to be a no-op for `wait` milliseconds,
// after which the wrapped `func` is called. Any previous delayed executions are cancelled.
//
// Calls with falsey `stopOthers` occuring outside such a period are debounced
// such that `func` will be called `wait` milliseconds after the last call.
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

/**
 * Set a flag (class) to the active tiddler frame element and also
 * register the change at the focussed-tiddler-store.
 * 
 * @param {string} tRef - The title of the newly focussed tiddler.
 * @param {Element} [target] - If available, the frame that corresponds
 *     to the focussed tiddler.
 */
var registerFocusChange = function(tRef, target) {
  
  //~ console.log("hotzone:", "changed focus; now at:", tRef);
  
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
  
  //~ console.log("hotzone:", "check for focus change");
  

  if(frames.length) {
     
    // default offset
    var offsetLeft = 42; 
    
    // try to detect the real offset in use; go from top to bottom
    for(var i = 0; i < frames.length; i++) {
      if(window.getComputedStyle(frames[i])["display"] === "block") { // zoomin hides frames
        offsetLeft = frames[i].getBoundingClientRect().left;
        //~ console.log("hotzone:", "klalal", offsetLeft);
        break;
      }
    }
    
    // + 1px as sometimes scroll is not correctly on point
    // TODO: this does not work if modal is shown!
    var target = document.elementFromPoint(offsetLeft + 1, focusOffset);
    
    //~ console.log("hotzone:", "target at offset (", offsetLeft, "; ", focusOffset, "):", target);
    
    var title = extractTitleFromFrame(target);
    
    //~ console.log("hotzone:", "hover target title:", title);
    
    if(title !== curRef && $tw.wiki.getTiddler(title)) { // focus changed
      curRef = title;
      registerFocusChange(curRef, target);
    }
    
  } else if(curRef) {
    curRef = "";
    registerFocusChange(curRef);
  }
  
  isTimeoutActive = false;
  
};

var debouncedCheckForFocusChange = debounce(checkForFocusChange);

/**
 * Handler to react to tiddler changes
 */
var handleChangeEvent = function(changedTiddlers) {

  //~ console.log("hotzone:", "handleChangeEvent", changedTiddlers);

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
    debouncedCheckForFocusChange($tw.utils.getAnimationDuration() + 5, true);
    
  } else if(changedTiddlers["$:/StoryList"]) {
    
    //~ console.log("hotzone:", "story list change triggers recalculation");
    
    curRef = null;
    debouncedCheckForFocusChange($tw.utils.getAnimationDuration() + 5, true);
  }
  
};

/**
 * Handler to react to scroll events
 */
var handleScrollEvent = function(event) {
    
  // update with a delay of 250ms to avoid uncessary calculations
  debouncedCheckForFocusChange(300, false);
  
};

/**************************** RUNTIME ******************************/

// register listeners
$tw.wiki.addEventListener("change", handleChangeEvent);
window.addEventListener('scroll', handleScrollEvent, false);  

// simulate a scroll after startup
handleScrollEvent();
      
};

})();
