import {settings, select} from '../settings.js';
class BaseWidget {
    constructor(wrapperElement, initialValue) {
        const thisWidget = this; 

        thisWidget.dom = {};
        thisWidget.dom.wrapper = wrapperElement; 
     

        thisWidget.correctValue = initialValue;
    }

    get value() {
        const thisWidget = this; 

        return thisWidget.correctValue; 
    }

    set value(value) {
        const thisWidget = this;
  
        const newValue = thisWidget.parseValue(value); // input nawet o typie 'number' zawsze zwraca wartość w formacie tekstowym. 
        // jeżeli parseInt nie będzie w stanie skonwertować tego co otrzyma zwróci null
       
        if(thisWidget.correctValue !== newValue) {
          thisWidget.correctValue = newValue;
            thisWidget.announce();
            //console.log('newValue', newValue);
        } 
       // thisWidget.dom.input.value = thisWidget.correctValue;
       thisWidget.renderValue();
      }

    setValue(value) {
        const thisWidget = this; 

        thisWidget.value = value;
    }
    //   setValue(value) {
    //     const thisWidget = this; 

    //     thisWidget.correctValue = value;
    //   }
      parseValue(value) {
        return parseInt(value);
      }
  
      isValid(value) {
        return !isNaN(value);
      }
  
      renderValue() {
        const thisWidget = this;
  
        thisWidget.dom.wrapper.innerHTML = thisWidget.value;
      }

      announce() {
        const thisWidget = this; 
        const event = new CustomEvent('updated', {
          bubbles: true
        });
        thisWidget.dom.wrapper.dispatchEvent(event);
        //console.log(event);
      }
}

export default BaseWidget;