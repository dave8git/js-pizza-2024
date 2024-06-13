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
            // console.log(bookings);
            // console.log(eventsCurrent);
            // console.log(eventsRepeat);
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
                    //console.log('item.data', item.date);
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
            //console.log('loop', hourBlock);
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
        thisBooking.dom.form = thisBooking.wrapper.querySelector(select.booking.submit);
        thisBooking.dom.phone = thisBooking.wrapper.querySelector(select.booking.phone);
        thisBooking.dom.address = thisBooking.wrapper.querySelector(select.booking.address);
        thisBooking.dom.starters = thisBooking.wrapper.querySelectorAll(select.booking.starters);
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

        thisBooking.dom.form.addEventListener('submit', function(event){
            event.preventDefault();
            thisBooking.sendBooking();
        });

    }

    initTables(event) {
        const thisBooking = this;
        thisBooking.tableId = event.target.getAttribute(settings.booking.tableIdAttribute);
        if(event.target.classList.contains('booked')) {
            alert(`Stolik numer ${thisBooking.tableId} jest zajęty!`);
            return;
        }
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
    sendBooking() {
        const thisBooking = this; 
  
        const url = settings.db.url + '/' + settings.db.bookings;
        // const ppl = parseInt(thisBooking.dom.peopleAmount.querySelector('input').value);
        // const duration = parseInt(thisBooking.dom.hoursAmount.querySelector('input').value);
        // console.log('thisBooking.dom.hoursAmount.input', thisBooking.dom.hoursAmount.input);
        const starters = [];


        const payload = {
            date: thisBooking.datePicker.correctValue,
            hour: thisBooking.hourPicker.correctValue,
            table: parseInt(thisBooking.tableId) || null,
            duration: thisBooking.hoursAmountWidget.value,
            ppl: thisBooking.peopleAmountWidget.value,
            starters: starters,
            phone: thisBooking.dom.phone,
            address: thisBooking.dom.address,
        }

        for(let starter of thisBooking.dom.starters) {
            if(starter.checked) {
                starters.push(starter.value);
            }
        }

        const options = {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          };
          fetch(url, options)
            .then(function(response){
              return response.json();
            }).then(function(parsedResponse){
                thisBooking.makeBooked(payload.date, payload.hour, payload.duration, payload.table);
                thisBooking.updateDOM();
                thisBooking.resetSelectedTable();
                console.log(parsedResponse);
            })

    }
    
    

}

export default Booking; 