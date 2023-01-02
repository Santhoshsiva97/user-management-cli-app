# User-Management-Cli-app

## Description
User management CLI app in Node.js.
* The Application help to manage the users list and addresses locally in JSON format.
* Clone the repo and follow the below setup steps.


## Project Setup

### Install the dependencies
```
npm install -y .
```

### Start command for User
```
person
```

### Start command for Address
```
address
```

## Usage

### Person command
```
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
```

### Address command
```
  usage:
    address <command>

    Commands:-

    add            used to create a address
    edit           used to retrieve and edit address
    delete         used to delete/remove the address

    Options:-
    --personId, --personId    Enter the PersonId             [UUID][Required]
    --line1,    --line1       Enter the Line 1               [String][Required]
    --line2,    --line2       Enter the Line 2               [String][Optional]
    --country,  --country     Enter the country from Europe  [Optional]
    --postcode, --postcode    Enter the postcode             [Number][Optional]
    --help,     --help        Show help                      [Boolean]
    --version,  --version     Show version                   [Boolean]
```

## Tech Stacks:
1. JavaScript
2. Node.js

## NPM's used:
```
* axios    // Country API management
* boxen    // To warp user & address in box style
* chalk    // Styling
* lodash   // To handle the JSON database
* lowdb    // Local DB
* pkg      // .exe conversion
* uuid     // Auto Unique ID generation
* yargs    // Arguments parsing
```

## CLI-app screenshot
![image](https://user-images.githubusercontent.com/49669209/210259752-408d2674-635c-496f-9bfd-1c8c13bef53b.png)
