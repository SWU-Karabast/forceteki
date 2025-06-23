import { GameObject } from '../GameObject';
import * as ChatHelpers from './ChatHelpers';

export type MsgArg = string | FormatMessage | GameObject | MsgArg[] | { name: string } | { message: string | string[] } | { getShortSummary: () => string };
export interface FormatMessage {
    format: string;
    args: MsgArg[];
}

type MessageText = string | (string | number)[];

export class GameChat {
    public messages: {
        date: Date;
        message: MessageText | { alert: { type: string; message: string | string[] } };
    }[] = [];

    private readonly pushUpdate: () => void;

    public constructor(pushUpdate: () => void) {
        this.pushUpdate = pushUpdate;
    }

    public addChatMessage(player: any, message: any): void {
        const playerArg = {
            name: player.name || player.username,
            id: player.id,
            type: 'playerChat'
        };

        this.addMessage('{0} {1}', playerArg, message);
    }

    public addMessage(message: string, ...args: MsgArg[]): void {
        const formattedMessage = this.formatMessage(message, args);
        this.messages.push({ date: new Date(), message: formattedMessage });
    }

    public addAlert(type: string, message: string, ...args: MsgArg[]): void {
        const formattedMessage = this.formatMessage(message, args);
        this.messages.push({ date: new Date(), message: { alert: { type: type, message: formattedMessage } } });
        this.pushUpdate();
    }

    private formatMessage(format: string, args: MsgArg[]): string | string[] {
        if (!format) {
            return '';
        }

        // split the format string by placeholders like {0}, {1}, etc.
        const fragments = format.split(/(\{\d+\})/);

        const formatOutput = [];
        for (const fragment of fragments) {
            const argMatch = fragment.match(/\{(\d+)\}/);

            let formattedFragment;
            if (argMatch) {
                formattedFragment = this.tryFormatPlaceholder(fragment, argMatch, args);
            } else {
                formattedFragment = fragment;
            }

            if (formattedFragment) {
                if (Array.isArray(formattedFragment)) {
                    formatOutput.push(...formattedFragment);
                    continue;
                }

                const prevFragmentType = typeof formatOutput.at(-1);
                const thisFragmentType = typeof formattedFragment;

                if (prevFragmentType === 'string' && (thisFragmentType === 'string' || thisFragmentType === 'number')) {
                    // concatenate simple strings and numbers together to reduce the number of elements sent over the wire
                    formatOutput[formatOutput.length - 1] += formattedFragment;
                } else if (thisFragmentType === 'number') {
                    formatOutput.push(formattedFragment.toString());
                } else {
                    formatOutput.push(formattedFragment);
                }
            }
        }

        return formatOutput;
    }

    /**
     * Tries to format the fragment if it is a placeholder such as '{0}', returns null if no placeholder is found or if the argument is not valid
     */
    private tryFormatPlaceholder(fragment: string, argMatch: RegExpMatchArray, args: MsgArg[]): any | null {
        if (!args) {
            return null;
        }

        const arg: MsgArg = args[argMatch[1]];
        if (!arg) {
            return null;
        }

        if (Array.isArray(arg)) {
            if (typeof arg[0] === 'string' && arg[0].includes('{')) {
                return this.formatMessage(arg[0], arg.slice(1));
            }
            return this.formatArray(arg);
        } else if (typeof arg === 'object') {
            if ('message' in arg && arg.message) {
                return arg.message;
            } else if (arg instanceof GameObject && arg.isCard() && arg.isBase()) {
                return this.formatMessage('{0}\'s base', [arg.controller]);
            } else if ('getShortSummary' in arg && arg.getShortSummary) {
                return arg.getShortSummary();
            } else if ('format' in arg && 'args' in arg) {
                return this.formatMessage(arg.format, arg.args);
            }
        }

        return arg;
    }

    private formatArray(array: MsgArg[]): string | string[] {
        array = array.filter((arg) => !Array.isArray(arg) || arg.length > 0);

        if (array.length === 0) {
            return [];
        }

        const format = ChatHelpers.formatWithLength(array.length);

        return this.formatMessage(format, array);
    }
}
