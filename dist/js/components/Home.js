import { select } from '../settings.js';
import utils from '../utils.js';
//import Flickity from 'flickity';

class Home {
    constructor(data) {
        const thisHome = this;
        console.log('data', data);
        thisHome.render(data);
        thisHome.initFLKCTY();
    }

    render(data) {
        console.log('data', data);
        const thisHome = this; 
        const source = document.querySelector(select.templateOf.home).innerHTML;
        const template = Handlebars.compile(source);
        const generatedHTML = template(data);
        thisHome.generatedHome = utils.createDOMFromHTML(generatedHTML);
        const homeContainer = document.querySelector(select.containerOf.home);
        homeContainer.appendChild(thisHome.generatedHome);
        thisHome.initFLKCTY();
    }

    initFLKCTY() {
        const thisHome = this;
        var elem = document.querySelector('.carousel-wrapper');
        console.log('elem', elem);
        if (elem) {
            thisHome.flkty = new Flickity(elem, {
                // options
                cellAlign: 'left',   // Align cells to the left
                contain: true,       // Contain cells within the carousel
                freeScroll: false,   // Disable free scrolling
                wrapAround: true,    // Enable infinite scrolling
                autoPlay: true,      // Auto-play the carousel
                prevNextButtons: true, // Display previous and next buttons
                pageDots: true       // Display page dots
            });
           // console.log(flkty);
        } else {
            console.error('Carousel wrapper element not found!');
        }
    }
}

export default Home;