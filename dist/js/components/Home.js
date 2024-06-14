import { select } from '../settings.js';
import utils from '../utils.js';

class Home {
    constructor(data) {
        const thisHome = this;
        console.log('data', data);
        thisHome.render(data);
        thisHome.initFLKCTY();
    }

    render(data) {
        console.log('data', data);
        // const data1 = {
        //     "home": [
        //         {
        //             "title": "Beautiful Sunset",
        //             "description": "A breathtaking view of the sunset over the mountains.",
        //             "imageUrl": "https://example.com/sunset.jpg"
        //         },
        //         {
        //             "title": "City Skyline",
        //             "description": "The city skyline illuminated at night.",
        //             "imageUrl": "https://example.com/city.jpg"
        //         },
        //         {
        //             "title": "Forest Path",
        //             "description": "A serene path through a lush forest.",
        //             "imageUrl": "https://example.com/forest.jpg"
        //         }
        //     ]
        // }
        const thisHome = this; 
        console.log('data from render', data);
        const source = document.querySelector(select.templateOf.home).innerHTML;
        console.log('document.querySelector(select.templateOf.home).innerHTML', document.querySelector(select.templateOf.home).innerHTML);
        console.log('template', source);
        const template = Handlebars.compile(source);
        const generatedHTML = template(data);
        console.log('generatedHTML', generatedHTML);
        thisHome.generatedHome = utils.createDOMFromHTML(generatedHTML);
        console.log('thisHome.generatedHome', thisHome.generatedHome);
        const homeContainer = document.querySelector(select.containerOf.home);
        console.log('homeContainer', homeContainer);
        homeContainer.appendChild(thisHome.generatedHome);
        thisHome.initFLKCTY();
    }

    initFLKCTY() {
        console.log('flickity polecialo!');
        // document.addEventListener('DOMContentLoaded', function () {
        //     var elem = document.querySelector('.carousel-wrapper');
        //     console.log('elem', elem);
        //     var flkty = new Flickity(elem, {
        //       // options
        //     //   cellAlign: 'left',
        //     //   contain: true,

        //     });
        //   });
        var elem = document.querySelector('.carousel-wrapper');
        console.log('elem', elem);
        if (elem) {
            var flkty = new Flickity(elem, {
                // options
                cellAlign: 'left',   // Align cells to the left
                contain: true,       // Contain cells within the carousel
                freeScroll: false,   // Disable free scrolling
                wrapAround: true,    // Enable infinite scrolling
                autoPlay: true,      // Auto-play the carousel
                prevNextButtons: true, // Display previous and next buttons
                pageDots: true       // Display page dots
            });
        } else {
            console.error('Carousel wrapper element not found!');
        }
    }
}

export default Home;