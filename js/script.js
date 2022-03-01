var min = 0;
var sec = 0;
var movesLeft = 30;
var movesTaken = 0;
var dragTowerId = "";
var undoArray = [];
var current;
var redoArray = [];

$(function () {
  $("#moves-left").text(movesLeft);
  makeRingAppearRandomly();
  undoRedo();
  undoRedoThroughKeyboard();
  timerCycle();
  hideMessages();
  drag();
  drop();
});

function timerCycle() {
  sec = sec + 1;
  if (sec == 60) {
    min = min + 1;
    sec = 0;
  }
  $("#timer").text(min + ":" + sec);
  setTimeout("timerCycle()", 1000);
}

function makeRingAppearRandomly() {
  let nums = new Set();
  while (nums.size < 9) {
    nums.add(Math.floor(Math.random() * 9) + 1);
  }
  for (let item of nums) {
    var barId = Math.floor(Math.random() * 3) + 1;
    div = `<div class="draggable ring${item}" id="ring${item}">${item}</div>`;
    var bar = $(`#bar${barId}`).find(".ring-wrapper");
    $(div).prependTo(bar);
  }
}

function drag() {
  $(".draggable").draggable({
    helper: "clone",
    cursor: "grabbing",
    containment: "body",
    cursorAt: { right: 80 },
    start: (event, ui) =>
      isDraggable($(event.target).parent(), event.target)
        ? Boolean((dragTowerId = $(event.target).parent().parent().attr("id")))
        : false,
  });
}

function drop() {
  $(".droppable").droppable({
    drop: function (event, ui) {
      var bar = $(this).parent().find(".ring-wrapper");

      if ($(this).parent().attr("id") != dragTowerId) {
        $(ui.draggable).prependTo(bar);
        updateMoves(true);

        let index = {
          draggingBar: dragTowerId,
          droppingBar: $(this).parent().attr("id"),
        };

        if (current) {
          undoArray.push(current);
        }
        current = index;
        while (redoArray.length > 0) redoArray.pop();
      }

      var isWon = isGameWon($(event.target).parent());
      if (movesLeft == 0 && !isWon) {
        setTimeout("alertAndRefresh($('#out-of-moves-message').text());", 500);
      }
      if (isWon) {
        setTimeout("alertAndRefresh($('#success-message').text())", 500);
      }
    },
  });
}

function isDraggable(ringWrapper, ring) {
  return $(ringWrapper).children()[0].id == ring.id;
}

function isGameWon(bar) {
  return (
    $(bar).find(".ring-wrapper").children().length == 9 && isValidOrder(bar)
  );
}

function isValidOrder(bar) {
  var children = $(bar).find(".ring-wrapper").children();
  for (var i = 8; i > 0; i--) {
    return !(
      $(`#${children[i].id}`).width() < $(`#${children[i - 1].id}`).width()
    );
  }
  return true;
}

function alertAndRefresh(message) {
  confirm(message);
  window.location.reload();
}

function hideMessages() {
  $("#success-message").hide();
  $("#out-of-moves-message").hide();
}

function updateMoves(redo) {
  if (redo) {
    movesLeft--;
    movesTaken++;
  } else if (!redo) {
    movesLeft++;
    movesTaken--;
  }
  $("#moves-taken").text(movesTaken);
  $("#moves-left").text(movesLeft);
}

function undo() {
  var child = $(`#${current.droppingBar}`).find(".ring-wrapper").children()[0];
  var wrapper = $(`#${current.draggingBar}`).find(".ring-wrapper");
  $(child).prependTo(wrapper);
  redoArray.push(current);
  current = undoArray.pop();
  updateMoves(false);
}

function redo() {
  if (redoArray.length != 0) {
    undoArray.push(current);
    current = redoArray.pop();
    var child = $(`#${current.draggingBar}`)
      .find(".ring-wrapper")
      .children()[0];
    var wrapper = $(`#${current.droppingBar}`).find(".ring-wrapper");
    $(child).prependTo(wrapper);
    updateMoves(true);
  }
}

function undoRedo() {
  $("#undo-btn").click(function () {
    undo();
  });

  $("#redo-btn").click(function () {
    redo();
  });
}

function undoRedoThroughKeyboard() {
  $(document).on("keydown", function (event) {
    event.ctrlKey && event.which == 90 && undo();
    event.ctrlKey && event.which == 89 && redo();
  });
}
