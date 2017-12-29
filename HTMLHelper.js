'use strict';


/**
*		@namespace HTMLHelper
*/

/**
 *    @copyright 2017
 *    @author Sebastian Conrad <http://www.sebcon.de/>
 *    @version 1.0 - 15. december 2017
 *    @see http://www.github.com/sebcon
 *    @license Available under MIT license <https://mths.be/mit>
 *    @fileoverview light library for some DOM and HTML element helper functions
 */


/**
*		@class HTMLHelper
*
*		@constructor
*		@param {document}	document document object
*		@param {window} window window object
**/

var HTMLHelper = (function(document, window) {
  var styles = [];
  var attributes = [];
  var tryAgainCaching = {};

  /** @constant {number} */
  var SCROLLTOP_DELAY_TIME = 68;
  /** @constant {number} */
  var FOCUS_DELAY_TIME = 125;


  /** trigger input change
  *		@function fireChangeEventManually
  *		@param {HTMLElement} elem HTML Element
  **/
  var fireChangeEventManually = function(elem) {
    //console.log("Trigged fireChangeEventManually");
    // From StackOverflow : https://stackoverflow.com/questions/2856513/how-can-i-trigger-an-onchange-event-manually
    if ("createEvent" in document) {
      var evt = document.createEvent("HTMLEvents");
      evt.initEvent("change", false, true);
      elem.dispatchEvent(evt);
    }
    else {
      elem.fireEvent("onchange");
    }
  };


  /** get id of the parent node
  *		@function getParentId
  *		@param {HTMLElement} elem HTML Element
  *
  *   @return {string} element parent id
  **/
  var getParentId = function(elem) {
    var back = '';
    var found = false;
    if (elem) {
      if (!elem.id) {
        while (elem.parentNode && !found) {
          elem = elem.parentNode;
          found = (elem.id);
          if (found) {
            back = elem.id;
          }
        }
      } else {
        back =elem.id;
      }
    }

    return back;
  };


  /** get id of the next parent node
  *		@function getParentsNextId
  *		@param {HTMLElement} elem HTML Element
  *
  *   @return {string} element parent id
  **/
  var getParentsNextId = function(elem) {
    var back = '';
    if (elem) {
      var found = false;
      while(elem && !found) {
        found = (elem.parentNode && elem.parentNode.id);
        elem = elem.parentNode;
      }
      if (found) {
        back = elem.id;
      }
    }
    return back;
  };


  /** get id of the wrapper node
  *		@function getWrapperId
  *		@param {HTMLElement} elem HTML Element
  *
  *   @return {string} element wrapper id
  **/
  var getWrapperId = function(elem) {
    var wrapperID = '';
    if (elem) {
      var parent = elem.parentNode;
      if (parent && parent.id) {
        var wrapper = parent.id.toLowerCase();
        if (wrapper && wrapper.indexOf('wrapper') >= 0) {
          wrapperID = parent.id;
        }
      }
    }
    return wrapperID;
  };


  /** check if element is active document element
  *		@function isActiveFieldSet
  *		@param {HTMLElement} elem HTML Element
  *
  *   @return {boolean} element is the given element the active document element
  **/
  var isActiveFieldSet = function(elem) {
    var found = true;
    if (elem && elem.id) {
      found = (document.activeElement.id === elem.id);
    }

    return found;
  };


  /** check if attribute of element is set
  *		@function isAttrSet
  *		@param {HTMLElement} elem HTML Element
  *   @param {string} attr Attribute name
  *
  *   @return {boolean} found attribute in element
  **/
  var isAttrSet = function(elem, attr) {
    var found = false;
    if (elem && elem.getAttribute && attr) {
      var temp = elem.getAttribute(attr);
      found = (temp !== undefined && temp !== null && temp);
    }

    return found;
  };


  /** check if given element is disabled (disable, hidden or not visible)
  *		@function isDisabled
  *		@param {HTMLElement} elem HTML Element
  *
  *   @return {boolean} is disabled
  **/
  var isDisabled = function(elem) {
    var found = false;
    if (elem) {
      if (elem.getAttribute) {
        var temp = elem.getAttribute('disabled');
        found = (temp !== undefined && temp !== null);
      }
    }
    return found;
  };


  /** check if given element is hidden (or not visible)
  *		@function isHidden
  *		@param {HTMLElement} elem HTML Element
  *
  *   @return {boolean} is hidden
  **/
  var isHidden = function(elem) {
    var found = false;
    if (elem) {
      found = (elem.style && elem.style.visibility && elem.style.visibility.toLowerCase() === 'hidden');
      if (!found) {
        found = (elem.style && elem.style.display && elem.style.display.toLowerCase() === 'none');
      }
      if (!found) {
        found = (elem.style && elem.style.opacity && elem.style.opacity === '0');
      }
    }

    return found;
  };



  var style = function(name, value) {
    this.name = name;
    this.value = value;
    return {
      getName : function() {
        return name;
      },

      getValue : function() {
        return value;
      }
    };
  };


  var attribute = function(name, value) {
    this.name = name;
    this.value = value;
    return {
      getName : function() {
        return name;
      },
      getValue : function() {
        return value;
      }
    };
  };


  /** set style of an element
  *		@function setStyle
  *   @param {string} id identifier
  *   @param {HTMLElement} element HTML element
  *   @param {Object} style style name and style value
  *   @param {boolean} [refresh] refresh style
  **/
  var setStyle = function(id, element, style, refresh) {
    if (styles && element && id) {
      if (!styles[id]) {
        styles[id] = [];
      }
      styles[id].push({element : element, style : style});
      if (refresh !== undefined && typeof(refresh) === 'boolean' && refresh === true) {
        this.refreshStyle(id);
      }
    }
  };


  /** set attribute of an element
  *		@function setAttribute
  *   @param {string} id identifier
  *   @param {HTMLElement} element HTML element
  *   @param {Object} attribute attribute name and attribute value
  *   @param {boolean} [refresh] refresh style
  **/
  var setAttribute = function(id, element, attribute, refresh) {
    if (attribute && element && id) {
      if (!attributes[id]) {
        attributes[id] = [];
      }
      attributes[id].push({element : element, attribute : attribute});

      if (refresh) {
        this.refreshAttribute(id);
      }
    }
  };


  var refreshAttribute = function(id) {
    window.requestAnimationFrame(function() {
      refreshAttributeContent(id);
    });
  };


  var refreshAttributeContent = function(id) {
    if (id && attributes[id] && attributes[id].length > 0) {
      var len = attributes[id].length;
      for (var i=0; i < len; i++) {
        var tObj = attributes[id][i];
        var attr = tObj.attribute.getName();
        var value = tObj.attribute.getValue();
        if (attr && value !== undefined && value !== null) {
          tObj.element.setAttribute(attr, value);
        }
      }

      attributes[id] = null;
    }
  };


  /** refresh style of id
  *		@function refreshStyle
  *		@param {string} id identifier
  **/
  var refreshStyle = function(id) {
    window.requestAnimationFrame(function() {
      refreshStyleContent(id);
    });
  };


  /** refresh all latest styles
  *		@function refreshAll
  **/
  var refreshAll = function() {
    for (var key in styles) {
      if (styles[key] && styles[key].length > 0) {
        //console.log('refresh style: '+key);
        refreshStyle(key);
      }
    }

    for (var key2 in attributes) {
      if (attributes[key2] && attributes[key2].length > 0) {
        //console.log('refresh attr: '+key2);
        refreshAttribute(key2);
      }
    }
  };


  var refreshStyleContent = function(id) {
    if (id && styles[id] && styles[id].length > 0) {
      var len = styles[id].length;
      for (var i=0; i < len; i++) {
        var tObj = styles[id][i];
        var attr = tObj.style.getName();
        var value = tObj.style.getValue();
        //console.log('attr: '+attr+' val: '+value);
        if (attr && value !== undefined && value !== null) {
          if (tObj.element.style[attr] !== undefined && tObj.element.style[attr] !== null) {
            //console.warn('set style ' + attr + ': ' + value + '- '+id);
            tObj.element.style[attr] = value;
          } else {
            console.warn('cannot set style: '+attr+' - value: '+value);
          }
        }
      }
      styles[id] = null;
    }
  };


  /** set scrollbar top to given position
  *		@function setScrollTop
  *		@param {HTMLElement} elem HTML Element
  *   @param {number} position position
  **/
  var setScrollTop = function(elem, position) {
    if (elem && position !== undefined && position !== null && parseInt(position) >= 0) {
      window.requestAnimationFrame(function() {
        elem.scrollTop = position;
      });
    }
  };


  /** set focus on given element
  *		@function setFocus
  *		@param {HTMLElement} elem HTML Element
  **/
  var setFocus = function(elem) {
    if (elem && !isDisabled(elem)) {
      window.requestAnimationFrame(function() {
        elem.focus();

        if (!isActiveFieldSet(elem)) {
          window.setTimeout(function () {
            window.requestAnimationFrame(function() {
              elem.focus();
            });
          }, FOCUS_DELAY_TIME);
        }

      });
    }
  };


  /** leave given element via blur
  *		@function setBlur
  *		@param {HTMLElement} elem HTML Element
  **/
  var setBlur = function(elem) {
    if (elem) {
      window.requestAnimationFrame(function() {
        elem.blur();
      });
    }
  };


  /** set inner HTML of given element
  *		@function setHTML
  *		@param {HTMLElement} elem HTML Element
  *   @param {string} html html sourcecode in string format
  **/
  var setHTML = function(elem, html) {
    if (elem && html !== undefined && html !== null) {
      window.requestAnimationFrame(function() {
        elem.innerHTML = html;
      });
    }
  };


  /** set inner HTML of given element
  *		@function setImage
  *		@param {HTMLElement} elem HTML Element
  *   @param {string} imgSrc image source
  **/
  var setImage = function(elem, imgSrc) {
    if (elem && imgSrc) {
      window.requestAnimationFrame(function() {
        elem.src = imgSrc;
      });
    }
  };


  /** check if given element is of type text
  *		@function isTextField
  *		@param {HTMLElement} elem HTML Element
  *
  *   @return {boolean} is textfield
  **/
  var isTextField = function(elem) {
    var found = false;
    if (elem && elem.type) {
      var temp = elem.type.toLowerCase();
      found = (temp === 'text' || temp === 'textfield' || temp === 'password' || (elem.tagName && elem.tagName.toLowerCase() === 'input' && temp !== 'checkbox') || (elem.tagName && elem.tagName.toLowerCase() === 'textarea'));
    }
    return found;
  };


  /** check if given element is contenteditable
  *		@function isDIVEditField
  *		@param {HTMLElement} elem HTML Element
  *
  *   @return {boolean} is contenteditable div element
  **/
  var isDIVEditField = function(elem) {
    var found = false;
    if (elem && elem.tagName) {
      found = (isAttrSet(elem, 'contenteditable'));
      if (!found) {
        var parent = elem.parentNode;
        if (parent && parent.tagName) {
          found = elem.isContentEditable;
        }
      }
    }
    return found;
  };


  /** check if given element is contenteditable
  *		@function isDIVEditField
  *		@param {HTMLElement} elem HTML Element
  *
  *   @return {boolean} is contenteditable div element
  **/
  var isTextAreaField = function(elem) {
    return (elem && elem.tagName && elem.tagName.toLowerCase() === 'textarea');
  };


  /** get value of the given element
  *		@function getValue
  *		@param {HTMLElement} elem HTML Element
  *
  *   @return {string} value of element
  **/
  var getValue = function(elem) {
    var value = '';
    if (elem) {
      if (isTextField(elem)) {
        value = elem.value;
      } else if (isDIVEditField(elem)) {
        value = (elem.innerText || elem.innerHTML || '');
      } else {
        console.warn('cannot read input value!');
      }
    }
    return value;
  };


  /** set value of the given element
  *		@function setValue
  *		@param {HTMLElement} elem HTML Element
  *   @param {string} val element value
  **/
  var setValue = function(elem, val) {
    if (elem && val !== undefined && val !== null) {
      if (isDIVEditField(elem)) {
        insertValueInDiv(elem, val);
      } else {
        elem.value = val;
      }
      fireChangeEventManually(elem);
    }
  };


  /** remove all childs of parent node
  *		@function removeAllChilds
  *		@param {HTMLElement} parentNode HTML parent Element
  **/
  var removeAllChilds = function(parentNode) {
    if (parentNode) {
      while( parentNode.hasChildNodes() ) {
        parentNode.removeChild(parentNode.lastChild);
      }
    }
  };


  /** insert value in div element
  *		@function insertValueInDiv
  *		@param {HTMLElement} elem HTML Element
  *   @param {string} value element value
  **/
  var insertValueInDiv = function(elem, value) {
    value = value.replace(/\s/g, "&nbsp;");
    elem.innerHTML = value;
  };


  /** get cursor position
  *		@function getCursorPosition
  *		@param {HTMLElement} elem HTML Element
  *
  *   @return {number} cursor position
  **/
  var getCursorPosition = function(elem) {
    var pos = 0;
    if (elem && isTextField(elem)) {
        pos = elem.selectionStart;
    }

    return pos;
  };


  /** is cursor position at the end
  *		@function isCursorAtEnd
  *		@param {HTMLElement} elem HTML Element
  *
  *   @return {boolean} is cursor position at end
  **/
  var isCursorAtEnd = function(elem) {
    var back = false;
    if (elem) {
      var pos = getCursorPosition(elem);
      var value = getValue(elem);
      back = (pos >= value.length);
    }
    return back;
  };


  /** try to execute any function as callback with delay time
  *		@function tryAgain
  *		@param {string} id identifier
  *   @param {function} callback callback function
  *   @param {number} delay delay time before executing callback
  *   @param {number} maxLoop max tries
  **/
  var tryAgain = function(id, callback, delay, maxLoop) {
    if (id && callback) {
      if (tryAgainCaching[id] === undefined || tryAgainCaching[id] === null) {
        tryAgainCaching[id] = {callback : callback, count: 1, delay : (parseInt(delay) >= 0 || 250), maxLoop : (parseInt(maxLoop) || 3)};
      }

      if (tryAgainCaching[id] !== undefined && tryAgainCaching[id] !== null) {
        if (tryAgainCaching[id].count >= tryAgainCaching[id].maxLoop) {
          tryAgainCaching[id] = null;
          console.warn('cannot execute callback id: ' + id);
        } else {
          var callbackTemp = tryAgainCaching[id].callback;
          window.setTimeout(function() {
            if (callbackTemp !== undefined && callbackTemp !== null) {
              if (isFunction(callbackTemp)) {
                callbackTemp.call();
                if (tryAgainCaching[id] !== null) {
                  tryAgainCaching[id].count++;
                }
              }
            }
          }, tryAgainCaching[id].delay);
        }
      }
    } else {
      console.warn('cannot execute tryAgain');
    }
  };


  return {
    getParentId : getParentId,
    getWrapperId : getWrapperId,
    getParentsNextId : getParentsNextId,
    isActiveFieldSet : isActiveFieldSet,
    isAttrSet : isAttrSet,
    isDisabled : isDisabled,
    isHidden : isHidden,
    setStyle : setStyle,
    style : style,
    attribute : attribute,
    refreshStyle : refreshStyle,
    refreshAll : refreshAll,
    setAttribute : setAttribute,
    refreshAttribute : refreshAttribute,
    setScrollTop : setScrollTop,
    setFocus : setFocus,
    setBlur : setBlur,
    isTextField : isTextField,
    isDIVEditField : isDIVEditField,
    isTextAreaField : isTextAreaField,
    setHTML : setHTML,
    setImage : setImage,
    getValue : getValue,
    setValue : setValue,
    insertValueInDiv : insertValueInDiv,
    getCursorPosition : getCursorPosition,
    isCursorAtEnd : isCursorAtEnd,
    removeAllChilds : removeAllChilds,
    tryAgain : tryAgain,
  };

}(document, window));
