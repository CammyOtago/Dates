const readline = require('readline');

// month list
const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

// expressions for acceptable numbers and letters
const num = /^[0-9]+$/;
const str = /^[A-Za-z]+$/;

// function to determine leap year using 4 or 400 but not 100 rule
function isLeapYear(year) {
    return ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0);
}

/**
 * getDaysOfMonth function
 * @param date 
 * @returns upper bound of days for the month
 */
function getDaysOfMonth(date) {
    // get numeric value for month
    let month = months.indexOf(date.month) + 1;

    if (month == 2) { // check if month is february
        return isLeapYear(date.year) ? 29 : 28;
    } else if (month > 7) { // if month is past july, restart the numeric
        month -= 7;
    } 
    // classic test to find days of the month
    return month % 2 != 0 ? 31 : 30;
}

/**
 * validateDate function
 * @param date 
 * @checks for errors on date 
 */
function validateDate(date) {
    
    /**
     * Year Checks
     */

    // make sure year is a number
    if(!num.test(date.year)) date.setError(`Year '${date.year}' must be numeric.`)

    if (date.year.length != 4) { // only run this code if the year isnt 4 digits
        if (date.year.length == 2) { // convert to 4 digit year
            date.year = date.year < 50 ? '20' + date.year : '19' + date.year;
        } else date.setError(`Year '${date.year}' does not match acceptable format: yy or yyyy.`); // error if the length of year is invalid
    // check within bounds
    } else if (date.year < 1753 || date.year > 3000) date.setError(`Year '${date.year}' out of range > 1753 - 3000.`); 

    /**
     * Month Checks
     */

    // test if month uses only numbers
    if (num.test(date.month)) { 
        // check if date within bounds
        if (date.month > 12 || date.month < 1) {
            date.setError(`Month '${date.month}' out of range > 1-12.`)
        } else date.month = months[date.month-1]; // convert to 3 letter format   
    // test if month uses only letters
    } else if (str.test(date.month)) { 
        // convert to uppercase
        date.month = date.month.toUpperCase();
        // check if month is inside the months array
        if (!months.includes(date.month)) date.setError(`Month '${date.month}' does not match any existing months.`); 
    // error here if month mixes or has special characters
    } else date.setError(`Month '${date.month}' does not match acceptable format > mm, m, 0m or 3 letters.`);


    /**
     * Day Checks
     */

    // don't even check the day if month or year has an error (pointless)
    if (date.error) return;
    // make sure day is a number
    if(!num.test(date.day)) date.setError(`Day '${date.day}' must be numeric.`)
    // check if the day is within the bounds of the correct days of the month
    if (date.day > getDaysOfMonth(date) || date.day < 1) date.setError(`Day '${date.day}' out of range > ${date.month} 1-${getDaysOfMonth(date)} days.`);

    // finished checks!
}

/**
 * processLine function
 * @param line 
 * @logs the line converted to date
 */
function processLine(line) {
    // find out the dates seperator
    let seperator = line.includes('/') ? "/" : line.includes('-') ? "-" : line.includes(' ') ? ' ' : 'error';

    // catch seperator error
    if (seperator == 'error') { 
        console.log(`${line} - Invalid\nNo seperator found.`);
        return;
    } else {
        // split the date based on the seperator found
        let splitDate = line.split(seperator);
        
        // make sure only one seperator type is used
        if (splitDate.length != 3) {
            console.log(`${line} - Invalid\nDate is not seperated into 3 > day month year.`);
            return
        };

        // create date object
        const date = {
            day: splitDate[0],
            month: splitDate[1],
            year: splitDate[2],
            setError(msg) {     // sets an error msg for the date
                if (!this.error) this.error = ` - Invalid\n${msg}`;
            },
            toString() {    // only logs error if one exists
                return `${this.day} ${this.month} ${this.year} ${this.error ? `${this.error}` : ''}`;
            }
        };

        // go through date checks
        validateDate(date);

        /**
         * If date reaches this point with no errors added,
         * it will print out perfectly,
         * otherwise it will print out the first error it came across.
        */
       console.log(date.toString());
    }
}


/**
 * convertLinesToDates function
 * @param lines 
 */
function convertLinesToDates(lines) {
    console.log(`Checking ${lines.length} dates:`);

    // run through lines
    for (let i in lines) {
        let line = lines[i]
        processLine(line);
    }   
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
