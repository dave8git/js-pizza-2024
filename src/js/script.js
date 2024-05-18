/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

const select = {
  templateOf: {
    menuProduct: "#template-menu-product",
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 0,
      defaultMax: 10,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  };

  class Product{
    constructor(id, data) {
      const thisProduct = this; 
      thisProduct.i = id;
      thisProduct.data = data;
      thisProduct.renderInMenu(); 
      thisProduct.getElements(); 
      thisProduct.initAccordion();
      thisProduct.initOrderForm(); 
      thisProduct.processOrder(); 
      console.log('new Product:', thisProduct);
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
      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    }

    initAccordion() {
      const thisProduct = this; 
      
      thisProduct.accordionTrigger.addEventListener('click', function(e){
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

      thisProduct.form.addEventListener('submit', function(event) {
        event.preventDefault(); 
        thisProduct.processOrder(); 
      });

      for(let input of thisProduct.formInputs) {
        input.addEventListener('change', function() {
          thisProduct.processOrder(); 
        });
      }

      thisProduct.cartButton.addEventListener('click', function(event) {
        event.preventDefault();
        thisProduct.processOrder(); 
      });
      //console.log('initOrderForm');
    }

    processOrder() {
      const thisProduct = this; 

      // convert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.form);
      //console.log('formData', formData);

      // set price to default price
      let price = thisProduct.data.price; 

      // for every category (param)...
      for(let paramId in thisProduct.data.params) {
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes' ... }
        const param = thisProduct.data.params[paramId];
        //console.log(paramId, param);

        // for every option in this category
        for(let optionId in param.options) {
          // determine option value, e.g. option = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];
          //console.log('formData', formData[paramId]);
          //console.log('option.default or not', option.default);
          if(formData[paramId] && formData[paramId].includes(optionId) ) {
            if(!option.default) {
              price += option.price;
            } 
          } 
        }
      }
      // update calculate price in the HTML 
      thisProduct.priceElem.innerHTML = price; 
    }
  }
  const app = {
   
    initMenu: function(){
      const thisApp = this; 

      console.log('thisApp.data', thisApp.data);

      for(let productData in thisApp.data.products) {
        new Product(productData, thisApp.data.products[productData]); // 1. przekazujemy nazwę (np. cake) jako pierwszy argument
        // 2. przekazujemy cały obiekt thisApp.data.products[productData]
      }
      // const testProduct = new Product();
      // console.log('testProduct:', testProduct);
    },
    initData: function() {
      const thisApp = this;
      //const data = dataSource;
      thisApp.data = dataSource;

      console.log('thisApp.data', thisApp.data);
    },
    init: function(){
      const thisApp = this;

      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
    },
  };

  app.init(); // metoda init uruchamiana jest na obiekcie app - app.init. Dltego zgodnie z zasadą implicit binding rule wskaże na obiekt app. 
}