"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MirrorInput = function MirrorInput(origin) {
  var format = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function (x) {
    return {
      text: x
    };
  };

  _classCallCheck(this, MirrorInput);

  if (!origin) {
    throw new Error("MirrorInput requires an element argument.");
  }

  if (!origin.getAttribute) {
    return;
  }

  this.origin = origin;
  this.parent = null;
  this.copy = null;
  this.spaces = null;
  this.editMode = false;
  this.onUpdate = format;
  this.onOver = false;
  this.actualValue = null;
  this.create();
};

MirrorInput.prototype.update = function () {
  if (this.origin.value) {
    this.actualValue = this.origin.value;
    var format = this.onUpdate(this.origin.value);
    var newValue = format.text;
    if (format.spaces) this.spaces = format.spaces;
    this.copy.innerHTML = newValue;
  } else {
    this.copy.innerHTML = "";
  }
};

MirrorInput.prototype.swap = function () {
  var temp = this.copy.innerHTML;
  this.copy.innerHTML = this.origin.value;
  this.origin.value = temp;
};

MirrorInput.prototype.create = function () {
  var _this = this;

  function setCaretPosition(elem, caretPos) {
    var range;

    if (elem.createTextRange) {
      range = elem.createTextRange();
      range.move("character", caretPos);
      range.select();
    } else {
      elem.focus();

      if (elem.selectionStart !== undefined) {
        elem.setSelectionRange(caretPos, caretPos);
      }
    }
  }

  var mirrorInput = this;
  var editMode = this.editMode;
  var origin = this.origin;
  this.copy = document.createElement("div");
  var copy = this.copy;
  copy.hidden = true;
  copy.id = copy.id + "Copy";
  copy.classList.add("mirrorinput-clone");

  origin.onblur = function () {
    if (editMode) {
      editMode = false;
      mirrorInput.update();
      mirrorInput.swap();
    }
  };

  origin.onkeyup = function () {
    return mirrorInput.update();
  };

  origin.onchange = function () {
    return mirrorInput.update();
  };

  origin.classList.add("mirrorinput");
  this.parent = document.createElement("div");
  this.parent.classList.add("mirrorinput-parent");
  origin.parentNode.insertBefore(this.parent, origin);
  this.parent.appendChild(origin);
  this.parent.appendChild(copy);
  this.update();
  var onEdit;

  if (["number", "email", "date"].includes(origin.type)) {
    // eslint-disable-next-line no-use-before-define
    console.warn("(MirrorInput) Warning caret position will not update for type number, email and date");

    onEdit = function onEdit() {
      if (!editMode) {
        editMode = true;
        mirrorInput.swap();
        origin.focus();
      }
    };
  } else {
    onEdit = function onEdit(e) {
      if (!editMode) {
        editMode = true;
        var caretPos = e.target.selectionStart;
        mirrorInput.swap();

        if (mirrorInput.spaces) {
          setCaretPosition(origin, (mirrorInput.spaces.slice(0, caretPos).match(/1/g) || []).length);
        } else {
          setCaretPosition(origin, caretPos);
        }
      }
    };
  }

  origin.onmouseup = onEdit;

  origin.onmouseover = function () {
    _this.onOver = true;
  };

  origin.onmouseout = function () {
    _this.onOver = false;
  };

  origin.onfocus = function () {
    if (!editMode && !_this.onOver) {
      editMode = true;
      mirrorInput.swap();
    }
  };

  mirrorInput.swap();
};