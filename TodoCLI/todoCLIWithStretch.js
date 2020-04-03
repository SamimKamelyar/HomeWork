/*********************** 
Author: Samim Kamelyar
School: CodeCore 
Date: April 3,2020
Program: JavaScript
HomeWork3: Todo CLI
************************/


//Defining requirements
const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

//Declaring complete/incomplete action Characters
const actionComplete = '[✓]';
const actionIncomplete = '[ ]';

//Default populated Array of actions.  This get overwritten if a JSON file is provided in the stretch.
let viewArray = [
  [0, actionComplete, 'Take out the trash'],
  [1, actionComplete, 'Buy toothpaste'],
  [2, actionIncomplete, 'Buy Snickerdoodles'],
  [3, actionIncomplete, 'Fix the climate'],
  [4, actionIncomplete, 'Find a cure for aging']
];

//Index number of newest entry
let newIndexNumber = 0;

//Stretch #1 and 2

//Introduction output message
console.log(`Welcome to Todo CLI`);
console.log('-------------------');

// If .json input exists for process.argv, then proceed with stretch solution
if (process.argv[2] != null && process.argv[2].includes(".json")) {
  //define the filename string
  fileName = process.argv[2];
  //Clear viewArray if a json file is provided
  viewArray = [];

  //Read the input file
  fs.readFile(fileName, (err, data) => {
    //use JSON.parse to convert to useable data
    const fileContents = JSON.parse(data);

    //For loop to format Json file into array similar to above viewArray
    for (i = 0; i < fileContents.length; i++) {
      if (fileContents[i].completed == true) {
        viewArray.push([i, actionComplete, fileContents[i].title]);
      } else {
        viewArray.push([i, actionIncomplete, fileContents[i].title]);
      }
    }
    //Run the display menu function
    displayMenu();
  })

} else {
  //otherwise proceed with default solution without stretch and default array of actions.
  displayMenu();
}



//Define the display menu function
function displayMenu() {
  rl.question('(v) View • (n) New • (cX) Complete • (dX) Delete • (s) Save • (q) Quit\n', (command) => {
    command.toString();
    //Start with the termination condition "q" for recursion
    if (command == 'q') {
      rl.close();
      process.exit();
    }

    // View entry command "v"
    else if (command == 'v') {
      //initializing empty string
      let viewString = '';
      //For loop to format array into a string
      for (let i = 0; i < viewArray.length; i++) {

        //For loop to give spacing between each word
        for (let j = 0; j < viewArray[i].length; j++) {
          viewString += viewArray[i][j] + ' ';
        }
        //adding new line in each loop of "i"
        viewString += '\n';
      }
      console.log(viewString);
    }

    //Write the New Entry command "n"
    else if (command == 'n') {
      newIndexNumber = viewArray.length;
      rl.question('What would you like to add to the todo list?\n', (entry) => {
        viewArray.push([newIndexNumber, actionIncomplete, entry]);
        console.log(`Added New Entry`);
        return displayMenu();
      })

    }

    // Complete Command "cX"
    else if (command[0] == 'c') {
      //Using newIndexNumber to store the index number to target
      newIndexNumber = command.substr(1);

      //For loop to match newIndexNumber to an existing index number
      for (let i = 0; i < viewArray.length; i++) {
        if (viewArray[i][0] == newIndexNumber) {
          viewArray[i][1] = actionComplete;
          console.log(`Completed Item Number ${viewArray[i][0]}`);
          return displayMenu();
        }
      }
      console.log('Please Enter a valid index number shown in the first column');
    }
    // Delete Command "dX"
    else if (command[0] == 'd') {
      //Using newIndexNumber to store the index number to target
      newIndexNumber = command.substr(1);
      //For loop to match newIndexNumber to an existing index number
      for (let i = 0; i < viewArray.length; i++) {
        if (viewArray[i][0] == newIndexNumber) {
          console.log(`Deleted ${viewArray[i][2]}`);
          viewArray.splice(i, 1);
          return displayMenu();
        }
      }
      console.log('Please Enter a valid index number shown in the first column');
    }
    // save Command "s" STRETCH #2
    else if (command == 's') {

      //Creating a new Array to re-format and save
      let savedArray = [];

      for (i = 0; i < viewArray.length; i++) {
        if (viewArray[i][1] == actionComplete) {
          savedArray.push({
            completed: true,
            title: viewArray[i][2]
          })
        } else {
          savedArray.push({
            completed: false,
            title: viewArray[i][2]
          })
        }
      }

      let finalArray = JSON.stringify(savedArray)

      //Set filename if it exists
      if (fileName != null) {
        writeFileName = fileName;
      } else {
        writeFileName = "";
      }
      rl.question(`Where? (${writeFileName})\n`, (entry) => {
        if (entry == "") {
          entry = writeFileName;
        };
        fs.writeFile(entry, finalArray, err => console.log(`List saved to \"${entry}\"`));
        return displayMenu();
      });
    }
    //repeating the display the menu again.  
    if (command != 'n') {
      return displayMenu();
    }
  });
}