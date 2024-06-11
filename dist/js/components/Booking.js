import {select, templates, settings, classNames} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
    constructor(element) {
        const thisBooking = this;
        thisBooking.selected = undefined;
        thisBooking.render(element); 
        thisBooking.initWidgets();
        thisBooking.getData();  
    }

    getData() {
        const thisBooking = this; 

        const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
        const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

        const params = {
            booking: [
                startDateParam,
                endDateParam,
            ],
            eventsCurrent: [
                settings.db.notRepeatParam,
                startDateParam,
                endDateParam,
            ], 
            eventsRepeat: [
                settings.db.repeatParam,
                endDateParam,
            ],
        }

        const urls = {
            booking: settings.db.url + '/' + settings.db.bookings + '?' + params.booking.join('&'),
            eventsCurrent: settings.db.url + '/' + settings.db.events + '?' + params.eventsCurrent.join('&'),
            eventsRepeat: settings.db.url + '/' + settings.db.events + '?' + params.eventsRepeat.join('&'),
        };

        Promise.all([
            fetch(urls.booking),
            fetch(urls.eventsCurrent),
            fetch(urls.eventsRepeat),
        ]) .then(function(allResponses){
            const bookingsResponse = allResponses[0];
            const eventsCurrentResponse = allResponses[1];
            const eventsRepeatResponse = allResponses[2];
            return Promise.all([
                bookingsResponse.json(), 
                eventsCurrentResponse.json(),
                eventsRepeatResponse.json(),
            ]);
        })
        .then(function([bookings, eventsCurrent, eventsRepeat]){
            console.log(bookings);
            console.log(eventsCurrent);
            console.log(eventsRepeat);
            thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
        });
    }

    parseData(bookings, eventsCurrent, eventsRepeat) {
        const thisBooking = this; 

        thisBooking.booked = {};

        for(let item of bookings) {
            thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
        }

        for(let item of eventsCurrent) {
            thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
        }

        const minDate = thisBooking.datePicker.minDate;
        const maxDate = thisBooking.datePicker.maxDate; 

        for(let item of eventsRepeat) {
            if(item.repeat == 'daily') {
                for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)) {
                    console.log('item.data', item.date);
                    thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
                }
            }
        }
        thisBooking.updateDOM();
    }

    makeBooked(date, hour, duration, table) {
        const thisBooking = this; 

      
        const startHour = utils.hourToNumber(hour);
        if(typeof thisBooking.booked[date] == 'undefined') {
            thisBooking.booked[date] = {};
        }
        

        for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock+= 0.5) {
            if(typeof thisBooking.booked[date][hourBlock] == 'undefined') {
                thisBooking.booked[date][hourBlock] = [];
            }

            thisBooking.booked[date][hourBlock].push(table);
            console.log('loop', hourBlock);
        }
    }

    updateDOM() {
        const thisBooking = this; 
        thisBooking.date = thisBooking.datePicker.value;
        thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

        let allAvailable = false; 

        if(
            typeof thisBooking.booked[thisBooking.date] == 'undefined'
            ||
            typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
        ){
            allAvailable = true; 
        }

        for(let table of thisBooking.dom.tables){
            let tableId = parseInt(table.getAttribute(settings.booking.tableIdAttribute));
            if(!isNaN(tableId)){
                tableId = parseInt(tableId);
            }

            if(
                !allAvailable
                &&
                thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
            ){
                table.classList.add(classNames.booking.tableBooked);
            } else {
                table.classList.remove(classNames.booking.tableBooked);
            }
        }
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
        thisBooking.dom.tables = thisBooking.wrapper.querySelectorAll(select.booking.tables);
        thisBooking.dom.tablesWrapper = thisBooking.wrapper.querySelector(select.booking.all);
        console.log('generatedHTML from booking', generatedHTML);
    }

    initWidgets() {
        const thisBooking = this;

        thisBooking.peopleAmountWidget = new AmountWidget(thisBooking.dom.peopleAmount);
        thisBooking.hoursAmountWidget = new AmountWidget(thisBooking.dom.hoursAmount);
        thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
        thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
        thisBooking.dom.tablesWrapper.addEventListener('click', function(e) {thisBooking.initTables(e)});
        thisBooking.dom.peopleAmount.addEventListener('click', function() {
        })
        thisBooking.dom.hoursAmount.addEventListener('click', function() {
        });

        thisBooking.wrapper.addEventListener('updated', function() {
            thisBooking.resetSelectedTable();
            thisBooking.updateDOM();
        });

    }

    initTables(event) {
        const thisBooking = this;
        const tableId = event.target.getAttribute(settings.booking.tableIdAttribute);
        if(event.target.classList.contains('booked')) {
            alert(`Stolik numer ${tableId} jest zajęty!`);
            return;
        };
        if(!event.target.classList.contains('selected')){
            thisBooking.dom.tables.forEach(table => table.classList.remove('selected'));
            event.target.classList.add('selected');
            thisBooking.selected = event.target; // cały element stolika trafia do thisBooking.selected
        } else {
            thisBooking.resetSelectedTable();
        }

       
    }

    resetSelectedTable() {
        const thisBooking = this; 
        if(thisBooking.selected) {
            thisBooking.selected.classList.remove('selected');
            thisBooking.selected = undefined;
        }
    }
}

export default Booking; 