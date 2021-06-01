import { join } from 'path'
import BaseCommand from '../lib/BaseCommand'
import WAClient from '../lib/WAClient'
import { ICommand, IParsedArgs, ISimplifiedMessage } from '../typings'

export default class MessageHandler {
    commands = new Map<string, ICommand>()

    constructor(public client: WAClient) {}

    handleMessage = async (M: ISimplifiedMessage): Promise<void> => {
        if (M.chat === 'dm' || !M.groupMetadata) return
        const { args } = M
        if (!args[0] || !args[0].startsWith(this.client.config.prefix)) return
        const cmd = args[0].slice(this.client.config.prefix.length).toLowerCase()
        const command = this.commands.get(cmd)
        if (!command) return void M.reply('No Command Found! Try using one from the help list.')
        return void command.run(M, this.parseArgs(args))
    }

    loadCommands = (): void => {
        this.client.log('Loading Commands...')
        const path = join(__dirname, '..', 'commands')
        const files = this.client.util.readdirRecursive(path)
        files.map((file) => {
            if (!file.startsWith('_')) {
                //eslint-disable-next-line @typescript-eslint/no-var-requires
                const command: BaseCommand = new (require(file).default)(this.client, this)
                this.commands.set(command.config.command, command)
                this.client.log(`Loaded: ${command.config.command} from ${file}`)
                return command
            }
        })
        this.client.log(`Successfully Loaded ${this.commands.size} Commands`)
    }

    parseArgs = (args: string[]): IParsedArgs =>{
        const slicedArgs = args.slice(1)
        return {
            args: slicedArgs,
            flags: slicedArgs.filter((arg) => arg.startsWith('--')),
            joined: slicedArgs.join(' ').trim()
        }
    }
}