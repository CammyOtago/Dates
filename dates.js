const readline = require('readline');

const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

// function to determine leap year using 4 or 400 but not 100 rule
function isLeapYear(year) {
    return ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0);
}

// function returns the days of month param
function getDaysOfMonth(date) {
    if(date.month == 2) {
        if(isLeapYear(date.year)) {
            return 29;
        } else return 28;
    } else if(date.month % 2 != 0) {
        return 31; 
    } else if(date.month % 2 == 0) {
        return 30;
    }
}

// function takes an array and converts each line from the array into a date object
function convertLinesToDates(lines) {
    console.log(`Checking ${lines.length} dates:`);

    // run through lines
    for (let i in lines) {
        let line = lines[i]
        // find out the dates seperator
        let seperator = line.includes('/') ? "/" : line.includes('-') ? "-" : line.includes(' ') ? ' ' : 'error';
        
        let splitDate = line.split(seperator);
        // make sure only one seperator type is used
        if (splitDate.length != 3) console.log('error here');

        // create date object
        const date = {
            day: splitDate[0],
            month: splitDate[1],
            year: splitDate[2],
            error: '',
            toString() {
                return `${this.day} ${this.month} ${this.year} ${this.error}`;
            }
        };

        // console.log(date.toString());
        validateDate(date);
    }    
}


function validateDate(date) {
    
    // year checks
    if (date.year.length != 4) { // only run this code if the year isnt 4 digits
        if (date.year.length == 2) { // convert to 4 digit year
            date.year = date.year < 50 ? '20' + date.year : '19' + date.year;
        } else console.log('error here'); // error if the length of year is invalid
    } else { 
        if (date.year < 1753 || date.year > 3000) console.log('error here'); // check within bounds
    }

    // month checks
    const num = /^[0-9]+$/;
    const str = /^[A-Za-z]+$/;

    if (num.test(date.month)) {

        if (date.month > 12 || date.month < 1) {
            console.log('error here');
        } else {
            date.month = months[date.month-1];
        }   

    } else if (str.test(date.month)) {

        date.month = date.month.toUpperCase();
        if (!months.includes(date.month)) console.log('error here'); 

    } else console.log('error here');


    // day checks

    console.log(date.toString());
}



/**
 * Function to read and process input from console
 */
function readFromConsole() {
    // create input stream interface
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    // initiate lines array
    let lines = [];

    // handle the line read from input stream
    rl.on('line', (line) => {
        // finish input stream with blank line
        if (line === '') {
            rl.close();
        } else {
            // add line to array
            lines.push(line);
        }
    });

    // finish input stream with EOF
    rl.on('close', () => {
        console.log('');

        // function to convert lines into dates
        convertLinesToDates(lines);

        // clear the input lines
        lines = [];
        // restart the readline interface
        console.log('');
        readFromConsole();
    });

    // exit program with SIGINT
    rl.on('SIGINT', () => {
        process.exit();
    });

    console.log('Enter a list of dates: ');
    // begin input stream
    rl.question();
}

readFromConsole();
