/************************************
 *      Kowabunga Drag & Drop       *
 * **********************************
 * Version: 1.0.0
 * 
 * Description:
 * This is an implementation of 'Drag & Drop' functionality. It allows you to define a parent 'drag area' FlexContainer where dragging is allowed,
 * several 'draggable' FlexContainers which may be dragged around, and several children 'drop area' FlexContainers where draggables may be dropped.
 * Here's a sample structure.
 *
 * - FlexContainer dragArea
 * 		- FlexContainer dropArea1
 *			- FlexContainer draggable1
 *			- FlexContainer draggable2
 *		- FlexContainer dropArea2
 *			- FlexContainer draggable3
 * 
 *  How to use:
 * 		var dnd = new kony.kowabunga.DragNDrop(); //Instantiate
 *		dnd.makeDragArea(flex1) //You must create one of these and only one.
 *		dnd.makeDropArea(flex1); //You must add one or more of these.
 *		dnd.makeDraggable(flex1, allowH, allowV, onDragFnCallback, onDropFnCallback);
 * 
 * Input Parameters:
 * 		
 *		kony.ui.FlexContainer flex1: The FlexContainer to be made into a drag area, drop area or draggable.
 *		Boolean allowH: Whether the draggable can be dragged horizontally or not.
 *		Boolean allowV: Whether the draggable can be dragged vertically or not.
 *		Function onDragFnCallback: The callback to be fired whenever the draggable is dragged. Fires asynchronously. 
 *		Function onDropFnCallback: The callback to be fired whenever the draggable is dropped inside a drop area. Fires synchronously.
 *
 * Behavior:
 * If there's a single drop area, draggables may only be dragged inside it.
 * If there are multiple drop areas, draggables be dragged around the entire drag area.
 * Draggables may only be dropped inside one of the drop areas.
 *
 * 
 * Implementation Details:
 * Using this component will shut down scrolling on your forms by switching <form>.enableScrolling = false.
 * Tested on Android and iOS.
 *
 * Author: Miguelangel Fernandez, miguelangel.fernandez@kony.com, miguelangelxfm@gmail.com
 * 
 * P.S.: I'm particularly fond of this bit of code, so if you run into any problems please do get in touch and I'll do my best to support you.
 */

