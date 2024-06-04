import {settings, select} from '../settings.js';

class AmountWidget{
    constructor(element) {
      const thisWidget = this; 
      thisWidget.getElements(element);
      //thisWidget.setValue(thisWidget.input.value);
      if(thisWidget.input.value) {  // jeżeli coś jest w inpucie
        thisWidget.setValue(thisWidget.input.value); // to podaj do setValue (i użyj) tego co jest wpisane
      } else {
        thisWidget.setValue(settings.amountWidget.defaultValue); // jeżeli nie ma nic, to ustaw defaultValue
      }
      thisWidget.initActions();
    }

    getElements(element) { 
      const thisWidget = this; 
      thisWidget.element = element; 
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease); 
    }

    setValue(value) {
      const thisWidget = this;
      const newValue = parseInt(value);

      if(thisWidget.value !== newValue && !isNaN(newValue)) {
        if(newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax) {
          thisWidget.value = newValue;
          thisWidget.announce();
        }
      }
      /* TODO: Add validation */ 
      thisWidget.input.value = thisWidget.value;
    }

    initActions() {
      const thisWidget = this;
      thisWidget.input.addEventListener('change', function() {
        thisWidget.setValue(thisWidget.input.value);
      })
      thisWidget.linkDecrease.addEventListener('click', function() {
      if(thisWidget.value >= 0) {
        thisWidget.setValue(thisWidget.value - 1);
      }
      });
      thisWidget.linkIncrease.addEventListener('click', function() {
      if(thisWidget.value <= 9) {
        thisWidget.setValue(thisWidget.value + 1);
      }
        
      })
    }
    announce(){
      const thisWidget = this;
      // const event = new Event('updated');
      const event = new CustomEvent('updated', {
        bubbles: true
      });
      console.log('stworzył się customEvent updated i powinno działać')
      thisWidget.element.dispatchEvent(event);
    }
  }

  export default AmountWidget;