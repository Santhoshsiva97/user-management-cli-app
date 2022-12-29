#!/usr/bin/env node
console.log(process.argv)
// const rl = require("readline");
import rl from "readline";
// const rl = ReadLine(); 

import { LowSync } from 'lowdb'
import { JSONFileSync } from 'lowdb/node'

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
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
  .options('firstname', { alias: 'firstname', describe: 'enter firstname of user', type: 'string', demandOption: true })
  .options('lastname', { alias: 'lastname', describe: 'enter lastname of user', type: 'string', demandOption: true })
  .options('dob', { alias: 'dob', describe: 'enter dob of user', type: 'string', demandOption: true })
  .options('nickname', { alias: 'nickname', describe: 'enter nickname of user', type: 'string' })
  // .option('add', {
  //   alias: 'firstname',
  //   describe: 'Add the user firstName, lastName, dob and nickName',
  //   type: 'string',
  //   required: true,
  // })
  .command('edit', 'edit the user')
  .command('delete', 'delete the user')
  .command('get', 'get the users')
  
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






const adapter = new JSONFileSync('./bin/db.json')
const db = new LowSync(adapter)
console.log('db:::', db)
// if (db) db.read();

if (!db.data) db.data ||= { persons: [] } 
console.log('data:::', db.data.persons)


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

const addUser = (args) => {
  console.log('adduser::::', args);
  // const q = chalk.blue(`Type in ${args} \n`)
  // console.log(q)
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
}

const deleteUser = () => {
  console.log('delete:::user', args)
}

const getUsers = () => {
  console.log('get users::::', args)
}
//...
switch(command) {
    case 'get':
      getUsers();
      break
    case 'add':
      addUser(args);
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