(function(definition){
	if(!kony.kowabunga){
		kony.kowabunga = {};
	}
	if(!kony.kowabunga.DragNDrop){
		kony.kowabunga.DragNDrop = definition();
	}
})(function(){
  
	function DragNDrop(){
		//this.enableScrolling;
		this.dragging = false;
		//this.dragArea;
		this.dropAreas = [];
		this.singleDrop = true;
		this.lastDragPositions = {};
		this.lastDropPositions = {};
		this.allowedDirections = {};
		this.onDragCallbacks = {};
		this.onDropCallbacks = {};
	}

	DragNDrop.prototype._isXInDropArea = function(dropArea, draggable, x1){
		var minX = dropArea.frame.x;
		var maxX = dropArea.frame.x + dropArea.frame.width;
		var halfW = draggable.frame.width/2;
		return minX <= (x1-halfW) && (x1+halfW) <= maxX;
	};

	DragNDrop.prototype._isYInDropArea = function(dropArea, draggable, y1){
		var minY = dropArea.frame.y;
		var maxY = dropArea.frame.y  + dropArea.frame.height;
		var halfH = draggable.frame.height/2;
		return minY <= (y1-halfH) && (y1+halfH) <= maxY;
	};

  	DragNDrop.prototype._isPositionInDropArea = function(dropArea, draggable, x1, y1){
		if(this._isXInDropArea(dropArea, draggable, x1) && this._isYInDropArea(dropArea, draggable, y1)){
			return dropArea;
		}
		else{
			return false;
		}
	};

	DragNDrop.prototype._getCurrentDropArea = function(draggable, x1, y1){
		
		var currentDropArea;
		var dropAreasCount = this.dropAreas.length;
		
		for(var k = 0; k < dropAreasCount && !currentDropArea; k++){
			currentDropArea = this._isPositionInDropArea(this.dropAreas[k], draggable, x1, y1);
		}
		return currentDropArea;
	};
  
	DragNDrop.prototype._setPosition = function(draggable, position){
		if(position.x) draggable.left = position.x + "dp";
		if(position.y) draggable.top = position.y + "dp";
		if(position.x || position.y) draggable.forceLayout();
	};
	
	DragNDrop.prototype._calcTargetPosition = function(dragging, x1, y1){
		
		var allowH = this.allowedDirections[dragging.id].h;
		var allowV = this.allowedDirections[dragging.id].v;
		var x2, y2;

		//If there's only one drop area, (x,y) must be inside it. If there's more, (x,y) can be anywhere -i.e. to allow dragging between drop areas.
		var xIsValid = this.singleDrop?this._isXInDropArea(this.dropAreas[0], dragging, x1):true;
		var yIsValid = this.singleDrop?this._isYInDropArea(this.dropAreas[0], dragging, y1):true;
		
		x2 = (allowH && xIsValid)?(x1 - dragging.frame.width/2):this.lastDragPositions[dragging.id].x;
		y2 = (allowV && yIsValid)?(y1 - dragging.frame.height/2):this.lastDragPositions[dragging.id].y;
			
		return {
			x: x2,
			y: y2
		};
	};
  
	DragNDrop.prototype._startDrag = function(draggable, x1, y1){
		this.enableScrolling = kony.application.getCurrentForm().enableScrolling;
		kony.application.getCurrentForm().enableScrolling = false;

		//remember which draggable is being dragged.
		this.dragging = draggable;
		
		//make the draggable a direct child of the dragArea in the widget hierarchy.
		var parent = this.dragging.parent;
		if(parent.id !== this.dragArea.id){
			kony.print("draggable "+this.dragging.id+" is not yet a child of drag area " + this.dragArea.id);
			parent.remove(this.dragging);
			this._setPosition(this.dragging, {
				x: this.dragging.frame.x + parent.frame.x,
				y: this.dragging.frame.y + parent.frame.y
			});
			this.dragArea.add(this.dragging);
		}
		
		//If this is the first time the draggable is dragged...
		if(!this.lastDragPositions[this.dragging.id]){
			//If the original location is within a drop area, store it as the first drag position.
			var cx = this.dragging.frame.x + this.dragging.frame.width/2;
			var cy = this.dragging.frame.y + this.dragging.frame.height/2;
			var currentDropArea = this._getCurrentDropArea(this.dragging, cx, cy);
			if(currentDropArea){
				this.lastDragPositions[this.dragging.id] = {
					x: this.dragging.frame.x,
					y: this.dragging.frame.y
				};
			}
			//If the original location is not within any drop area, store the first drop area's upper left corner as the draggable's first drag position. 
			else{ 
				this.lastDragPositions[this.dragging.id] = {
					x: this.dropAreas[0].frame.x,
					y: this.dropAreas[0].frame.y
				};
			}
			//Store the first drag position as the last drop position as well.
			this.lastDropPositions[this.dragging.id] = this.lastDragPositions[this.dragging.id];
		}
	};
	
	DragNDrop.prototype._drag = function(dragArea, x1, y1){
		//'dragging' is either false or the element being dragged
		if(this.dragging){	
			var targetPosition = this._calcTargetPosition(this.dragging, x1, y1);
			var cx = targetPosition.x + this.dragging.frame.width/2;
			var cy = targetPosition.y + this.dragging.frame.height/2;
			//var currentDropArea = this.singleDrop ? this._isPositionInDropArea(this.dropAreas[0], this.dragging, cx, cy) : this._getCurrentDropArea(this.dragging, cx, cy);
			var currentDropArea = this._getCurrentDropArea(this.dragging, cx, cy);
			if(targetPosition && ( !this.singleDrop || currentDropArea )){
				
				this.lastDragPositions[this.dragging.id] = targetPosition;
				this._setPosition(this.dragging, targetPosition);

				var onDragFn = this.onDragCallbacks[this.dragging.id];
				if(typeof onDragFn === "function"){
					try{
						kony.timer.schedule(this.dragging.id + "_onDragFn", function callOnDragFn(){
							onDragFn(this.dragging, currentDropArea);
						}.bind(this), 0.001, false);
					}
					catch(e){
						kony.print(e);
					}
				}
			}
		}
	};
  
	DragNDrop.prototype._drop = function(dragArea, x1, y1){
		
		if(this.dragging){

			var targetPosition = this._calcTargetPosition(this.dragging, x1, y1);
			var cx = targetPosition.x + this.dragging.frame.width/2;
			var cy = targetPosition.y + this.dragging.frame.height/2;
			var currentDropArea = this._getCurrentDropArea(this.dragging, cx, cy);
			if(currentDropArea){
				//If the last drag position is within a drop area, store it as the last valid drop position.
				this.lastDropPositions[this.dragging.id] = this.lastDragPositions[this.dragging.id];
				
				//If the last drag position is within a drop area, fire the onDrop callback for the draggable.
				var onDropFn = this.onDropCallbacks[this.dragging.id];
				if(typeof onDropFn === "function") onDropFn(this.dragging, currentDropArea);
			}
			else{
				//this._setPosition(this.dragging, this.lastDropPositions[this.dragging.id]); //TODO: Add animation to go back to last drop position.
				_animateBack(this.dragging, targetPosition, this.lastDropPositions[this.dragging.id]);
			}
			this.dragging = false;
			//kony.application.getCurrentForm().enableScrolling = thi.enableScrolling; //TODO: Figure out why this breaks it.
		}
	};

	function _animateBack(draggable, iniPosition, endPosition){

		var stepConfig = {timingFunction: kony.anim.EASE_IN_OUT};
	
		var config = {
			duration: 0.5,
			delay: 0,
			iterationCount: 1,
			direction: kony.anim.DIRECTION_NONE,
			fillMode: kony.anim.FILL_MODE_FORWARDS
		};

		var callbacks = {
			animationEnd: function(){}
		};

		var steps = {
			0: 		{left: iniPosition.x + "dp", 	top: iniPosition.y + "dp", stepConfig: stepConfig}, 
			100: 	{left: endPosition.x + "dp", 	top: endPosition.y + "dp", stepConfig: stepConfig} 
		};
		var animation = kony.ui.createAnimation(steps);

		draggable.animate(animation, config, callbacks);
	}
  
	DragNDrop.prototype.makeDragArea = function(dragArea){
	
		dragArea.onTouchMove = function(source, x1, y1){
			//Must parseInt because on Android x1 and y1 will be objects.
			this._drag(source, parseInt(x1), parseInt(y1)); 
		}.bind(this);
		
		dragArea.onTouchEnd = function(source, x1, y1){
			
			if(this.dragging){
				if(  this.allowedDirections[this.dragging.id].allowH && this.allowedDirections[this.dragging.id].allowV  ){
					this._drop(source, parseInt(x1), parseInt(y1));
				}
				else{
					var timerId = "wait4frame_" + source.id;
					try{
						kony.timer.schedule(timerId, function wait4frame(){
							//kony.print("wait4frame dragging:" + this.dragging.id);
							if(this.dragging && this.dragging.frame){
								kony.timer.cancel(timerId);
								this._drop(source, this.dragging.frame.x + this.dragging.frame.width/2, this.dragging.frame.y + this.dragging.frame.height/2);
							}
						}.bind(this), 0.001, true);
					}
					catch(e){
						kony.timer.cancel(timerId);
						kony.print(e);
					}
				}
			}

		}.bind(this);
		
		this.dragArea = dragArea;
	};
  
	DragNDrop.prototype.makeDropArea = function(dropArea){
		
		if(typeof this.dragArea === "undefined"){
			throw "ERROR: Kowabunga DragNDrop: Add at least one drag area before adding drop areas.";
		}
		this.dropAreas.push(dropArea);
		this.singleDrop = this.dropAreas.length === 1;
	};
  
	DragNDrop.prototype.makeDraggable = function(draggable, allowH, allowV, onDragFn, onDropFn){
	  
		if(typeof this.dragArea === "undefined"){
			throw "ERROR: Kowabunga DragNDrop: Add at least one drag area before adding draggables.";
		}
		if(this.dropAreas.length === 0){
			throw "ERROR: Kowabunga DragNDrop: Add at least one drop area before adding draggables.";
		}
		
		draggable.onTouchStart = function(source, x1, y1){
			this._startDrag(source, parseInt(x1), parseInt(y1));
		}.bind(this);
		
		this.allowedDirections[draggable.id] = {
			h: allowH,
			v: allowV
		};
	  
	  	if(typeof onDragFn === "function") this.onDragCallbacks[draggable.id] = onDragFn;
		if(typeof onDropFn === "function") this.onDropCallbacks[draggable.id] = onDropFn;
	};
  
	return DragNDrop;
});