function myFunction(input) {
    // Define the regular expression to match the required format
    const regex = /^[A-Z][a-z]*|[a-z]+$/

    // Test if the input matches the regular expression
    if (regex.test(input)) {
        // Run the function if the input matches the required format
        console.log("Input is valid:", input)
    } else {
        console.log("Input is invalid:", input)
    }
}

myFunction("hello"); // valid
myFunction("Hello"); // valid
myFunction("HeLLo"); // invalid
myFunction("hELLO"); // invalid
myFunction("123");   // invalid
myFunction("aBcDeF"); // invalid
myFunction("hEl");