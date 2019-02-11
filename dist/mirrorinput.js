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
  this.copy = "";
  this.spaces = null;
  this.editMode = false;
  this.onUpdate = format;
  this.onOver = false;
  this.actualValue = null;
  this.create();
};

MirrorInput.prototype.update = function () {
  if (this.origin.value) {
    this.origin.setAttribute("actualValue", this.origin.value);
    this.actualValue = this.origin.value;
    var format = this.onUpdate(this.origin.value);
    var newValue = format.text;
    if (format.spaces) this.spaces = format.spaces;
    this.copy = newValue;
  } else {
    this.copy = "";
  }
};

MirrorInput.prototype.swap = function () {
  var temp = this.copy;
  this.copy = this.origin.value;
  this.origin.value = temp;
};

MirrorInput.prototype.setCaretPosition = function (elem, caretPos) {
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
};

MirrorInput.prototype.create = function () {
  var _this = this;

  var mirrorInput = this;
  var editMode = this.editMode;
  var origin = this.origin;

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

  this.update();
  mirrorInput.swap();
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
          mirrorInput.setCaretPosition(origin, (mirrorInput.spaces.slice(0, caretPos).match(/1/g) || []).length);
        } else {
          mirrorInput.setCaretPosition(origin, caretPos);
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
};