function bootstrap() {
    function printDropArea(draggable, dropArea) {
        frm1.msg.text = draggable.id + " dropped in " + dropArea.id;
    }

    function printDrag(draggable, dropArea) {
        frm1.msg.text = draggable.id + " dragged to (" + draggable.frame.x + " , " + draggable.frame.y + ")";
    }
    var dnd = new kony.kowabunga.DragNDrop();
    dnd.makeDragArea(frm1.dragArea);
    dnd.makeDropArea(frm1.dropArea1);
    dnd.makeDropArea(frm1.dropArea2);
    dnd.makeDraggable(frm1.pinkRect, true, false, printDrag, printDropArea);
    dnd.makeDraggable(frm1.greenCircle, false, true, printDrag, printDropArea);
    dnd.makeDraggable(frm1.redSquare, true, true, printDrag, printDropArea);
}
kony.timer.schedule("kickoff", function kicker() {
    if (typeof kony.kowabunga !== "undefined" && typeof kony.kowabunga.DragNDrop !== "undefined") {
        kony.print("Dependencies loaded");
        bootstrap();
        kony.timer.cancel("kickoff");
    } else {
        kony.print("Waiting for dependencies to load");
    }
}, 0.5, true);