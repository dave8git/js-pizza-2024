/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

const select = {
  templateOf: {
    menuProduct: "#template-menu-product",
    cartProduct: '#template-cart-product', 
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
        input: 'input.amount', //'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    cart: {
      wrapperActive: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 0,
      defaultMin: 0,
      defaultMax: 10,
    },
    cart: {
      defaultDeliveryFee: 20,
    },
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
  };

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
      app.cart.add(thisProduct.prepareCartProduct());
    }
  }

  

  class Cart{
    constructor(element) {
      const thisCart = this; 
      thisCart.products = [];
      thisCart.getElements(element);
      thisCart.initActions();

      console.log(element);
    }

    getElements(element) {
      const thisCart = this; 
      thisCart.dom = {};
      thisCart.dom.wrapper = element; 
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
      thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
      thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
      thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);
      thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
      thisCart.dom.orderTotal = thisCart.dom.wrapper.querySelector(select.cart.orderTotal);
      console.log('thisCart.dom.totalNumber', thisCart.dom.totalNumber);
      //thisCart.dom.amountWidgetElem = thisCart.dom.wrapper.querySelector(select.cartProduct.amountWidget);
      // console.log('thisCart.dom.amountWidgetElem', thisCart.dom.amountWidgetElem);
      // console.log('element', element);
    }

    remove(cartProduct) {
      const thisCart = this;
      cartProduct.dom.wrapper.remove();
      const productIndex = thisCart.products.indexOf(cartProduct);
      thisCart.products.splice(productIndex, 1);
      thisCart.update();
    };

    initActions() {
      const thisCart = this; 

      thisCart.dom.toggleTrigger.addEventListener('click', function() {
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });

      thisCart.dom.productList.addEventListener('updated', function(){
        thisCart.update();
      });

      thisCart.dom.productList.addEventListener('remove', function(event){
        thisCart.remove(event.detail.cartProduct);
      });
    }

    // initAmountWidget() {
    //   const thisCart = this; 

    //   thisProduct.amountWidget = new AmountWidget(thisCart.dom.amountWidgetElem);
    //   thisProduct.dom.amountWidgetElem.addEventListener('updated', function() {
    //     thisProduct.processOrder();
    //   })
    // }
    add(menuProduct) { // dzięki temu, że nową instancję tej klasy wywołujemy w obiekcie app (na dole)
      // i zapisujemy w thisApp.cart, możemy teraz wywołać app.add w klasie Product w funkcji addToCart. 
      const thisCart = this; 
      //console.log('adding product', menuProduct); // w metodzie add produkt (thisProduct) widoczny jest jako
      const generatedHTML = templates.cartProduct(menuProduct);
      const generatedDOM = utils.createDOMFromHTML(generatedHTML);
      thisCart.dom.productList.appendChild(generatedDOM);
      thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
      // menuProduct
      thisCart.update();
    }
    update() {
      const thisCart = this; 
      const deliveryFee = settings.cart.defaultDeliveryFee;
      let totalNumber = 0;
      let subtotalPrice = 0;
      console.log('update ruszyło');
      for(let product of thisCart.products) {
        console.log('product',product);
        totalNumber += product.amount;
        subtotalPrice += product.price;

      }
      //thisCart.totalPrice = totalNumber > 0 ? subtotalPrice + deliveryFee : 0;
      thisCart.totalPrice = subtotalPrice + deliveryFee;
      thisCart.dom.deliveryFee.innerHTML = deliveryFee;
      thisCart.dom.subtotalPrice.innerHTML = subtotalPrice;
      thisCart.dom.totalPrice.forEach(element => element.innerHTML = thisCart.totalPrice); //subtotalPrice + deliveryFee;
      thisCart.dom.totalNumber.innerHTML = totalNumber;
      console.log(totalNumber);
      //thisCart.dom.orderTotal.innerHTML = thisCart.totalPrice;
      console.log('thisCart.dom.totalPrice', thisCart.dom.totalPrice);
    }
  }

  
  class CartProduct {
    constructor(menuProduct, element) {// menuProduct - referencja do obiektu podsumowania // element - referencja do utworzonego dla produktu elementu HTML
      // menuProduct - obiekt podsumowania; // element - html wygenerowany na podstawie danych z tego obiektu
      const thisCartProduct = this;
      thisCartProduct.element = element;
      thisCartProduct.id = menuProduct.id; 
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.params = menuProduct.params;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.amount = menuProduct.amount;
      thisCartProduct.priceSingle = menuProduct.priceSingle; 
      console.log('thisCartProduct.amount', thisCartProduct.amount);
      thisCartProduct.getElements(element); 
      thisCartProduct.initAmountWidget();
      thisCartProduct.initActions(); 
    }

    getElements(element) {// czyli selektory działają na elemencie poszczególnego produktu
      const thisCartProduct = this;
      thisCartProduct.dom = {}
      thisCartProduct.dom.wrapper = element; 
      thisCartProduct.dom.amountWidgetElem = element.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.dom.price = element.querySelector(select.cartProduct.price);
      thisCartProduct.dom.edit = element.querySelector(select.cartProduct.edit);
      thisCartProduct.dom.remove = element.querySelector(select.cartProduct.remove);
    
      console.log('element',element);
    }

    initAmountWidget() {
      const thisCartProduct = this;
      thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidgetElem); //tworzymy nową instancję amountWidget 
      thisCartProduct.dom.amountWidgetElem.addEventListener('updated', function () {
        console.log('thisCartProduct.amountWidget.value', thisCartProduct.amountWidget.value);
        //thisCartProduct.amount = thisCartProduct.amountWidget.value; // korzystamy z nowej instancji amountWidget
        thisCartProduct.price = thisCartProduct.amountWidget.value * thisCartProduct.priceSingle;
        thisCartProduct.amount = thisCartProduct.amountWidget.value; // odczytujemy sobie z instancji amountWidget którą utworzyliśmy wcześniej new AmountWidget(....)
        thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
      });
    }
    remove() {
      const thisCartProduct = this; 

      const event = new CustomEvent('remove', {
        bubbles: true, 
        detail: {
          cartProduct: thisCartProduct,
        },
      });
      thisCartProduct.dom.wrapper.dispatchEvent(event);
    }
    initActions() {
      const thisCartProduct = this;
      thisCartProduct.dom.edit.addEventListener('click', function (event) {
        event.preventDefault();
      });
      thisCartProduct.dom.remove.addEventListener('click', function (event) {
        event.preventDefault();
        thisCartProduct.remove();
      });
    }
  }
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
      console.log(thisWidget.value);

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

  const app = {
    initCart: function() {
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart); 
      thisApp.cart = new Cart(cartElem); // zapisujemy w app.cart instację klasy Cart, możemy teraz dostać się do jej metod z innych klas przez tą zapisaną instancję
    },
    initMenu: function() {
      const thisApp = this; 
      for(let productData in thisApp.data.products) {
        new Product(productData, thisApp.data.products[productData]); // 1. przekazujemy nazwę (np. cake) jako pierwszy argument
        // 2. przekazujemy cały obiekt thisApp.data.products[productData]
      }
    },
    initData: function() {
      const thisApp = this;
      //const data = dataSource;
      thisApp.data = dataSource;

      console.log('thisApp.data', thisApp.data);
    },
    init: function() {
      const thisApp = this;

      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);
      
      thisApp.initCart(); 
      thisApp.initData();
      thisApp.initMenu();
    },
  };
  app.init(); // metoda init uruchamiana jest na obiekcie app - app.init. Dltego zgodnie z zasadą implicit binding rule wskaże na obiekt app. 
}
