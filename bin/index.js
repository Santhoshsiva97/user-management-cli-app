#!/usr/bin/env node

import { LowSync } from 'lowdb'
import { JSONFileSync } from 'lowdb/node'
import { v4 as uuidv4 } from 'uuid';
import boxen from 'boxen';
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import _ from 'lodash';
import { Chalk } from "chalk";


const chalk = new Chalk();
const args = yargs(process.argv.slice(2)).argv;
const command = process.argv[2];

// Usage text for help
const usage = function() {
  const usageText = `
  ${(chalk.underline.bgBlue.bold('User management CLI app - Mainatains the user details & addresses locally'))}
  ${chalk.cyan(`
  usage:
    person <command>

    Commands:-

    add            used to create a user
    edit           used to retrieve and edit user
    delete         used to delete/remove the user
    view           used to display all the user
    view --id      used to display the user and their addresses
    search         used to search the user

    Options:-
    --firstname, --firstname Enter the firstname       [String][Required]
    --lastname,  --lastname  Enter the lastname        [String][Required]
    --dob,       --dob       Enter the Date of Birth   [Required]
    --nickname,  --nickname  Enter the nickname        [Optional]
    --help,      --help      Show help                 [Boolean]
    --version,   --version   Show version              [Boolean]
    `)}
  `
  console.log(usageText)
}

// Yargs for parsing the commands and arguments
yargs(hideBin(process.argv))
  .usage('$0 <port>', 'Start the CLI App server...', () => usage())
  .command('add', 'Add User')
  .options('firstname', { alias: 'firstname', describe: 'enter firstname of user', type: 'string' })
  .options('lastname', { alias: 'lastname', describe: 'enter lastname of user', type: 'string' })
  .options('dob', { alias: 'dob', describe: 'enter dob of user', type: 'string' })
  .options('nickname', { alias: 'nickname', describe: 'enter nickname of user', type: 'string' })
  .command('edit', 'Edit User')
  .options('id', { alias: 'id', describe: 'Enter the user id to edit', type: 'number' })
  .command('delete', 'Delete user')
  .options('id', { alias: 'id', describe: 'Enter the user id to delete', type: 'number' })
  .command('view', 'View users')
  .options('id', { alias: 'id', describe: 'enter the user id to view', type: 'number' })
  .command('search', 'Search Users')
  .demandCommand(1)
  .argv;


// Chaining the lowdb with Lodash in Synchronous way
class LowSyncWithLodash extends LowSync {
  chain = _.chain(this).get("data") 
}
const adapter = new JSONFileSync('./bin/db.json')
const db = new LowSyncWithLodash(adapter)
db.read(); // To read the DB file
db.data ||= { persons: [] }; // To set initial value

// log errors to the console in red color
function errorLog(title, error) {
  const eLog = chalk.red(`${title} ${error}`)
  console.error(eLog)
  console.log(chalk.red('Error details ==>'), error)
}

// log warning to the console in yellowBright color
function warnLog(title, warn) {
  const wLog = chalk.yellowBright(`${title} ${warn}`)
  console.log(wLog)
}

// log success to the console in green color
function successLog(msg) {
  const sLog = chalk.green(`${msg}`)
  console.log(sLog)
}

// All user list from db.json
const usersList = JSON.parse(JSON.stringify(db.chain.get('persons')))

// Add method - Add the user details to ./db.json file
const addUser = () => {
  try {
    // Validation added: Firstname, Lastname & dob is required. Firstname & Lastname should not contian numbers
    if(!args.firstname || !args.lastname || !args.dob) throw new Error('Firstname, Lastname & dob is required fields');
    const validateConstriants = (args.firstname.trim() && args.lastname.trim() && args.dob.trim() && !_.isNumber(args.firstname) && !_.isNumber(args.lastname)); 
    // Check if duplicate exists
    if (validateConstriants) {
      const user = usersList.filter(item => item.firstName.toLowerCase() === args.firstname.toLowerCase() && item.lastName.toLowerCase() === args.lastname.toLowerCase())
      const isDuplicate = (user.length > 0) ? true : false;

      // Validate the field dataTypes constriants and check if duplicate exists
      if(!isDuplicate) {
        db.data.persons.push({ 
          id: uuidv4(), // Auto generate unique UUID. Example: "eda8f201-23f1-4243-87e0-e2de733e5e48"
          firstName: args.firstname,
          lastName: args.lastname,
          dob: args.dob,
          nickName: !(_.isNumber(args.nickname)) ? args.nickname : '', // Validating Nickname constriant
        })
        // Warning info
        args.nickname && (_.isNumber(args.nickname)) ? warnLog('Warning:', 'Nick Name cannot contain numbers') : '';
      } else {
        throw new Error("Duplication error - Please Check the constriants");
      }
      db.write();
      successLog('User added successfully!');
    } else {
      throw new Error('Validation error - check field constriants')
    }
  } catch(error) {
    errorLog('Error: Adding user ==>', error);
  }
}

