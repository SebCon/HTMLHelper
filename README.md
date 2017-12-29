# HTMLHelper
light library for DOM functions and element modifications

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Installing

Download the file EventHandler.js and link them in your project like:
```html
<script src="HTMLHelper.js"></script>
```
or without downloading files like
```html
<script src="https://rawgit.com/SebCon/HTMLHelper/master/HTMLHelper.js"></script>
```

## Examples

### setStyle

If you want to change styles of an element, you can do this via JS. But for better performance you have to do this via these collection function and do only refresh at the end:

```html
<div id="testme" style="display: none"></div>
<input id="inputTest" style="display: none">
```

```javascript
var elem = document.getElementById('testme');

HTMLHelper.setStyle(elem.id, elem, new HTMLHelper.style('display', 'block'));
HTMLHelper.setStyle(elem.id, elem, new HTMLHelper.style('width', '200px'));
HTMLHelper.setStyle(elem.id, elem, new HTMLHelper.style('backgroundColor', 'red'));
HTMLHelper.refreshAll();
```

And here are some examples with other functions:

### setFocus / isDisabled / isHidden
```javascript
var input = document.getElementById('inputTest');

  if (!HTMLHelper.isDisabled(input) && !HTMLHelper.isHidden(input)) {
    HTMLHelper.setFocus(input);
  } else {
    console.warn('first try to set focus');
  }

  HTMLHelper.setStyle(input.id, input, new HTMLHelper.style('display', 'block'), true);

  // need timeout because of animation frame
  setTimeout(function() {
    if (!HTMLHelper.isDisabled(input) && !HTMLHelper.isHidden(input)) {
      console.log('set focus!');
      HTMLHelper.setFocus(input);
    }
  }, 100);
```
      
## Examples
These examples you can find in *examples.html*

## Authors

* **Sebastian Conrad** - [sebcon](http://www.sebcon.de)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
