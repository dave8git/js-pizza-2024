import { select, templates } from '../settings.js';
import utils from '../utils.js';

Handlebars.registerHelper('log', function(context) {
    console.log('Handlebars log:', context);
    return context;
});

class Home {
    constructor(data) {
        console.log('data', data);
        this.render(data);
    }

    render(data) {
        console.log('data from render', data);
        const source = document.querySelector(select.templateOf.home).innerHTML;
        console.log('template', source);
        const template = Handlebars.compile(source);
        console.log('data from render', template);
        const generatedHTML = template(data);
        console.log('generatedHTML', generatedHTML);
        this.generatedHome = utils.createDOMFromHTML(generatedHTML);
        const homeContainer = document.querySelector(select.containerOf.home);
        //homeContainer.appendChild(this.generatedHome);
    }
}

export default Home;