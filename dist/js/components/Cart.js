import {settings, select, classNames, templates} from '../settings.js';
import utils from '../utils.js';
import CartProduct from './CartProduct.js';
class Cart{
    constructor(element) {
      const thisCart = this; 
      thisCart.products = [];
      thisCart.getElements(element);
      thisCart.initActions();
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
      thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
      thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
      thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);
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
    }

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
      thisCart.dom.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisCart.sendOrder();
      });
    }
 
    sendOrder() {
      const thisCart = this;
      const url = settings.db.url + '/' + settings.db.orders;

      const payload = {
        address: thisCart.dom.address.value,
        phone: thisCart.dom.phone.value,
        totalPrice: thisCart.totalPrice,
        subtotalPrice: thisCart.subtotalPrice,
        totalNumber: thisCart.totalNumber,
        deliveryFee: thisCart.deliveryFee,
        products: [],
      };

      for(let prod of thisCart.products) {
        payload.products.push(prod.getData());
      }

      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      };
      fetch(url, options)
        .then(function(response){
          return response.json();
        }).then(function(parsedResponse){
          console.log('parsedResponse', parsedResponse);
        })
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
      thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
      thisCart.totalNumber = 0;
      thisCart.subtotalPrice = 0;
      console.log('update ruszyło');
      for(let product of thisCart.products) {
        console.log('product',product);
        thisCart.totalNumber += product.amount;
        thisCart.subtotalPrice += product.price;

      }
      //thisCart.totalPrice = totalNumber > 0 ? subtotalPrice + deliveryFee : 0;
      thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;
      thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFee;
      thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;
      thisCart.dom.totalPrice.forEach(element => element.innerHTML = thisCart.totalPrice); //subtotalPrice + deliveryFee;
      thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
      //console.log(totalNumber);
      //thisCart.dom.orderTotal.innerHTML = thisCart.totalPrice;
      console.log('thisCart.dom.totalPrice', thisCart.dom.totalPrice);
    }
  }

  export default Cart; 