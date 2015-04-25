# TiddlyWiki5 HotZone Plugin

The HotZone plugin gives you Information about the tiddler currently focussed.

Everytime a tiddler's body reaches a defined threshold, the value of `$:/temp/focussedTiddler` is updated with the title of the currently focussed tiddler. The threshold can changed via the plugin-config. Alternatively, it can be defined via `$:/config/hotzone/focusOffset`, where you can set the text to e.g. `100px` (only pixel values are allowed) -- the default is `150px`. You can use this information to trigger actions when the user scrolled to a certain tiddler.

Here are some ideas how you could use this feature:

You could write a small widget that listens to the changes of `$:/temp/focussedTiddler` to 

* Unfold the table of contents or highlight the current topic.
* Change the page title
* Update the current permalink in the address bar
* Log the user behavior
* Highlight the focussed tiddler

TiddlyMap uses the HotZone plugin to update its live view in the sidebar. Now that's cool or not?

## How to install and configure it?

You can use this plugin by importing it (e.g. from the [TiddlyMap demo site](http://bit.ly/tiddlymap)).

You can configure the plugin by opening TiddlyWiki's configuration and selecting HotZone in the plugin section.

