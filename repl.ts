#!/usr/bin/env node

import * as readline from 'readline';
import { Stream } from 'stream';
import { request } from  'http';

export class simpleRepl {
  prompt: string;
  inputStream: any; //TODO: fix input and output types. Should be ReadableStream/WritableStream?
  outputStream: any;
  evaluate: Function;
  commands: Object;
  interface: readline.Interface;

  constructor(prompt:string, input:any, output:Stream, evaluate:Function, commands: Object){ //TODO: figure out issues with input type
    this.prompt = prompt;
    this.inputStream = input;
    this.outputStream = output;  // TODO: defaults for these options? How do I make constructor accept undfined parameters? How do I make contructor accept an options json? 
    this.evaluate = evaluate;
    this.commands = commands;

    this.interface = readline.createInterface(this.inputStream,this.outputStream)
    this.interface.setPrompt(prompt);
    
    this.interface.prompt();
    this.interface.on('line',(line)=>{
      let trimmedCommand = line.trim();
      
      if(trimmedCommand) {
        this.evaluate(trimmedCommand); //TODO: should I really trim the command here, maybe this should be under evaluate()'s purveiw?
      }

      this.interface.prompt();
    });
    this.interface.on('close',()=>{
      process.exit(0);
    });
    this.interface.on('SIGINT',()=>{
      console.log('');
      process.exit(0);
    });
  }

  updateEval(newEval:any) { //TODO: fix newEval type? should be 'Function'?
    this.evaluate = newEval;
  }
  

}

/* command definitions
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
    action: (args:Array<String>) => {
      args.splice(0,1);
      console.log(args.join(' '));
    }
  },
  login: {
    help: 'collect "login" credentials',
    action: (args:Array<String>) => {
      console.log(args[1]);
      repl.interface.setPrompt('password: ');
      repl.updateEval((password:string) => {
        console.log('password = '+password)
        repl.interface.setPrompt(promptString);
        repl.updateEval(defaultEvaluate);
      });
      repl.interface.prompt();
    }
  },
  request: { //this is "broken". simpleRepl does not wait till the action finishes before reprompting
    help: 'make an http request `request <METHOD> <HOSTNAME> </PATH>`',
    action: (args:Array<any>) => {
      const options = {
        hostname: args[2],
        port: 80,
        path: args[3],
        method: args[1],
        headers: {
          accept: 'application/json'
        }
      };
      
      const req = request(options, (res) => {
        console.log(`STATUS: ${res.statusCode}`);
        console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          console.log(`BODY: ${chunk}`);
        });
        res.on('end', () => {
          console.log('No more data in response.');
        });
      });

      req.on('error', (e) => {
        console.error(`problem with request: ${e.message}`);
      });
      req.end();
    }
  }
}


const defaultEvaluate = (command:string) => {
  const split = command.split(' ');

  if(commands[split[0]]) {
    if(split.length > 0){
      commands[split[0]].action(split);
    } else {
      commands[split[0]].action();
    }
  } else {
    console.log('Unrecognized command: '+split[0]);
  }
}

const promptString = 'command> ' 

const repl = new simpleRepl(promptString,process.stdin,process.stdout,defaultEvaluate,commands)