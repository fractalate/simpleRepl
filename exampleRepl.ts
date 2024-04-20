#!/usr/bin/env node

import { simpleRepl } from './simpleRepl';
import { ClientRequest, request } from  'http';

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
    },
    subcommands: {
      backward: {
        action: (args: Array<String>) => {
          args.splice(0,2);
          console.log(args.join(' ').split('').reverse().join(''));
        }
      }
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
  request: {
    help: 'make an http request `request <METHOD> <HOSTNAME> </PATH>`',
    action: async (args:Array<any>) => {
      const options = {
        hostname: args[2],
        port: 80,
        path: args[3],
        method: args[1],
        headers: {
          accept: 'application/json'
        }
      };
      
      return new Promise<ClientRequest> ((resolve,reject) => {
      const req =  request(options, (res) => {
          console.log();
          res.setEncoding('utf8');
          res.on('data', (chunk) => {
            resolve(chunk);
          });
          res.on('end', () => {
          });
        });
        

        req.on('error', (e) => {
          reject(e);
        });
        req.end();
      })
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