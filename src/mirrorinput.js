class MirrorInput {
  constructor(origin, format = (x) => {return {text: x};}) {
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

  static setCaretPosition(elem, caretPos) {
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
}

MirrorInput.prototype.update = function () {
  this.origin.setAttribute("actualValue", this.origin.value);
  this.actualValue = this.origin.value;
  if (this.origin.value) {
      const format = this.onUpdate(this.origin.value);
      const newValue = format.text;

      if (format.spaces) this.spaces = format.spaces;

      this.copy = newValue;
  } else {
      this.copy = "";
  }
};

MirrorInput.prototype.swap = function () {
  const temp = this.copy;
  this.copy = this.origin.value;
  this.origin.value = temp;
};

MirrorInput.prototype.create = function () {
  const mirrorInput = this;
  let editMode = this.editMode;
  let origin = this.origin;

  origin.addEventListener("blur", function () {
      if (editMode) {
          editMode = false;
          mirrorInput.update();
          mirrorInput.swap();
      }
  });

  origin.onkeyup = () => mirrorInput.update();
  origin.onchange = () => mirrorInput.update();

  this.update();
  mirrorInput.swap();

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
                  MirrorInput.setCaretPosition(origin, (mirrorInput.spaces.slice(0, caretPos).match(/1/g) || []).length);
              }
              else {
                  MirrorInput.setCaretPosition(origin, caretPos);
              }
          }
      };
  }
  origin.onmouseup = () => {
      if (!editMode) {
          onEdit();
      }
  };
  origin.onfocus = () => {
      if (!editMode) {
          editMode = true;
          mirrorInput.swap();
      }
  };
};
