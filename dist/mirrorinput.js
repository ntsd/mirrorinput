"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MirrorInput = function MirrorInput(origin) {
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
};

MirrorInput.prototype.originalFormat = function (text) {
  return {
    text: text
  };
};

MirrorInput.prototype.onUpdate = MirrorInput.originalFormat;

MirrorInput.prototype.update = function () {
  if (this.copy) {
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
  this.parent = document.createElement("div");
  this.parent.classList.add("mirrorinput-parent");
  this.copy = origin.cloneNode(true);
  this.copy.id = this.copy.id + "Copy";
  this.copy.type = "text";
  this.copy.classList.remove("mirrorinput");
  this.copy.classList.add("mirrorinput-clone");
  this.copy.style["margin-top"] = "-" + origin.offsetHeight + "px";
  this.copy.addEventListener("mouseup", function (e) {
    var caretPos = e.target.selectionStart;

    if (_this.spaces) {
      setCaretPosition(origin, (_this.spaces.slice(0, caretPos).match(/1/g) || []).length);
    } else {
      setCaretPosition(origin, caretPos);
    }
  });
  origin.parentNode.insertBefore(this.parent, origin);
  this.parent.appendChild(origin);
  this.parent.appendChild(this.copy);
  this.update();
};

function initMirrorInputElements() {
  var mirrorElements = document.getElementsByClassName("mirrorinput");
  Array.from(mirrorElements).forEach(function (element) {
    var mirrorInput = new MirrorInput(element);
    var onMirrorText = element.getAttribute("mirror-format");
    if (onMirrorText !== null) mirrorInput.onUpdate = window[onMirrorText];
    mirrorInput.create();

    element.onkeyup = function () {
      mirrorInput.update();
    };
  });
}

function ready(callback) {
  if (document.readyState != "loading") callback();else if (document.addEventListener) document.addEventListener("DOMContentLoaded", callback);else document.attachEvent("onreadystatechange", function () {
    if (document.readyState == "complete") callback();
  });
}

ready(function () {
  initMirrorInputElements();
});