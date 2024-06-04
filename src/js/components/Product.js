import {select, classNames, templates} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';


class Product{
    constructor(id, data) {
      const thisProduct = this; 
      thisProduct.id = id;
      thisProduct.data = data;
      thisProduct.renderInMenu(); 
      thisProduct.getElements(); 
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget(); 
      thisProduct.processOrder(); 
      thisProduct.prepareCartProduct();
    }

    renderInMenu() {
      const thisProduct = this;

      const generatedHTML = templates.menuProduct(thisProduct.data);
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);
      const menuContainer = document.querySelector(select.containerOf.menu);
      menuContainer.appendChild(thisProduct.element);
    }

    getElements() {
      const thisProduct = this; 
      thisProduct.dom = {};
      thisProduct.dom.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.dom.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.dom.formInputs = thisProduct.dom.form.querySelectorAll(select.all.formInputs);
      thisProduct.dom.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.dom.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.dom.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.dom.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget); 
    }

    initAccordion() {
      const thisProduct = this; 
      
      thisProduct.dom.accordionTrigger.addEventListener('click', function(e){
        e.preventDefault(); 
        
        const activeProducts = document.querySelectorAll(select.all.menuProductsActive);
      
        activeProducts.forEach(activeProduct => {
          if(activeProduct !== thisProduct.element) {
            activeProduct.classList.remove('active');
          }
        });
        thisProduct.element.classList.toggle('active');
        
      });
      
    }

    initOrderForm() {
      const thisProduct = this; 

      thisProduct.dom.form.addEventListener('submit', function(event) {
        event.preventDefault(); 
        thisProduct.processOrder(); 
      });

      for(let input of thisProduct.dom.formInputs) {
        input.addEventListener('change', function() {
          thisProduct.processOrder(); 
        });
      }

      thisProduct.dom.cartButton.addEventListener('click', function(event) {
        event.preventDefault();
        thisProduct.processOrder(); 
        thisProduct.addToCart();
      });
    }

    initAmountWidget() {
      const thisProduct = this; 
      thisProduct.dom.amountWidget = new AmountWidget(thisProduct.dom.amountWidgetElem);
      thisProduct.dom.amountWidgetElem.addEventListener('updated', function () {
        thisProduct.processOrder();
      });
    }

    processOrder() {
      const thisProduct = this; 
      // convert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.dom.form);

      // set price to default price
      let price = thisProduct.data.price; 

      // for every category (param)...
      for(let paramId in thisProduct.data.params) {
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes' ... }
        const param = thisProduct.data.params[paramId];
      
        // for every option in this category
        for(let optionId in param.options) {
          // determine option value, e.g. option = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];
          if(formData[paramId] && formData[paramId].includes(optionId) ) {
            if(!option.default) {
              price += option.price;
              const foundElement = thisProduct.dom.imageWrapper.querySelector(`.${paramId}-${optionId}`);
              if(foundElement) {
                foundElement.classList.add(classNames.menuProduct.imageVisible);
              } 
            } else if (option.default) {
              const foundElement = thisProduct.dom.imageWrapper.querySelector(`.${paramId}-${optionId}`);
              if(foundElement) {
                foundElement.classList.add(classNames.menuProduct.imageVisible);
              } 
            }
          } else {
            const foundElement = thisProduct.dom.imageWrapper.querySelector(`.${paramId}-${optionId}`);
            if(foundElement) {
              foundElement.classList.remove(classNames.menuProduct.imageVisible);
            } 
          }
        }
      }
      // update calculate price in the HTML 
    thisProduct.priceSingle = price;
    price *= thisProduct.dom.amountWidget.value;
    thisProduct.price = price;
    thisProduct.dom.priceElem.innerHTML = price; 
    }
    prepareCartProduct() {
      const thisProduct = this; 

      const productSummary = {};
      productSummary.id = thisProduct.id;
      productSummary.name = thisProduct.data.name;
      productSummary.amount = thisProduct.dom.amountWidget.value;
      productSummary.priceSingle = thisProduct.priceSingle;
      productSummary.price = thisProduct.price;
      productSummary.params = thisProduct.prepareCartProductParams();

      return productSummary;
    }
    prepareCartProductParams() {
      const thisProduct = this; 
      const formData = utils.serializeFormToObject(thisProduct.dom.form);
      const params = {};
    
      for(let paramId in thisProduct.data.params) {
        const param = thisProduct.data.params[paramId];
        params[paramId] = {
          label: param.label,
          options: {},
        };
        for(let optionId in param.options) {
          const option = param.options[optionId];
          if(formData[paramId] && formData[paramId].includes(optionId) ) {
            params[paramId].options[optionId] = option.label;
          }
        }
      }
      return params;
    }
    addToCart(){
      const thisProduct = this;
      //app.cart.add(thisProduct.prepareCartProduct());
      const event = new CustomEvent('add-to-cart', {
        bubbles: true,
        detail: {
          product: thisProduct.prepareCartProduct(),
        },
      });
      thisProduct.element.dispatchEvent(event);
    }
  }

  export default Product;