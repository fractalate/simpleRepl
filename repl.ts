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

    this.defaultEvaluate = (command:string) => {
      const split = command.split(' ');

      if(this.commands[split[0]]) {
        if(split.length > 0){
          this.commands[split[0]].action(split);
        } else {
          this.commands[split[0]].action();
        }
      } else {
        console.log('Unrecognized command: '+split[0]);
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