#!/usr/bin/env node
console.log(process.argv)
// import rl from "readline";

import { LowSync } from 'lowdb'
import { JSONFileSync } from 'lowdb/node'

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



class LowSyncWithLodash extends LowSync {
  chain = _.chain(this).get("data") 
}



const adapter = new JSONFileSync('./bin/db-addresses.json')
const db = new LowSyncWithLodash(adapter)
console.log('db:::', db)

db.read(); 
db.data ||= { addresses: [] };
console.log('data:::', db.data)


// used to log errors to the console in red color
function errorLog(error) {
  const eLog = chalk.red(error)
  console.log(eLog)
}



const addAddress = () => {

  console.log('add address::::', args);
  // const q = chalk.blue(`Type in ${args} \n`)
  // console.log(q)
  const index = db.data && db.data.addresses ? db.data.addresses.length : 0;
  console.log('length:::', index)
  // const params = new personData()
  db.data.addresses
  .push({
    id: index + 1,
    personId: args.personId,
    line1: args.line1 || '',
    line2: args.line2 || '',
    country: args.country || '',
    postcode: args.postcode || '',
  })

  db.write();
}

const editAddress = () => {
    console.log('edit:::address', args)
    const address = JSON.parse(JSON.stringify(db.chain.get('addresses').find({ id: args.id })));
    JSON.parse(JSON.stringify(db.chain.get('addresses').find({ id: args.id }).assign(
      { line1: args.line1 || address.line1 && address.line1 },
      { line2: args.line2 || address.line2 && address.line2 },
      { country: args.country || address.country && address.country },
      { postcode: args.postcode || address.postcode && address.postcode },
    )));
    db.write();
}

const deleteAddress = () => {
  console.log('delete:::address', args)
  console.log('delete:::', JSON.parse(JSON.stringify(db.chain.get('addresses').remove({ id: args.id }))))
  db.chain.get('addresses').remove({ id: args.id });
  db.write()
}

//...
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
      errorLog('invalid command passed');
      // usage()
  }
  //...

  //...

//...

//...
// function prompt(question) {
//     const r = rl.createInterface({
//       input: process.stdin,
//       output: process.stdout,
//       terminal: false
//     });
//     return new Promise((resolve, error) => {
//       r.question(question, answer => {
//         r.close()
//         resolve(answer)
//       });
//     })
//   }
