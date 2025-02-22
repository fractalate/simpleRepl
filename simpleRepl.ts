import * as readline from 'readline'

// are your types so blessed that they deserve lowercase names?!?!? Nah! Use capital Command!
export interface command {
  commandWord: string
  help: string
  action: (args: string[]) => string | Promise<string>
  subcommands?: command[]
}

interface replOptions {
  prompt?: string
  input?: NodeJS.ReadStream
  output?: NodeJS.WriteStream
  evaluate?: (input: string) => Promise<string>
  commands?: command[]
}

const defaultCommands = (): command[] => {
  return [
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
        return args.join(' ')
      }
    }
  ]
}

// Upper case!!!!!
export class simpleRepl {
  prompt: string
  inputStream: NodeJS.ReadStream // todo: add funcntions to update input/ output streams
  outputStream: NodeJS.WriteStream
  evaluate: (command: string) => Promise<string>
  commands: command[]
  interface: readline.Interface
  defaultEvaluate: (command: string) => Promise<string>

  constructor (options?: replOptions) {
    // This eval function is used as a default if no evaluate function is given
    // it can also be passed to this.updateEval()
    this.defaultEvaluate = async (input: string): Promise<string> => {
      const args: string[] = input.split(' ')
      const command = this.commands.find(element => element.commandWord === args[0])

      /*
      if (command != null) {
      //if (typeof command !== 'undefined') {
        if (args.length > 0) {
          // check for sub commands
          return await this.checkSubcommands(args, command, 0)
        } else {
          return await command.action([])
        }
      } else {
        return 'Unrecognized command: ' + args[0]
      }
      */
      // maybe?
      if (command == null) {
        return 'Unrecognized command: ' + args[0]
      } else if (args.length > 0) {
        // check for sub commands
        return await this.checkSubcommands(args, command, 0)
      } else {
        return await command.action([])
      }
    }

    const helpCommand: command = {
      commandWord: 'help',
      help: 'print help info for all defined commands.',
      action: () => {
        this.commands.forEach((element) => {
          console.log(element.commandWord + '\t\t' + element.help)
          this.helpSubcommands(element)
        })
        return ''
      }
    }

    // if no options were passed to the constructor
    if (typeof options === 'undefined') {
      options = {}
    }

    this.prompt = typeof options.prompt !== 'undefined' ? options.prompt : 'simpleRepl> '
    this.inputStream = typeof options.input !== 'undefined' ? options.input : process.stdin
    this.outputStream = typeof options.output !== 'undefined' ? options.output : process.stdout
    this.evaluate = typeof options.evaluate !== 'undefined' ? options.evaluate : this.defaultEvaluate

    this.commands = options.commands == null ? [...defaultCommands()] : [...options.commands]
    this.commands.push(helpCommand)

    this.interface = readline.createInterface(this.inputStream, this.outputStream)
    this.interface.setPrompt(this.prompt)

    this.interface.prompt()
    // the listener function is meant to return void, but because we call it
    //    async it actually returns Promise<void> and that makes eslint sad.
    this.interface.on('line', async (line) => {
      const trimmedCommand = line.trim()

      if (Boolean(trimmedCommand)) {
        const response = await this.evaluate(trimmedCommand)
        if (typeof response !== 'undefined') {
          console.log(response)
        }
      }

      this.interface.prompt()
    })
    this.interface.on('close', () => {
      process.exit(0)
    })
    this.interface.on('SIGINT', () => {
      console.log('')
      process.exit(0)
    })
  }

  private helpSubcommands (command: any): void {
    if (typeof command.subcommands !== 'undefined') {
      for (const element of command.subcommands) {
        console.log('\u2B91\t' + element.commandWord + '\t\t' + element.help)
        this.helpSubcommands(element)
      }
    }
  }

  // this function could use a better name. Basically it looks at remaining arguments, looks for
  // matching subcommands, and runs the last matching subcommand.
  private checkSubcommands (args: string[], command: command, i: number): string | Promise<string> {
    if (typeof command.subcommands !== 'undefined') {
      const subcommand = command.subcommands.find(element => element.commandWord === args[i + 1])
      if ((typeof subcommand !== 'undefined') && (i < args.length)) { // good lledargo, gotta know your boundaries
        return this.checkSubcommands(args, subcommand, i)
      } else {
        return command.action(args) // for nested stuff, is this right?!?!
      }
    } else {
      return command.action(args)
    }
  }

  updateEval (newEval: any): void {
    this.evaluate = newEval
  }
}
