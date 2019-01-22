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
  }
}

MirrorInput.prototype.onUpdate = function (text) {
  return text;
};

MirrorInput.prototype.update = function () {
  if (this.copy) {
    var newValue = this.onUpdate(this.origin.value);
    this.copy.value = newValue;
  }
};

MirrorInput.prototype.create = function () {
  var origin = this.origin;

  this.parent = document.createElement("div");
  this.parent.classList.add("mirrorinput-parent");
  this.copy = origin.cloneNode(true);

  this.copy.id = this.copy.id + "Copy";
  this.copy.type = "text";
  this.copy.classList.remove("mirrorinput");
  this.copy.classList.add("mirrorinput-clone");

  this.copy.style["margin-top"] = "-" + origin.offsetHeight + "px";

  // remove origin placeholder
  // origin.placeholder = "";

  origin.parentNode.insertBefore(this.parent, origin);
  this.parent.appendChild(origin);
  this.parent.appendChild(this.copy);
  this.update();
};

function initElements() {
  var mirrorElements = document.getElementsByClassName("mirrorinput");
  Array.from(mirrorElements).forEach(function (element) {
    var mirrorInput = new MirrorInput(element); 
    
    const onMirrorText = element.getAttribute("onMirror");
    
    if (onMirrorText !== null) mirrorInput.onUpdate = window[onMirrorText];

    mirrorInput.create();

    element.onkeyup = function () {
      mirrorInput.update();
    };
  });
}

function ready(callback){
  if (document.readyState!="loading") callback();
  else if (document.addEventListener) document.addEventListener("DOMContentLoaded", callback);
  else document.attachEvent("onreadystatechange", function(){
      if (document.readyState=="complete") callback();
  });
}

ready(function(){
  initElements();
});
