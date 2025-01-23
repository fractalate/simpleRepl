#!/usr/bin/env node

import { simpleRepl } from './simpleRepl'
import { type ClientRequest, request } from 'http' /// in 2025, fetch()
// lledargo: when all you have is the request lib, everything is vulnerable code

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
      //args.splice(0, 1) // callers of functions hate em...
      console.log(args.slice(1).join(' '))
      return ''
    },
    subcommands: [
      {
        commandWord: 'backward',
        help: 'say the arguments in reverse at the letter level',
        action: (args: string[]) => {
          args.splice(0, 2) // slices dawg, do you use em:???
          console.log(args.join(' ').split('').reverse().join(''))
        }
      }
    ]
  },
  {
    commandWord: 'login',
    help: 'collect "login" credentials',
    action: (args: string[]) => {
      console.log(args[1]) /// prints for fun?! maybe repl.outputStream
      repl.interface.setPrompt('password: ') // if you define your repl and commands in different files, how would you reference repl cleanly like this?
      repl.inputStream.setRawMode(true) // also find out how to disable echo somehow
      repl.updateEval((password: string) => {
        console.log('password = ' + password.replace(/./g, '*'))
        repl.interface.setPrompt(repl.prompt)
        repl.inputStream.setRawMode(false)
        repl.updateEval(repl.defaultEvaluate)
      })
      repl.interface.prompt()
    }
  },
  {
    commandWord: 'request',
    help: 'make an http request `request <METHOD> <HOSTNAME> </PATH>`',
    action: async (args: any[]) => {
      // maybe checks that args are provided, but this is cool! 


      const options = {
        hostname: args[2],
        port: 80, // https first, it's 2025
        path: args[3],
        method: args[1],
        headers: {
          accept: 'application/json'
        }
      }

      return await new Promise<string>((resolve, reject) => {
        let content = ''
        const req = request(options, (res) => {
          console.log()
          res.setEncoding('utf8')
          res.on('data', (chunk: string) => {
            // looool chunk += content
            content += chunk
          })
          res.on('end', () => {
            resolve(content)
          })
        })

        req.on('error', (e) => {
          reject(e)
        })
        req.end() /// god, I hate request()....
      })
    }
  }
]

// eslint-disable-next-line new-cap
const repl = new simpleRepl({ prompt: '> ', commands })
/*
interface replOptions {
  prompt?: string
  input?: NodeJS.ReadStream
  output?: NodeJS.WriteStream
  evaluate?: (input: string) => Promise<string>
  commands?: command[]
}
*/


/*
import { simpleRepl } from 'simplerepl'

function randomNumber(numbers: number): number {
  return Math.floor(Math.random() * numbers) + 1
}

let number = randomNumber(69)

const repl = new simpleRepl({
  prompt: '8======D ',
  commands: [
    {
      commandWord: 'newgame',
      help: 'start a new game (provide a maximum value for additional fun)',
      action(args) {
        let maxy = 10
        if (args.length > 1) {
          maxy = parseInt(args[1])
        }
        number = randomNumber(maxy)
        return 'please `guess` a number from 1 to ' + maxy
      },
    },
    {
      commandWord: 'guess',
      help: 'guess that number! provide number as argument',
      action(args) {
        repl.prompt = '8' + ''.padStart(repl.prompt.length - 2, '=') + 'D '
        repl.interface.setPrompt(repl.prompt)
        if (args.length == 1) {
          return 'dumb user <--'
        }
        const guess = parseInt(args[1])
        if (guess < number) {
          return 'gettin\' too low... gotta get high'
        } else if (guess > number) {
          return 'way too damn high!!!'
        }
        return 'GOURD JORB!!! The number was ' + number
      },
    }
  ],
})
*/