// Edit method - Will edit all the fields in the person structure
const editUser = () => {
  try {
    if(!args.id) throw new Error('User id is not entered');
    // Finding the user to edit
    const user = usersList.length > 0 ? usersList.filter(item => item.id == args.id) : [];
    if(user.length == 0) throw new Error('User is not available');
    const firstName = args.firstname && args.firstname.trim() || user.firstName;
    const lastName = args.lastname && args.lastname.trim() || user.lastName;
    const dob = args.dob && args.dob.trim() || user.dob;
    // Check if user exists
    const isUserAvailable = usersList.filter(item => item.firstName.toLowerCase() === firstName.toLowerCase() && item.lastName.toLowerCase() === lastName.toLowerCase())
    const isDuplicate = (isUserAvailable.length > 0) ? true : false;
    // First name & last name is required & should not contain numbers
    const validateTypes = (firstName && lastName && dob && !_.isNumber(firstName) && !_.isNumber(lastName))
    
    // Validate the duplicate user by firstname & lastname also validate dataType constraints
    if(!isDuplicate && validateTypes) {
      JSON.parse(JSON.stringify(db.chain.get('persons').find({ id: args.id }).assign(
        { firstName: args.firstname || user.firstName && user.firstName },
        { lastName: args.lastname || user.lastName && user.lastName },
        { dob: args.dob || user.dob && user.dob },
        { nickName: args.nickname || user.nickName && user.nickName },
      )));
      db.write();
    successLog('User updated successfully!')
    } else {
      throw new Error('Validation Error - Please check params and the constraints')
    }
  } catch(error) {
    errorLog('Error: Editing the user ==>', error);
  }
}

// Delete method - Based on the Id entered the user will be deleted
const deleteUser = () => {
  try {
    const user = JSON.parse(JSON.stringify(db.chain.get('persons').remove({ id: args.id })));
    db.write();
    (user.length > 0) ? console.log(chalk.green('Successfully deleted the user!')) : errorLog('Error:', 'User does not exists');
  } catch(error) {
    errorLog('Error: Deleting the user ==>', error);
  }
}

// Retrieve the user details and all the addresses related to the user
const getUser = () => {
  try {
    if(usersList.length > 0) {
      // Finding the user
      const userArr = usersList.length > 0 ? usersList.filter(item => item.id == args.id) : [];
      if(userArr.length == 0) throw new Error('User is not available');
      const user = userArr[0];
      // Configured the Address DB
      const adapter = new JSONFileSync('./bin/db-addresses.json')
      const addressDB = new LowSyncWithLodash(adapter)
      addressDB.read(); 
      addressDB.data ||= { addresses: [] };

      const addresses = JSON.parse(JSON.stringify(addressDB.chain.get('addresses')))
      const userAddress = addresses.filter(item => (item.personId == args.id))
      
      const userColored = chalk.blue(`First Name: ${user.firstName}\nLast Name: ${user.lastName}\nD.O.B: ${user.dob}\nNick Name: ${user.nickName || ''}`);
      console.log(boxen(userColored, { title: 'User details',  textAlignment: "left", titleAlignment: "center", borderStyle: "round" }))
  
      userAddress.map((address, index) => {
        const addressColored = chalk.blue(`Line 1: ${address.line1}\nLine 2: ${address.line2 || ''}\nCountry: ${address.country || ''}\nPost Code: ${address.postcode || ''}`);
        console.log(boxen(addressColored, { title: `Address ${index+1}`,  textAlignment: "left", titleAlignment: "center", borderStyle: "round" }))
      })
    } else {
      throw new Error('Users not yet added');
    }
  } catch(error) {
    errorLog('Error: Viewing the user', error);
  }
}

// To retreive all the user from the db.json
const getUsersList = () => {
  try {
    if(usersList.length > 0) {
      usersList.map((user, index) => {
        const userColored =  chalk.blue(`First Name: ${user.firstName}\nLast Name: ${user.lastName}\nD.O.B: ${user.dob}\nNick Name: ${user.nickName || ''}`)
        console.log(boxen(userColored, { title: `${index+1}. User details`,  textAlignment: "left", titleAlignment: "center", borderStyle: "round" }))
      });
    } else {
      throw new Error('No Users to view/Users not yet added')
    }
  } catch(error) {
    errorLog('Error:', error);
  }

}

// Search the user based on the firstName and lastName irrespective of Case Sensitive
const searchUser = () => {
  try {
    if(usersList.length > 0 && args._[1]) {
      const user = _.find(usersList, (person) => {
        if(person.firstName.toLowerCase() == args._[1].toLowerCase() || person.lastName.toLowerCase() == args._[1].toLowerCase()) return person;
      })
      if(!user) throw new Error('User does not exists')
      const userColored = chalk.blue(`First Name: ${user.firstName}\nLast Name: ${user.lastName}\nD.O.B: ${user.dob}\nNick Name: ${user.nickName}`);
      user ? console.log(boxen(userColored, { title: 'Search Results',  textAlignment: "left", titleAlignment: "center", borderStyle: "round" }))
        : warnLog('Warning:', `No user with the name "${args._[1]}"`)
    } else {
      throw new Error(`${0} Users to search/Users not yet added`)
    }
  } catch(error) {
    errorLog('Error: Searching the user ==>', error);
  }
}

// Access the commands and switching between methods
switch(command) {
  case 'view':
    args.id ? getUser() : getUsersList(); // View User and View all user method
    break
  case 'add':
    addUser();
    break
  case 'edit':
    editUser();
    break;
  case 'delete':
    deleteUser();
    break;
  case 'search':
    searchUser();
    break;
  default:
    errorLog('Error:', 'Invalid command passed');
    // usage()
}
