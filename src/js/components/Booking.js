import {select, templates} from '../settings.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

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
        thisBooking.dom.datePicker = thisBooking.wrapper.querySelector(select.widgets.datePicker.wrapper);
        thisBooking.dom.hourPicker = thisBooking.wrapper.querySelector(select.widgets.hourPicker.wrapper);
        console.log('generatedHTML from booking', generatedHTML);
    }

    initWidgets() {
        const thisBooking = this;

        thisBooking.peopleAmountWidget = new AmountWidget(thisBooking.dom.peopleAmount);
        thisBooking.hoursAmountWidget = new AmountWidget(thisBooking.dom.hoursAmount);
        thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
        thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

        thisBooking.dom.peopleAmount.addEventListener('click', function() {
        })
        thisBooking.dom.hoursAmount.addEventListener('click', function() {
        });
        
    }
}

export default Booking; 