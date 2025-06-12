import type { GameObject } from '../GameObject';
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

    public formatMessage(format: string, args: MsgArg[]): string | string[] {
        if (!format) {
            return '';
        }

        const fragments = format.split(/(\{\d+\})/);
        return fragments.reduce((output, fragment) => {
            const argMatch = fragment.match(/\{(\d+)\}/);
            if (argMatch && args) {
                const arg: MsgArg = args[argMatch[1]];
                if (arg) {
                    if (typeof arg === 'object' && 'message' in arg && arg.message) {
                        return output.concat(arg.message);
                    } else if (Array.isArray(arg)) {
                        if (typeof arg[0] === 'string' && arg[0].includes('{')) {
                            return output.concat(this.formatMessage(arg[0], arg.slice(1)));
                        }
                        return output.concat(this.formatArray(arg));
                    } else if (typeof arg === 'object' && 'getShortSummary' in arg && arg.getShortSummary) {
                        return output.concat(arg.getShortSummary());
                    } else if (typeof arg === 'object' && 'format' in arg && 'args' in arg) {
                        return output.concat(this.formatMessage(arg.format, arg.args));
                    }
                    return output.concat(arg);
                }
            } else if (!argMatch && fragment) {
                const splitFragment = fragment.split(' ');
                const lastWord = splitFragment.pop();
                return splitFragment
                    .reduce((output, word) => {
                        return output.concat(word || [], ' ');
                    }, output)
                    .concat(lastWord || []);
            }
            return output;
        }, []);
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
