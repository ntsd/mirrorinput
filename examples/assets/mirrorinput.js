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
  this.onUpdate = format;
  this.create();
};

MirrorInput.prototype.update = function () {
  if (this.origin.value) {
    var format = this.onUpdate(this.origin.value);
    var newValue = format.text;
    if (format.spaces) this.spaces = format.spaces;
    this.copy.value = newValue;
  }
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

  var origin = this.origin;
  this.copy = origin.cloneNode(true);
  this.copy.id = this.copy.id + "Copy";
  this.copy.classList.add("mirrorinput-clone");
  this.copy.type = "text";
  this.copy.autocomplete = "off";
  var originDisplay = window.getComputedStyle(origin).getPropertyValue("display");
  origin.style.display = "none";
  var mirrorInput = this;

  origin.onblur = function () {
    this.style.display = "none";
    mirrorInput.update();
  };

  if (["number", "email", "date"].includes(origin.type)) {
    // eslint-disable-next-line no-use-before-define
    console.warn("Werning MirrorInput should not use with type number, email, date caret position will not update");

    this.copy.onmouseup = function () {
      origin.style.display = originDisplay;
      origin.focus();
    };
  } else {
    this.copy.onmouseup = function (e) {
      origin.style.display = originDisplay;
      var caretPos = e.target.selectionStart;

      if (_this.spaces) {
        setCaretPosition(origin, (_this.spaces.slice(0, caretPos).match(/1/g) || []).length);
      } else {
        setCaretPosition(origin, caretPos);
      }
    };
  }

  origin.classList.add("mirrorinput");
  this.parent = document.createElement("div");
  this.parent.classList.add("mirrorinput-parent");
  origin.parentNode.insertBefore(this.parent, origin);
  this.parent.appendChild(origin);
  this.parent.appendChild(this.copy);
  this.update();
};