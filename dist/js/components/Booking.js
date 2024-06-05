import {select, classNames, templates} from '../settings.js';
import AmountWidget from './AmountWidget.js';

class Booking {
    constructor(element) {
        const thisBooking = this;
        thisBooking.render(element); 
        thisBooking.initWidgets();
    }

    render(element) {
        const thisBooking = this;
        const generatedHTML = templates.bookingWidget();
        thisBooking.dom = {};
        thisBooking.wrapper = element;
        thisBooking.wrapper.innerHTML = generatedHTML;
        thisBooking.dom.peopleAmount = thisBooking.wrapper.querySelector(select.booking.peopleAmount);
        thisBooking.dom.hoursAmount = thisBooking.wrapper.querySelector(select.booking.hoursAmount);
        console.log('generatedHTML from booking', generatedHTML);
    }

    initWidgets() {
        const thisBooking = this;

        thisBooking.peopleAmountWidget = new AmountWidget(thisBooking.dom.peopleAmount);
        thisBooking.hoursAmountWidget = new AmountWidget(thisBooking.dom.hoursAmount);

        thisBooking.dom.peopleAmount.addEventListener('click', function() {
            control.log('pople amount changed');
        })
        thisBooking.dom.hoursAmount.addEventListener('click', function() {
            control.log('hours amount changed');
        });
    }
}

export default Booking; 