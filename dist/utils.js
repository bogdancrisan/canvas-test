'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var U = {};

/**
 * Returns a new object with the desired properties from the original object
 * @param  {...any} props 
 */
U.select = function () {
  for (var _len = arguments.length, props = Array(_len), _key = 0; _key < _len; _key++) {
    props[_key] = arguments[_key];
  }

  return function (obj) {
    return props.reduce(function (acc, prop) {
      return _extends({}, acc, _defineProperty({}, prop, obj[prop]));
    }, {});
  };
};

/**
 * @param  {...function} args - functions that operate in order from right
 *  to left on the supplied value
 */
U.compose = function () {
  for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    args[_key2] = arguments[_key2];
  }

  return function (val) {
    return args.reduceRight(function (acc, fn) {
      return fn(acc);
    }, val);
  };
};

U.log = function (obj) {
  return console.log(obj), obj;
};

U.get = function (prop) {
  return function (obj) {
    return obj[prop];
  };
};

/**
 * get object values based on separate search terms to try and not depend on the specific object key name
 * @param  {...string} terms 
 */
U.getProperty = function () {
  for (var _len3 = arguments.length, terms = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
    terms[_key3] = arguments[_key3];
  }

  return function (obj) {
    var prop = Object.keys(obj).find(function (key) {
      return terms.filter(function (term) {
        return key.toLowerCase().includes(term);
      }).length === terms.length;
    });

    if (!prop) {
      return undefined;
    }

    return obj[prop];
  };
};

U.getPropertyInArray = function () {
  for (var _len4 = arguments.length, terms = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
    terms[_key4] = arguments[_key4];
  }

  return function (arr) {
    return U.getProperty.apply(U, terms)(arr.find(function (element) {
      return U.getProperty.apply(U, terms)(element);
    }));
  };
};

U.isNumber = function (str) {
  return !Number.isNaN(parseInt(str));
};

/**
 * @param  {string} terms - check to see if these are included in the supplied string
 * @param {string} str - string
 */
U.contains = function () {
  for (var _len5 = arguments.length, terms = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
    terms[_key5] = arguments[_key5];
  }

  return function (str) {
    return terms.filter(function (term) {
      return str.toLowerCase().includes(term);
    }).length === terms.length;
  };
};

/**
 * Returns an array with only the objects that have these matching key value pairs
 * @param {string} key 
 * @param {any} value 
 * @param {obj[]} arr 
*/
U.selectWith = function (key, value) {
  return function (arr) {
    return arr.filter(function (el) {
      return U.getProperty(key)(el) === value;
    });
  };
};

U.selectWithout = function (key, value) {
  return function (arr) {
    return arr.filter(function (el) {
      return U.getProperty(key)(el) !== value;
    });
  };
};

/**
 * Replace objects in existingArr that have matching key value pairs with newElements
 * @param {string} key 
 * @param {any} value 
 * @param {obj[]} existingArr 
 * @param {obj[]} newElements 
 */
U.replace = function (key, value, existingArr, newElements) {
  return [].concat(_toConsumableArray(U.selectWithout(key, value)(existingArr)), _toConsumableArray(newElements));
};

U.not = function (obj) {
  return !obj;
};

U.neg = function (fn) {
  return U.compose(U.not, fn);
};

U.isPromise = function (obj) {
  return !!obj.then;
};

/**
 * Returns a function that can be passed as a callback and it will call fn with val as parameter
 * @param {function} fn 
 * @param {any} val 
 */
U.callback = function (fn, val) {
  return function () {
    return fn(val);
  };
};

/**
 * Generates a class string based on the base class name and the modifiers provided
 * @param {string} cssclass 
 * @param {string} modifiers 
 */
U.genCssClasses = function (cssclass, modifiers) {
  return cssclass + ' ' + modifiers.split(/\s+/).map(function (mod) {
    return cssclass + '--' + mod;
  }).join(' ');
};

U.getBrowserWidth = function () {
  return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
};

/**
 * Random 16 characters long number id
 */
U.genId = function () {
  return Math.random().toString().slice(2);
};

U.fromPercent = function (percent, num) {
  return percent / 100 * num;
}; //Math.round((percent / 100) * num);

U.toPercent = function (val1, val2) {
  return val1 / val2 * 100;
}; //Math.round((val1 / val2) * 100);

U.filterUndefined = function (o) {
  return Object.keys(o).reduce(function (acc, key) {
    return o[key] !== undefined ? _extends({}, acc, _defineProperty({}, key, o[key])) : acc;
  }, {});
};

U.selectDefined = function () {
  return U.compose(U.filterUndefined, U.select.apply(U, arguments));
};