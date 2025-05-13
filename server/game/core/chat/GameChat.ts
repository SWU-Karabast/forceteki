type MsgArg = string | string[] | FormatMessage | FormatMessage[] | { name: string } | { getShortSummary: () => string };
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

    public addChatMessage(player, message: string): void {
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
    }

    public formatMessage(format: string, args: MsgArg[]): string | string[] {
        if (!format) {
            return '';
        }

        const fragments = format.split(/(\{\d+\})/);
        return fragments.reduce((output, fragment) => {
            const argMatch = fragment.match(/\{(\d+)\}/);
            if (argMatch && args) {
                const arg = args[argMatch[1]];
                if (arg || arg === 0) {
                    if (arg.message) {
                        return output.concat(arg.message);
                    } else if (Array.isArray(arg)) {
                        if (typeof arg[0] === 'string' && arg[0].includes('{')) {
                            return output.concat(this.formatMessage(arg[0], arg.slice(1)));
                        }
                        return output.concat(this.formatArray(arg));
                    } else if (arg.getShortSummary) {
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

        const format =
            array.length === 1
                ? '{0}'
                : array.length === 2
                    ? '{0} and {1}'
                    : Array.from({ length: array.length - 1 })
                        .map((_, idx) => `{${idx}}`)
                        .join(', ') + `, and {${array.length - 1}}`;

        return this.formatMessage(format, array);
    }
}
