import { select } from "../settings.js";
import AmountWidget from "./AmountWidget.js";
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
    getData() {
      const thisCartProduct = this;
      const productSummary = {};
      productSummary.id = thisCartProduct.id;
      productSummary.name = thisCartProduct.name;
      productSummary.price = thisCartProduct.price;
      productSummary.priceSingle = thisCartProduct.priceSingle;
      productSummary.amount = thisCartProduct.amount;
      productSummary.params = thisCartProduct.params;

      return productSummary;
    }
  }

  export default CartProduct;