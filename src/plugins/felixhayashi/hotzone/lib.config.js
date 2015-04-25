/*\

title: $:/plugins/felixhayashi/hotzone/config.js
type: application/javascript
module-type: library

@preserve

\*/

(function(){
    
  /*jslint node: true, browser: true */
  /*global $tw: false */
  "use strict";

  /***************************** CODE ******************************/

  exports.config = {
    
    // Essential tiddlywiki classes that we depend on
    classNames: {
      
      // contains all tiddlers and some other stuff
      storyRiver: "tc-story-river",
      
      // wraps a tiddler and contains the title
      tiddlerFrame: "tc-tiddler-frame",
      
      // elements with this class contain the title
      tiddlerTitle: "tc-title"
      
    },
    
    references: {
      
      // User configuration
      userConfig: "$:/config/hotzone/focusOffset",
            
      // This tiddler holds a reference to the currently focussed
      // tiddler. A tiddler is focussed if it was scrolled to
      // reach the top offset.
      focussedTiddlerStore: "$:/temp/focussedTiddler"
      
    },
    
    // Time after a scroll event that has to elapse before we
    // check which tiddler is actually focussed. This is necessary
    // to avoid updates that only result from scroll animations.
    checkbackTime: $tw.utils.getAnimationDuration()
    
  };

})();
