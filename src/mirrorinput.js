class MirrorInput {
  constructor(origin) {
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
  }
}

MirrorInput.prototype.originalFormat = function (text) {
  return {text: text};
};

MirrorInput.prototype.onUpdate = MirrorInput.originalFormat;

MirrorInput.prototype.update = function () {
  if (this.copy) {
    const format = this.onUpdate(this.origin.value);
    const newValue = format.text;

    if (format.spaces) this.spaces = format.spaces;

    this.copy.value = newValue;
  }
};

MirrorInput.prototype.create = function () {
  function setCaretPosition(elem, caretPos) {
    let range;
  
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
  
  let origin = this.origin;

  this.parent = document.createElement("div");
  this.parent.classList.add("mirrorinput-parent");

  this.copy = origin.cloneNode(true);
  this.copy.id = this.copy.id + "Copy";
  this.copy.type = "text";
  this.copy.classList.remove("mirrorinput");
  this.copy.classList.add("mirrorinput-clone");

  this.copy.autocomplete = "off";

  this.copy.style["margin-top"] = "-" + origin.offsetHeight + "px";

  this.copy.addEventListener("mouseup", e => {
    const caretPos = e.target.selectionStart;
    if (this.spaces) {
      setCaretPosition(origin, (this.spaces.slice(0, caretPos).match(/1/g) || []).length);
    }
    else {
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
    
    const onMirrorText = element.getAttribute("mirror-format");
    
    if (onMirrorText !== null) mirrorInput.onUpdate = window[onMirrorText];

    mirrorInput.create();

    element.onkeyup = function () {
      mirrorInput.update();
    };
  });
}

function ready(callback) {
  if (document.readyState != "loading") callback();
  else if (document.addEventListener) document.addEventListener("DOMContentLoaded", callback);
  else document.attachEvent("onreadystatechange", function() {
      if (document.readyState == "complete") callback();
  });
}

ready(function() {
  initMirrorInputElements();
});
