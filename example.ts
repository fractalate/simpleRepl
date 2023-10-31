#!/usr/bin/env node

import { simpleRepl } from './simpleRepl';
import { request } from  'http';

const commands: any = {
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
        repl.interface.setPrompt(repl.prompt);
        repl.updateEval(repl.defaultEvaluate);
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
        console.log();
        console.log(`STATUS: ${res.statusCode}`);
        console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          console.log(`BODY: ${chunk}`);
        });
        res.on('end', () => {
        });
      });

      req.on('error', (e) => {
        console.error(`problem with request: ${e.message}`);
      });
      req.end();
    }
  }
}

const repl = new simpleRepl({prompt: '> ', commands: commands});
/*
interface replOptions {
  prompt?: string;
  input?: any;
  output?: any;
  evaluate?: Function;
  commands?: any;        
}
*/