## Mirrorinput.js

A library to copy an input element and allow you to custom string to show.


#### Features
- Edit value to show as you want without effect primary value
- Number pads for mobile when you need to add text on input field
- Caret selection position when value size is change
- No jQuery need


#### Example 

```
function onCreditCardShow(text) {
    let newText = "";
    let spaces = "";
    for(let i in text.split("")) {
        if(i%4 == 0) {
            newText += " ";
            spaces += "0";
        }
        if (i>2 && i<12) {
            newText += "*";
        }
        else {
            newText += text[i];
        }
        spaces += "1";
    }
    return {text: newText, spaces: spaces};
}

var cardMirrorInput = new MirrorInput(document.getElementById("exampleInputCard"), onCreditCardShow);
```

Warning caret position do not support in type number, email, date

please use type text and tel instead
