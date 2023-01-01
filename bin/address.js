#!/usr/bin/env node

import { LowSync } from 'lowdb';
import { JSONFileSync } from 'lowdb/node';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import _ from 'lodash';
import { Chalk } from "chalk";


const chalk = new Chalk();
const args = yargs(process.argv.slice(2)).argv;
const command = process.argv[2];



yargs(hideBin(process.argv))
  // .usage('add', '-a')
  .command('add', 'enter the address')
  .options('personId', { alias: 'personId', describe: 'enter person Id', type: 'number' })
  .options('line1', { alias: 'line1', describe: 'enter the line1 of address', type: 'string' })
  .options('line2', { alias: 'line2', describe: 'enter the line2 of address', type: 'string' })
  .options('country', { alias: 'country', describe: 'enter the country of user', type: 'string' })
  .options('postcode', { alias: 'postcode', describe: 'enter the postcode of user', type: 'string' })
  .command('edit', 'edit the address')
  .options('id', { alias: 'id', describe: 'Enter the address id to edit', type: 'number' })
  .command('delete', 'delete the address')
  .options('id', { alias: 'id', describe: 'Enter the address id to delete', type: 'number' })
  .demandCommand(1)
  .argv;


// Chaining the lowdb with Lodash in Synchronous way
class LowSyncWithLodash extends LowSync {
  chain = _.chain(this).get("data") 
}
const adapter = new JSONFileSync('./bin/db-addresses.json')
const db = new LowSyncWithLodash(adapter)
db.read(); // To read the DB
db.data ||= { addresses: [] }; // To set initial value

// log errors to the console in red color
function errorLog(title, error) {
  const eLog = chalk.red(`${title} ${error}`)
  console.error(eLog)
  console.log(chalk.red('Error details ==>'), error)
}

// log warning to the console in yellowBright color
function warnLog(title, warn) {
  const wLog = chalk.yellowBright(`${title} ${warn}`)
  console.error(wLog)
  console.log(chalk.yellowBright('Warning details ==>'), warn)
}

// Below method Handle the country list REST API
const handleCountryList = async (country) => {
  let isCountryExistInEurope = [];
  if(country) {
    await axios.get('https://restcountries.com/v3.1/region/europe')
    .then((res) => {
      const rawData = res.data;
      isCountryExistInEurope = rawData.filter(item => item.name.common.toLowerCase() == country.toLowerCase())
      if(isCountryExistInEurope.length == 0) warnLog('Warning:', 'Country is not valid in Europe');
    })
    .catch((err) => {
      errorLog('Error: Getting country list ==>', err)
    })
  }
  return isCountryExistInEurope;
}

// All Address from the db-addresses.json file
const usersAddressesList = JSON.parse(JSON.stringify(db.chain.get('addresses')));

// Add Method Async - To add the address to the DB
const addAddress = async () => {
  try {
    // PersonId and Line1 is required to proceed further
    if(args.personId && args.line1) {
      // Check if any duplicate exists irrespective of case sensitive
      const isDuplicate = usersAddressesList.filter(item => (item.personId === args.personId && item.line1 == args.line1 && item.line2.toLowerCase() == (args.line2 && args.line2.toLowerCase())
        && item.country.toLowerCase() == (args.country && args.country.toLowerCase()) && item.postcode == args.postcode))
      // If No duplicate -> below condition will be true
      if(isDuplicate.length == 0) {
        // European Country list from from REST API
        const isCountryExistInEurope = args.country ? await handleCountryList(args.country) : [];
        // Regex to avoid special symbols/character in postcode
        var postcodeFormat = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
        const postCode = (args.postcode && !postcodeFormat.test(args.postcode)) ? args.postcode : '';
        console.log('isCountryExistInEurope:::::params', isCountryExistInEurope)
        db.data.addresses
        .push({
          id: uuidv4(), // Auto generate the UUID. Ex: "eda8f201-23f1-4243-87e0-e2de733e5e48"
          personId: args.personId,
          line1: args.line1,
          line2: (args.line2 && !_.isNumber(args.line2)) ? args.line2 : '', // Line 2 cannot contain numbers
          country: (isCountryExistInEurope.length > 0) ? args.country : '', // Must be valid country in Europe
          postcode: postCode, // Postcode cannot contains special symbols/character
        });
        db.write();
        // Warning methods
        !(args.line2 && !_.isNumber(args.line2)) ? warnLog('Warning:', 'Line 2 cannot contain numbers') : '';
        (isCountryExistInEurope.length == 0) ? warnLog('Warning:', 'Must be valid country in Europe') : '';
        !postCode ? warnLog('Warning:', 'Postcode cannot contains special symbols/character') : ''
      } else {
        throw new Error('Duplicate Error - Please Check the constraints');
      }
    } else {
      throw new Error('Validation Error - Please Check the address constriants')
    }
  } catch(error) {
    errorLog('Error: Adding address ==>', error);
  }
}

// Edit Method Async - Edit the address based the address id
const editAddress = async () => {
  try {
    // Getting the address
    const address = JSON.parse(JSON.stringify(db.chain.get('addresses').find({ id: args.id })));
    // Handling the country list from API
    const isCountryExistInEurope = args.country ? await handleCountryList(args.country) : [];
    // Regex to avoid special symbols/character in postcode
    var postcodeFormat = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
    // Address data handling to avoid the duplication
    const line1 = args.line1 || address.line1;
    const line2 = args.line2 || address.line2;
    const country = (isCountryExistInEurope.length > 0) ? args.country : address.country;
    const postCode = (args.postcode && !postcodeFormat.test(args.postcode)) ? args.postcode : address.postcode;    
    const isDuplicate = usersAddressesList.filter(item => (item.line1 == line1 && item.line2.toLowerCase() == line2.toLowerCase()
     && item.country.toLowerCase() == country.toLowerCase() && item.postcode == postCode))
    // validate the duplicate address and line1 required
    if(isDuplicate.length === 0 && line1) {
      JSON.parse(JSON.stringify(db.chain.get('addresses').find({ id: args.id }).assign(
        { line1: args.line1 || address.line1 && address.line1 },
        { line2: args.line2 || address.line2 && address.line2 },
        { country: args.country || address.country && address.country },
        { postcode: args.postcode || address.postcode && address.postcode },
      )));
      db.write();
    } else {
      throw new Error('Duplicate Error - Check the field contraints')
    }
  } catch(error) {
    errorLog('Error: Editing the address ==>', error);
  }
}

// Delete method - Delete the address based on the id
const deleteAddress = () => {
  try {
    // Remove the address
    JSON.parse(JSON.stringify(db.chain.get('addresses').remove({ id: args.id })));
    db.write();
  } catch(error) {
    errorLog('Error: Deleting the address ==>', error);
  }
}

// Access to command and switching between methods
switch(command) {
  case 'add':
    addAddress();
    break
  case 'edit':
    editAddress();
    break;
  case 'delete':
    deleteAddress();
    break;
  default:
    errorLog('Error:', 'Invalid command passed');
    // usage()
}
