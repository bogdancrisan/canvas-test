
const U = {};

/**
 * Returns a new object with the desired properties from the original object
 * @param  {...any} props 
 */
U.select = (...props) => obj => props.reduce((acc, prop) => ({ ...acc, [prop]: obj[prop]}), {});

/**
 * @param  {...function} args - functions that operate in order from right
 *  to left on the supplied value
 */
U.compose = (...args) => val => args.reduceRight((acc, fn) => fn(acc), val);

U.log = obj => (console.log(obj), obj);

U.get = prop => obj => obj[prop];

U.mmsToPixels = mms => Math.floor(mms * 3.7795275591);

/**
 * get object values based on separate search terms to try and not depend on the specific object key name
 * @param  {...string} terms 
 */
U.getProperty = (...terms) => obj => {
  const prop = Object.keys(obj).find(key => terms.filter(term => key.toLowerCase().includes(term)).length === terms.length);
  
  if (!prop) {
    return undefined;
  }
  
  return obj[prop];
}

U.getPropertyInArray = (...terms) => arr => U.getProperty(...terms)(arr.find(element => U.getProperty(...terms)(element)));

U.isNumber = str => !Number.isNaN(parseInt(str));

U.getPercent = (percent, num) => Math.floor((percent / 100) * num);

/**
 * @param  {string} terms - check to see if these are included in the supplied string
 * @param {string} str - string
 */
U.contains = (...terms) => str => terms.filter(term => str.toLowerCase().includes(term)).length === terms.length;

/**
 * Returns an array with only the objects that have these matching key value pairs
 * @param {string} key 
 * @param {any} value 
 * @param {obj[]} arr 
 */
U.selectWith = (key, value) => arr => arr.filter(el => U.getProperty(key)(el) === value);

U.selectWithout = (key, value) => arr => arr.filter(el => U.getProperty(key)(el) !== value);

/**
 * Replace objects in existingArr that have matching key value pairs with newElements
 * @param {string} key 
 * @param {any} value 
 * @param {obj[]} existingArr 
 * @param {obj[]} newElements 
 */
U.replace = (key, value, existingArr, newElements) => [ ...U.selectWithout(key, value)(existingArr), ...newElements];

U.not = obj => !obj;

U.isPromise = obj => !!obj.then;

/**
 * Returns a function that can be passed as a callback and it will call fn with val as parameter
 * @param {function} fn 
 * @param {any} val 
 */
U.callback = (fn, val) => () => fn(val);

/**
 * Generates a class string based on the base class name and the modifiers provided
 * @param {string} cssclass 
 * @param {string} modifiers 
 */
U.genCssClasses = (cssclass, modifiers) => `${cssclass} ${modifiers.split(/\s+/).map(mod => `${cssclass}--${mod}`).join(' ')}`;

U.getBrowserWidth = () => (window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth);

/**
 * Random 16 characters long number id
 */
U.genId = () => Math.random().toString().slice(2);
