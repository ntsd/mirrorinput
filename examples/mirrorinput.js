"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var MirrorInput =
/*#__PURE__*/
function () {
  function MirrorInput(origin) {
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
  }

  _createClass(MirrorInput, null, [{
    key: "setCaretPosition",
    value: function setCaretPosition(elem, caretPos) {
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
  }]);

  return MirrorInput;
}();

MirrorInput.prototype.update = function () {
  this.origin.setAttribute("actualValue", this.origin.value);
  this.actualValue = this.origin.value;

  if (this.origin.value) {
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

MirrorInput.prototype.create = function () {
  var mirrorInput = this;
  var editMode = this.editMode;
  var origin = this.origin;
  origin.addEventListener("blur", function () {
    if (editMode) {
      editMode = false;
      mirrorInput.update();
      mirrorInput.swap();
    }
  });

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
          MirrorInput.setCaretPosition(origin, (mirrorInput.spaces.slice(0, caretPos).match(/1/g) || []).length);
        } else {
          MirrorInput.setCaretPosition(origin, caretPos);
        }
      }
    };
  }

  origin.onmouseup = function () {
    if (!editMode) {
      onEdit();
    }
  };

  origin.onfocus = function () {
    if (!editMode) {
      editMode = true;
      mirrorInput.swap();
    }
  };
};