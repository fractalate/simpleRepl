#!/usr/bin/env node

import { simpleRepl } from './simpleRepl'
import { type ClientRequest, request } from 'http'

const commands: any = [
  {
    commandWord: 'exit',
    help: 'close the repl environment',
    action: () => {
      process.exit(0)
    }
  },
  {
    commandWord: 'say',
    help: 'console.log the arguments to this command',
    action: (args: string[]) => {
      args.splice(0, 1)
      console.log(args.join(' '))
      return ''
    },
    subcommands: [
      {
        commandWord: 'backward',
        help: 'say the arguments in reverse at the letter level',
        action: (args: string[]) => {
          args.splice(0, 2)
          console.log(args.join(' ').split('').reverse().join(''))
        }
      }
    ]
  },
  {
    commandWord: 'login',
    help: 'collect "login" credentials',
    action: (args: string[]) => {
      console.log(args[1])
      repl.interface.setPrompt('password: ')
      repl.updateEval((password: string) => {
        console.log('password = ' + password)
        repl.interface.setPrompt(repl.prompt)
        repl.updateEval(repl.defaultEvaluate)
      })
      repl.interface.prompt()
    }
  },
  {
    commandWord: 'request',
    help: 'make an http request `request <METHOD> <HOSTNAME> </PATH>`',
    action: async (args: any[]) => {
      const options = {
        hostname: args[2],
        port: 80,
        path: args[3],
        method: args[1],
        headers: {
          accept: 'application/json'
        }
      }

      return await new Promise<ClientRequest>((resolve, reject) => {
        const req = request(options, (res) => {
          console.log()
          res.setEncoding('utf8')
          res.on('data', (chunk: ClientRequest) => {
            resolve(chunk)
          })
          res.on('end', () => {
          })
        })

        req.on('error', (e) => {
          reject(e)
        })
        req.end()
      })
    }
  }
]

// eslint-disable-next-line new-cap
const repl = new simpleRepl({ prompt: '> ', commands })
/*
interface replOptions {
  prompt?: string;
  input?: any;
  output?: any;
  evaluate?: Function;
  commands?: any;
}
*/
