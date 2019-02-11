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
    this.editMode = false;
    
    this.onUpdate = format;

    this.onOver = false;
    this.actualValue = null;

    this.create();
  }
}

MirrorInput.prototype.update = function () {
  if (this.origin.value) {
    this.actualValue = this.origin.value;
    const format = this.onUpdate(this.origin.value);
    const newValue = format.text;

    if (format.spaces) this.spaces = format.spaces;

    this.copy.innerHTML = newValue;
  } else {
    this.copy.innerHTML = "";
  }
};

MirrorInput.prototype.swap = function () {
  const temp = this.copy.innerHTML;
  this.copy.innerHTML = this.origin.value;
  this.origin.value = temp;
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

  const mirrorInput = this;
  
  let editMode = this.editMode;

  let origin = this.origin;

  this.copy = document.createElement("div");
  let copy = this.copy;

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

  origin.onkeyup = () => mirrorInput.update();

  origin.onchange = () => mirrorInput.update();
  
  origin.classList.add("mirrorinput");

  this.parent = document.createElement("div");
  this.parent.classList.add("mirrorinput-parent");

  origin.parentNode.insertBefore(this.parent, origin);
  this.parent.appendChild(origin);
  this.parent.appendChild(copy);
  
  this.update();

  let onEdit;
  if (["number", "email", "date"].includes(origin.type)) {
    // eslint-disable-next-line no-use-before-define
    console.warn("(MirrorInput) Warning caret position will not update for type number, email and date");
    onEdit = () => {
      if (!editMode) {
        editMode = true;
        mirrorInput.swap();
        origin.focus();
      }
    };
  }
  else{
    onEdit = e => {
      if (!editMode) {
        editMode = true;
        const caretPos = e.target.selectionStart;
        mirrorInput.swap();
        if (mirrorInput.spaces) {
          setCaretPosition(origin, (mirrorInput.spaces.slice(0, caretPos).match(/1/g) || []).length);
        }
        else {
          setCaretPosition(origin, caretPos);
        }
      }
    };
  }
  origin.onmouseup = onEdit;
  origin.onmouseover = () => {
    this.onOver = true;
  };
  origin.onmouseout = () => {
    this.onOver = false;
  };
  origin.onfocus = () => {
    if (!editMode && !this.onOver) {
      editMode = true;
      mirrorInput.swap();
    }
  };

  mirrorInput.swap();
};
