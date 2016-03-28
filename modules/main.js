function bootstrap(){
  	
  	function printDropArea(draggable, dropArea){
      	frm1.msg.text = draggable.id + " dropped in " + dropArea.id;
    }
    
    function printDrag(draggable, dropArea){
      	frm1.msg.text = draggable.id + " dragged to (" + draggable.frame.x +" , "+ draggable.frame.y + ")";
    }
  
  	var dnd1, dnd2;
  
  	frm1.postShow = function(){
      
      	frm1.gotoBtn.onClick = function(){
            frm2.show();
        };
      
    	dnd1 = new kony.kowabunga.DragNDrop();
        dnd1.makeDragArea(frm1.dragArea);

        dnd1.makeDropArea(frm1.dropArea1);
        dnd1.makeDropArea(frm1.dropArea2);
      	dnd1.makeDropArea(frm1.dropArea3);

        dnd1.makeDraggable(frm1.pinkRect, true, false, printDrag, printDropArea);
        dnd1.makeDraggable(frm1.greenCircle, false, true, printDrag, printDropArea);
        dnd1.makeDraggable(frm1.redRect, true, true, printDrag, printDropArea);
    };

  	frm1.onHide = function(){
      	dnd1.destroy();
    }; 
	
  
  	frm2.postShow = function(){
      
      	frm2.gotoBtn.onClick = function(){
            frm1.show();
        };
      
    	dnd2 = new kony.kowabunga.DragNDrop();
        dnd2.makeDragArea(frm2.dragArea);

        dnd2.makeDropArea(frm2.dropArea1);

        dnd2.makeDraggable(frm2.pinkRect, true, false, printDrag, printDropArea);
        dnd2.makeDraggable(frm2.greenCircle, false, true, printDrag, printDropArea);
        dnd2.makeDraggable(frm2.redRect, true, true, printDrag, printDropArea);
    };

	frm2.onHide = function(){
      	dnd2.destroy();
    };
  	
  	frm1.show();
}

kony.timer.schedule("kickoff", function kicker(){
  	if(typeof kony.kowabunga !== "undefined" && typeof kony.kowabunga.DragNDrop !== "undefined"){
      	kony.print("Dependencies loaded");
      	bootstrap();
      	kony.timer.cancel("kickoff");
    }
  	else{
      	kony.print("Waiting for dependencies to load");
    }
}, 0.5, true);