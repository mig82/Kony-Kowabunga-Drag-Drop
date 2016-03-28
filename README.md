# Kowabunga Drag & Drop

Version: 1.0.1

Description:
This is an implementation of 'Drag & Drop' functionality for the Kony platform. It allows you to define a parent 'drag area' FlexContainer where dragging is allowed,
several 'draggable' FlexContainers which may be dragged around, and several children 'drop area' FlexContainers where draggables may be dropped.
Here's a sample structure.

	- FlexContainer dragArea
		- FlexContainer dropArea1
			- FlexContainer draggable1
			- FlexContainer draggable2
		- FlexContainer dropArea2
			- FlexContainer draggable3

How to use:

	var dnd = new kony.kowabunga.DragNDrop(); //Instantiate
	dnd.makeDragArea(flex1) //You must create one of these and only one.
	dnd.makeDropArea(flex2); //You must add one or more of these.
	dnd.makeDraggable(flex3, allowH, allowV, onDragFnCallback, onDropFnCallback);

Important Note:
For Drag & Drop to work your drop area an draggable FlexContainers must be placed
by 'top' and 'left'. If you place them by defining 'right', 'bottom', 'center-x' or
'center-y' the drag won't work. Also, the drag area FlexContainer must have a Freeform 
layout type.

Input Parameters:
		
	@kony.ui.FlexContainer flexN: The FlexContainer to be made into a drag area, drop area or draggable.
	@Boolean allowH: Whether the draggable can be dragged horizontally or not.
	@Boolean allowV: Whether the draggable can be dragged vertically or not.
	@Function onDragFnCallback: The callback to be fired whenever the draggable is dragged. Fires asynchronously. 
	@Function onDropFnCallback: The callback to be fired whenever the draggable is dropped inside a drop area. Fires synchronously.

Callbacks:
The onDragFnCallback and onDropFnCallback parameters must be functions taking in the following parameters:

	@kony.ui.FlexContainer draggable: The object being dragged/dropped.
	@kony.ui.FlexContainer dropArea: The dropArea in which the draggable is being dragged/dropped.

	function onDropFnCallback(draggable, dropArea){
		kony.print(draggable.id + " dropped in " + dropArea.id);
	}

*Behavior:
If there's a single drop area, draggables may only be dragged inside it.
If there are multiple drop areas, draggables be dragged around the entire drag area.
Draggables may only be dropped inside one of the drop areas.


Implementation Details:
Using this component will shut down scrolling on your forms by switching <form>.enableScrolling = false.
Tested on Android and iOS.

TO-DO:
1. Allow an error tolerance to the drop, so that the drop doesn't have to be
precisely within a drop area, but maybe close enough. This would make it easier for the user in
case of very small drop areas or whenever the draggables are almost as big as the drop areas.

Author: Miguelangel Fernandez, miguelangel.fernandez@kony.com, miguelangelxfm@gmail.com

P.S.: I'm particularly fond and proud of this bit of code, so if you run into any problems please do get in touch with me and I'll do my best to support you.
