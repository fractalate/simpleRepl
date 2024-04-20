import * as readline from 'readline';

interface replOptions {
  prompt?: string;
  input?: any; //TODO: fix input and output types. Should be ReadableStream/WritableStream?
  output?: any;
  evaluate?: Function;
  commands?: any; //fix commands typing. should be object, maybe Object<Object>?
}

export class simpleRepl {
  prompt: string;
  inputStream: any; //TODO: fix input and output types. Should be ReadableStream/WritableStream?
  outputStream: any;
  evaluate: Function;
  commands: any; //fix commands typing. should be object, maybe Object<Object>?
  interface: readline.Interface;
  defaultEvaluate: Function;

  constructor(options?: replOptions){ //TODO: figure out issues with input type

    this.defaultEvaluate = async (command:string) => {
      const args = command.split(' ');

      if(this.commands[args[0]]) {
        if(args.length > 0){
          // check for sub commands
          this.checkSubcommands(args,this.commands[args[0]],0);
          //return await this.commands[split[0]].action(split);

        } else {
          return await this.commands[args[0]].action();
        }
      } else {
        console.log('Unrecognized command: '+args[0]);
      }
    }

    const helpCommand: any = {
      help: 'print help info for all defined commands.',
      action: () => {
        for (const command in this.commands) {
          console.log(command + '\t\t' + this.commands[command].help);
        }
      }
    }

    const defaultCommands: any = {
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
    }

    options = typeof options !== 'undefined' ? options : {};

    this.prompt = typeof options.prompt !== 'undefined' ? options.prompt : 'simpleRepl> ';
    this.inputStream = typeof options.input !== 'undefined' ? options.input : process.stdin;
    this.outputStream = typeof options.output !== 'undefined' ? options.output : process.stdout;
    this.evaluate = typeof options.evaluate !== 'undefined' ? options.evaluate : this.defaultEvaluate;
    this.commands = typeof options.commands !== 'undefined' ? options.commands : defaultCommands;
    this.commands['help'] = helpCommand;

    this.interface = readline.createInterface(this.inputStream,this.outputStream)
    this.interface.setPrompt(this.prompt);
    
    this.interface.prompt();
    this.interface.on('line',async (line)=>{
      let trimmedCommand = line.trim();
      
      if(trimmedCommand) {
        const response = this.evaluate(trimmedCommand)  //TODO: should I really trim the command here, maybe this should be under evaluate()'s purveiw?
        if(typeof await response !== 'undefined') {
          console.log(await response);
        }
         
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

  private checkSubcommands(args: Array<string>, command: any, i: number){
    if('subcommands' in command){
      if(command.subcommands[args[i+1]] && i < args.length){
        this.checkSubcommands(args, command.subcommands[args[i+1]], i++);
      } else {
        command.action(args);
      }
    } else {
      command.action(args);
    }

  }

  updateEval(newEval:any) { //TODO: fix newEval type? should be 'Function'?
    this.evaluate = newEval;
  }
}