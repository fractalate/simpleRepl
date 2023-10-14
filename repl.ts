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
  },
  login: {
    help: 'collect "login" credentials',
    action: (username:string) => {
      console.log(username[1]);
      r.setPrompt('password: ');
      updateEval((password:string) => {
        console.log('password = '+password)
        r.setPrompt(promptString);
        updateEval(defaultEvaluate);
      });
      r.prompt();
    }
  }
}

function updateEval(newEval:any) {
  evaluate = newEval;
}

const defaultEvaluate = (command:string) => {
  const split = command.split(' ');

  if(commands[split[0]]) {
    if(split.length > 0){
      commands[split[0]].action(split);
    } else {
      commands[split[0]].action();
    }
  }
}

let evaluate = defaultEvaluate;

const r = readline.createInterface(options);
r.prompt();
r.on('line',(line)=>{
  let trimmedCommand = line.trim();
  
  if(trimmedCommand) {
    evaluate(trimmedCommand);
  }

  r.prompt();
});
r.on('close',()=>{
  process.exit();
});
r.on('SIGINT',()=>{
  console.log('');
  process.exit();
});