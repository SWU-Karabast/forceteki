import type { IGameSystemProperties } from '../gameSystem/GameSystem';
import type { FormatMessage } from './GameChat';

export function formatWithLength(length: number, prefix: string = ''): string {
    if (length === 0) {
        return '';
    }
    let message = '{0}';
    for (let i = 1; i < length; i++) {
        message += i < length - 1 ? `, ${prefix}`
            : length === 2 ? ` and ${prefix}`
                : `, and ${prefix}`;
        message += '{' + i + '}';
    }
    return message;
}

export function pluralize(count: number, singular: string, plural: string): string | FormatMessage {
    if (count === 1) {
        return singular;
    }
    return { format: '{0} {1}', args: [count.toString(), plural] };
}

export function verb(props: IGameSystemProperties, effectVerb: string, costVerb: string): string {
    return props.isCost ? costVerb : effectVerb;
}