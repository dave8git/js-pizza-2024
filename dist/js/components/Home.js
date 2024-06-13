import { select, templates } from '../settings.js';
import utils from '../utils.js';

class Home {
    constructor(data) {
        this.render(data);
    }

    render(data) {
        const template = document.querySelector(select.templateOf.home).innerHTML;
        const compile = Handlebars.compile(template);
        const generatedHTML = compile(data);
        console.log('generatedHTML', generatedHTML);
        this.generatedHome = utils.createDOMFromHTML(generatedHTML);
        const homeContainer = document.querySelector(select.containerOf.home);
        //homeContainer.appendChild(this.generatedHome);
    }
}

export default Home;