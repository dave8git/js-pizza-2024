import { settings, select } from "./../settings.js";
import BaseWidget from "./BaseWidget.js";

class AmountWidget extends BaseWidget{
    constructor(element) {
      super(element, settings.amountWidget.defaultValue);
      const thisWidget = this;
      // console.log('AmountWidget:', thisWidget);
      // console.log('constructor arguments:', element);
      thisWidget.getElements(element);
      //thisWidget.setValue(thisWidget.dom.input.value=settings.amountWidget.defaultValue);
      
      thisWidget.initActions();
      //thisWidget.setValue();
      thisWidget.renderValue();
     
    }

    isValid(value) {
      return !isNaN(value) 
          // && value <= settings.amountWidget.defaultMax 
          // && value >= settings.amountWidget.defaultMin;
    }

    renderValue() {
      const thisWidget = this;

      thisWidget.dom.input.value = thisWidget.value;
    }

    getElements() {
      const thisWidget = this;

      //thisWidget.dom.wrapper = element;
      console.log('thisWidget.dom.wrapper.querySelector(select.widgets.amount.input)', thisWidget.dom.wrapper.querySelector(select.widgets.amount.input))
      thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
      thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
    }

    initActions() {
      const thisWidget = this;
      //console.log(thisWidget.dom.input.value);
      thisWidget.dom.input.addEventListener('change', function (event) {
        event.preventDefault();
        //thisWidget.setValue(thisWidget.dom.input.value);
        thisWidget.value = thisWidget.dom.input.value;
      });
      

      thisWidget.dom.linkDecrease.addEventListener('click', function (event) {
        event.preventDefault();

        if(thisWidget.value >= 0) {
          thisWidget.setValue(thisWidget.value-1);
        }
      });

      thisWidget.dom.linkIncrease.addEventListener('click', function (event) {
        event.preventDefault();
        if(thisWidget.value <= 9) {
          thisWidget.setValue(thisWidget.value+1);
        } 
        
      });
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

  export default AmountWidget;