# TiddlyWiki5 HotZone Plugin

The HotZone plugin gives you Information about the tiddler currently in focus.

Everytime a tiddler's body reaches a defined threshold, the value of `$:/temp/focussedTiddler` is updated with the title of the currently focussed tiddler. 

## Inspiration

You could write a small widget that listens to the changes of `$:/temp/focussedTiddler` to 

* Unfold the table of contents or highlight the current topic.
* Change the page title
* Update the permalink in the address bar
* Log the user behavior
* Highlight the focussed tiddler

TiddlyMap uses the HotZone plugin to update its live view in the sidebar. Now that's cool or not?

## How to install and configure it?

You can use this plugin by importing it (e.g. from the [TiddlyMap demo site](http://bit.ly/tiddlymap)).
Configure the plugin by opening TiddlyWiki's configuration and selecting HotZone in the plugin section. 