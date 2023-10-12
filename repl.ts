#!/usr/bin/env node

import * as readline from 'readline';

//prepare readline options
const promptString:string = 'command> ';
const options = {
  prompt: promptString,
  input: process.stdin,
  output: process.stdout
}

/*
{
  $name: {
    help: '...',
    action: () => {...}
  }
}
*/

let commands: any = {
  exit: { 
    help: 'close the repl environment',
    action: () => {
      process.exit(0);
    }
  },
  say: {
    help: 'console.log the arguments to this command',
    action: (split:Array<String>) => {
      split.splice(0,1);
      console.log(split.join(' '));
    }
  }
}

function evaluate (command:string) {
  const split = command.split(' ');

  if(commands[split[0]]) {
    if(split.length > 0){
      commands[split[0]].action(split);
    } else {
      commands[split[0]].action();
    }
  }
}

const r = readline.createInterface(options);
r.prompt();
r.on('line',(line)=>{
  let trimmedCommand = line.trim();
  
  if(trimmedCommand) {
    evaluate(trimmedCommand);
  }

  r.prompt();
}).on('close',()=>{
  process.exit();
});
