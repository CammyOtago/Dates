const readline = require('readline');
const fs = require('fs');

// valid years
const max_year = 3000;
const min_year = 1753;

// month list
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// expressions for acceptable numbers and letters
const num = /^[0-9]+$/;
/**
 * This regex also checks if the first char is uppercase while the rest is lowercase
 * or if it is all lowercase/uppercase
 */
const str = /^(?:[A-Z][a-z]*|[a-z]+|[A-Z]+)$/;

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
        } else date.setError(`Year '${date.year}' does not match acceptable format => yy or yyyy.`); // error if the length of year is invalid
    // check within bounds
    } else if (date.year < min_year || date.year > max_year) date.setError(`Year '${date.year}' out of range => ${min_year} - ${max_year}.`); 

    /**
     * Month Checks
     */

    // test if month uses only numbers
    if (num.test(date.month)) { 
        // check if date within bounds
        if (date.month > 12 || date.month < 1) {
            date.setError(`Month '${date.month}' out of range => 1-12.`)
        } else date.month = months[date.month-1]; // convert to 3 letter format   
    // test if month uses only letters
    } else if (str.test(date.month)) { 
        // ensures the first letter is upper case and the remaining are lowercase
        date.month = date.month[0].toUpperCase() + date.month.toLowerCase().slice(1);
        // check if month is inside the months array
        if (!months.includes(date.month)) date.setError(`Month '${date.month}' does not match any existing months.`); 
    // error here if month mixes or has special characters
    } else date.setError(`Month '${date.month}' does not match acceptable format => mm, m, 0m or 3 letters (case sensitive).`);


    /**
     * Day Checks
     */

    // add 0 if day doesnt have one
    if (date.day.length < 2) date.day = 0 + date.day;
    // don't even check the day for errors if month or year has an error (pointless)
    if (date.error) return;
    // make sure day is a number
    if(!num.test(date.day)) date.setError(`Day '${date.day}' must be numeric.`);
    // check if the day is within the bounds of the correct days of the month
    if (date.day > getDaysOfMonth(date) || date.day < 1) date.setError(`Day '${date.day}' out of range => ${date.month} 1-${getDaysOfMonth(date)} days.`);

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
        console.log(`${line} - INVALID`);
        console.error('No seperator found.');
        return;
    } else {
        // split the date based on the seperator found
        let splitDate = line.split(seperator);
        
        // make sure only one seperator type is used
        if (splitDate.length != 3) {
            console.log(`${line} - INVALID`);
            console.error('Date is not seperated into 3 => day month year.')
            return
        };

        // create date object
        const date = {
            day: splitDate[0],
            month: splitDate[1],
            year: splitDate[2],
            setError(msg) {     // sets an error msg for the date
                if (!this.error) this.error = msg;
            },
            toString() {    // only logs error if one exists
                return `${this.day} ${this.month} ${this.year}`;
            }
        };

        // go through date checks
        validateDate(date);

        /**
         * If date reaches this point with no errors added,
         * it will print out perfectly,
         * otherwise it will print invalid and the std error will show.
        */
       if (date.error) {
        console.log(`${line} - INVALID`);
        console.error(date.error);
       } else {
        console.log(date.toString());
       }
    }
}


/**
 * convertLinesToDates function
 * @param lines 
 * outer function to safely run through input lines
 */
function convertLinesToDates(lines) {
    // console.error(`Checking ${lines.length} dates:`);

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
        // line === '' ? rl.close() : lines.push(line);
        lines.push(line);
    });

    // finish input stream with EOF
    rl.on('close', () => {
        // function to convert lines into dates
        convertLinesToDates(lines);

        // clear the input lines
        lines = [];
        // restart the readline interface
        readFromConsole();
    });

    // exit program with SIGINT
    rl.on('SIGINT', () => {
        process.exit();
    });

    // console.error('Enter a list of dates: ');
    // begin input stream
    rl.question();
}

/**
 * Function to read and process input from a file
 */
function readFromFile(fileName) {
    // initiate lines array
    const lines = [];

    // readStream object
    const read = fs.createReadStream(fileName, {encoding: 'utf-8'});

    read.on('data', (input) => {
        // split up lines
        const allLines = input.split('\r\n');

        // quick check to remove empty line at the end
        if(allLines[allLines.length-1] === '') allLines.pop();

        // push lines into array
        lines.push(...allLines);
    });

    read.on('end', () => {
        // convert lines to dates
        convertLinesToDates(lines);
    });

    // catch file errors
    read.on('error', (e) => {
        console.error(e);
    });
}

/**
 * MAIN SCRIPT
 */

// get filename from CLI
const fileName = process.argv[2];

if (fileName == null) {
    readFromConsole();
} else {
    readFromFile(fileName);
}
