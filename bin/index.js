#!/usr/bin/env node
console.log(process.argv)
// const rl = require("readline");
import rl from "readline";
// const rl = ReadLine();

import { LowSync } from 'lowdb'
import { JSONFileSync } from 'lowdb/node'

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import _ from 'lodash';
// const chalk = require("chalk");
import { Chalk } from "chalk";
const chalk = new Chalk();
const args = yargs(process.argv.slice(2)).argv;

const command = process.argv[2];

// yargs(hideBin(process.argv))
//  .usage("Usage: -firstname <name>")
//  .option("f", { alias: "name", describe: "Your name", type: "string", demandOption: true })
// //  .option("", { alias: "lastname", describe: "Your name", type: "string", demandOption: true })
//  .argv;


yargs(hideBin(process.argv))
  // .usage('add', '-a')
  .command('add', 'enter a name')
  .options('firstname', { alias: 'firstname', describe: 'enter firstname of user', type: 'string' })
  .options('lastname', { alias: 'lastname', describe: 'enter lastname of user', type: 'string' })
  .options('dob', { alias: 'dob', describe: 'enter dob of user', type: 'string' })
  .options('nickname', { alias: 'nickname', describe: 'enter nickname of user', type: 'string' })
  // .option('add', {
  //   alias: 'firstname',
  //   describe: 'Add the user firstName, lastName, dob and nickName',
  //   type: 'string',
  //   required: true,
  // })
  .command('edit', 'edit the user')
  .options('id', { alias: 'id', describe: 'Enter the user id', type: 'number' })
  .command('delete', 'delete the user')
  .options('id', { alias: 'id', describe: 'Enter the user id', type: 'number' })
  .command('view', 'view the users')
  .options('id', { alias: 'id', describe: 'enter the user id', type: 'number' })
  
  // .describe('n', 'Enter your name')
  // .alias("n", "name" || string)
  // .demandOption(1)
  // .describe("age", "Enter the age")
  // .alias("age", "age")
  .demandCommand(1)
  .argv;

  // "n", { alias: "name", describe: "Your name", type: ["string", "number"], demandOption: true }

// import yargs from "yargs";

// const options = yargs
//  .usage("Usage: -n <name>")
//  .option("n", { alias: "name", describe: "Your name", type: ["string", "number"], demandOption: true })
//  .argv;

// const greeting = `Hello, ${options.name}!`;

// console.log(greeting);

class LowSyncWithLodash extends LowSync {
  // constructor(props) {
  //   super(props)
  //   return({ chain: _.chain(this).get("data") })
    
  // }
  chain = _.chain(this).get("data") 
  // chain: lodash.ExpChain<this['data']> = lodash.chain(this).get('data')
}



const adapter = new JSONFileSync('./bin/db.json')
console.log('adapter::::', adapter)
const db = new LowSyncWithLodash(adapter)
// const database = JSON.parse(JSON.stringify(db))
console.log('db:::', db)

db.read(); 
db.data ||= { persons: [] };
// db.data ||= { persons: [] };

// if (!database.data) { 
//   (db.data ||= { persons: [] } )
// } else {
//   db.read();
// }


// db.data.persons.length > 0 ? db.read() : ''

console.log('data:::', db.data)


// used to log errors to the console in red color
function errorLog(error) {
  const eLog = chalk.red(error)
  console.log(eLog)
}

// we make sure the length of the arguments is exactly three
// if (args.length > 3) {
//   errorLog(`only one argument can be accepted`)
//   usage()
// }

// ...
// if (commands.indexOf(args[2]) == -1) {
//   errorLog('invalid command passed please check the --help')
//   usage()
// }
// type Data = {
//   persons: [],
// }

// type personData = {
//   firstName: String,
//   lastName: String,
//   dob: String,
//   nickName: String,
// }

const addUser = () => {

  console.log('adduser::::', args);
  // const q = chalk.blue(`Type in ${args} \n`)
  // console.log(q)
  const index = db.data && db.data.persons ? db.data.persons.length : 0;
  console.log('length:::', index)
  // const params = new personData()
  db.data.persons
  .push({
    id: index + 1,
    firstName: args.firstname,
    lastName: args.lastname,
    dob: args.dob,
    nickName: args.nickname || '',
  })

  db.write();
  // db.read();
  // prompt(q).then(todo => {
  //   console.log(todo)
  //   // add todo
  //     db.data.todos
  //     .push({
  //         title: todo,
  //         complete: false
  //     })

  //     db.write();
  // })
}

const editUser = () => {
  console.log('edit:::user', args)
  console.log('chain::::', JSON.parse(JSON.stringify(db.chain.get('persons').find({ id: args.id }).assign({ firstName: args.firstname })))) //.get('db.data.persons').find({ id: args.id }))
  db.chain.get('persons').find({ id: args.id }).assign({ firstName: args.firstname });
  db.write();
  //const personsList = 
  // db.data.persons.find({ id: args.id }).assign({ firstName: args.firstname }).write();
  // const personItem = _.chain(db.data.persons).find({ id: args.id }).assign({ firstName: args.firstname })
  // console.log('person item:::', personItem)
  // db.write();
  // const person = personList.filter(item => item.id == args.id);
  // db.data.per
}

const deleteUser = () => {
  console.log('delete:::user', args)
  console.log('delete:::', JSON.parse(JSON.stringify(db.chain.get('persons').remove({ id: args.id }))))
  db.chain.get('persons').remove({ id: args.id });
  // _.remove(JSON.parse(JSON.stringify(db.chain.get('persons'))), (item) => {
  //   console.log('n::::', item)
  //    return item.id == args.id //JSON.parse(JSON.stringify(db.chain.get('persons').find({ id: args.id })))
  // });
  // delete db.chain.get('persons').find({ id: args.id })
  db.write()
}

const getUser = () => {
  console.log('get users::::', args)
  const user = JSON.parse(JSON.stringify(db.chain.get('persons').find({ id: args.id })))//db.chain.get('persons').find({ id: args.id });
  console.log('user::::', user)
  console.log(`\nUser details:-\nFirst Name: ${user.firstName}\nLast Name: ${user.lastName}\nD.O.B: ${user.dob}\nNick Name: ${user.nickName}\n`)
}

const getUsersList = () => {
  console.log('users::', args)
  console.log('get users::::', args)
  const usersList = JSON.parse(JSON.stringify(db.chain.get('persons')))//db.chain.get('persons').find({ id: args.id });
  console.log('usersList::::', usersList)
  usersList.map((user, index) => {
    console.log(`\n${index+1}. User details:-\nFirst Name: ${user.firstName}\nLast Name: ${user.lastName}\nD.O.B: ${user.dob}\nNick Name: ${user.nickName}\n`)
  })

}

//...
switch(command) {
    case 'view':
      args.id ? getUser() : getUsersList();
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
    default:
      errorLog('invalid command passed');
      // usage()
  }
  //...

  //...

//...

//...
function prompt(question) {
    const r = rl.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false
    });
    return new Promise((resolve, error) => {
      r.question(question, answer => {
        r.close()
        resolve(answer)
      });
    })
  }
