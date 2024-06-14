import {settings, select, classNames, templates} from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js'; // tylko domyślnie exportowany element, klasa, obiekt, może być importowany bez zastosowania nawiasów klamrowych. 
import Booking from './components/Booking.js';
import Home from './components/Home.js';
const app = {
    initPages: function() {
      const thisApp = this; 

      thisApp.pages = document.querySelector(select.containerOf.pages).children;

      thisApp.navLinks = document.querySelectorAll(select.nav.links);

      let pageMatchingHash =  thisApp.pages[0].id; 
      const idFromHash = window.location.hash;
      console.log(pageMatchingHash);
      for(let page of thisApp.pages) {
        if(page.id == idFromHash) {
          pageMatchingHash = page.id;
          break; 
        }
      }

      thisApp.activatePage(thisApp.pages[0].id);

      for(let link of thisApp.navLinks) {
        link.addEventListener('click', function(event) {
          const clickedElement = this; 
          event.preventDefault();
          /* get page id from href attribute */
          const id = clickedElement.getAttribute('href').replace('#', '');
          /* run thisApp.activatePage with that id */
          thisApp.activatePage(id);
          /* channge URL hash */
          window.location.hash = '#/' + id;
        })
      }
    },

    activatePage: function(pageId) {
      const thisApp = this;
      /* add class "active to matching pages, remove non-maching */
      for(let page of thisApp.pages) {
        page.classList.toggle(classNames.pages.active, page.id == pageId);
        // if(page.id == pageId) {
        //   page.classList.add(classNames.pages.active);
        // } else {
        //   page.classList.remove(classNames.pages.active);
        // }
      }
      /* add class "active" to matching links, remove from non-matching */
      for(let link of thisApp.navLinks) {
        link.classList.toggle(classNames.nav.active, link.getAttribute('href') == '#/' + pageId);
      }
    },

    initCart: function() {
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart); 
      thisApp.cart = new Cart(cartElem); // zapisujemy w app.cart instację klasy Cart, możemy teraz dostać się do jej metod z innych klas przez tą zapisaną instancję

      thisApp.productList = document.querySelector(select.containerOf.menu);

      thisApp.productList.addEventListener('add-to-cart', function(event) { 
        app.cart.add(event.detail.product);
      })
    },
    initMenu: function() {
      const thisApp = this; 
      for(let productData in thisApp.data.products) {
        new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
        //new Product(productData, thisApp.data.products[productData]); // 1. przekazujemy nazwę (np. cake) jako pierwszy argument
        // 2. przekazujemy cały obiekt thisApp.data.products[productData]
        console.log('thisApp.data.products[productData]', thisApp.data.products[productData]);
      }
    },
    initData: function() {
      const thisApp = this;
      //const data = dataSource;
      thisApp.data = {};
      const url = settings.db.url + '/' + settings.db.products;
      const home = settings.db.url + '/' + settings.db.home;

      fetch(home)
        .then(function(rawResponse) {
          return rawResponse.json();
        })
        .then(function(parsedResponse) {
          thisApp.data.home = parsedResponse; /* save parsedResponse as thisApp.data.products */
          thisApp.initHome(thisApp.data.home);
        });

      fetch(url)
        .then(function(rawResponse) {
          return rawResponse.json();
        })
        .then(function(parsedResponse) {

          thisApp.data.products = parsedResponse; /* save parsedResponse as thisApp.data.products */
          //thisApp.home = thisApp.data["home"];
          
          thisApp.initMenu();/* execute initMenu method */
        });

    },
    initBooking: function() {
      // thisApp = this;

      const bookingContainer = document.querySelector(select.containerOf.booking);
      const booking = new Booking(bookingContainer);
      console.log(booking);
    },

    initHome: function() {
      const thisApp = this;
      //console.log('thisApp.home', thisApp.data.home);
      //new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
      console.log('thisApp.data.home from app.js', thisApp.data.home);
      thisApp.home = new Home(thisApp.data.home);
      
    },
    init: function() {
      const thisApp = this;

      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);
    
      thisApp.initPages(); 
      thisApp.initCart(); 
      thisApp.initData();
      thisApp.initMenu();
      thisApp.initBooking();
    },
  };
  app.init(); // metoda init uruchamiana jest na obiekcie app - app.init. Dltego zgodnie z zasadą implicit binding rule wskaże na obiekt app. 

