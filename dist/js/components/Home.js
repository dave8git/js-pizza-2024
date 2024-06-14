import { select } from '../settings.js';
import utils from '../utils.js';

class Home {
    constructor(data) {
        console.log('data', data);
        this.render(data);
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
        console.log('template', source);
        const template = Handlebars.compile(source);
        const generatedHTML = template(data);
        console.log('generatedHTML', generatedHTML);
        thisHome.generatedHome = utils.createDOMFromHTML(generatedHTML);
        const homeContainer = document.querySelector(select.containerOf.home);
        console.log('homeContainer', homeContainer);
        homeContainer.appendChild(thisHome.generatedHome);
    }
}

export default Home;