import type { AbilityContext } from '../ability/AbilityContext';
import type { Card } from '../card/Card';
import { ZoneName } from '../Constants';
import type { IGameSystemProperties } from '../gameSystem/GameSystem';
import type { FormatMessage, MsgArg } from './GameChat';
import * as Helpers from '../utils/Helpers';
import * as Contract from '../utils/Contract';

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

export function getTargetLocationMessage<TContext extends AbilityContext>(
    targets: Card | Card[],
    context: TContext,
    excludedZones = new Set<ZoneName>()
): MsgArg[] {
    const targetsArray = Helpers.asArray(targets);

    Contract.assertPositiveNonZero(targetsArray.length, 'there must be at least one target to get target location message');

    // If targets are in different locations, return no location info
    const firstZone = targetsArray[0].zone;
    if (
        excludedZones.has(firstZone.name) ||
        targetsArray.some((card) => card.zone !== firstZone)
    ) {
        return [];
    }

    let locationFormat = '';

    switch (firstZone.name) {
        case ZoneName.Resource:
            locationFormat = '{0} resource row';
            break;
        case ZoneName.Deck:
            if (targetsArray[0] === context.player.getTopCardOfDeck()) {
                locationFormat = 'the top of {0} deck';
            } else {
                locationFormat = '{0} deck';
            }
            break;
        case ZoneName.Discard:
            locationFormat = '{0} discard pile';
            break;
        case ZoneName.Hand:
            locationFormat = '{0} hand';
            break;
        default:
            break;
    }

    if (!locationFormat) {
        return [];
    }

    const possessiveArg: MsgArg = targetsArray[0].owner === context.player
        ? 'their'
        : { format: '{0}\'s', args: [targetsArray[0].owner] };

    const possessiveLocation: MsgArg = { format: locationFormat, args: [possessiveArg] };

    return [{ format: ' from {0}', args: [possessiveLocation] }];
}