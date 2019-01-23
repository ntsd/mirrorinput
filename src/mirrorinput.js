class MirrorInput {
  constructor(origin, format = (x) => {return {text: x};}) {
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
  }
}

MirrorInput.prototype.update = function () {
  if (this.origin.value) {
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

  this.copy = origin.cloneNode(true);
  this.copy.id = this.copy.id + "Copy";
  this.copy.classList.add("mirrorinput-clone");
  this.copy.type = "text";
  this.copy.autocomplete = "off";

  origin.style.display = "none";
  origin.onblur = function() {
    this.style.display = "none";
  };

  if (["number", "email", "date"].includes(origin.type)) {
    // eslint-disable-next-line no-use-before-define
    console.warn("Werning MirrorInput should not use with type number, email, date caret position will not update");
    this.copy.addEventListener("mouseup", () => {
      origin.style.display = "inherit";
      origin.focus();
    });
  }
  else{
    this.copy.addEventListener("mouseup", e => {
      origin.style.display = "inherit";
      const caretPos = e.target.selectionStart;
      if (this.spaces) {
        setCaretPosition(origin, (this.spaces.slice(0, caretPos).match(/1/g) || []).length);
      }
      else {
        setCaretPosition(origin, caretPos);
      }
    });
  }
  
  origin.classList.add("mirrorinput");

  this.parent = document.createElement("div");
  this.parent.classList.add("mirrorinput-parent");

  origin.parentNode.insertBefore(this.parent, origin);
  this.parent.appendChild(origin);
  this.parent.appendChild(this.copy);
  
  this.update();

  const mirrorInput = this;

  origin.onkeyup = function () {
    mirrorInput.update();
  };
};
