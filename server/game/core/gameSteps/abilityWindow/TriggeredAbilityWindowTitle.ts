import { AbilityType } from '../../Constants';

const EventToTitleFunc = {
    onCardExhausted(event: any) {
        return `${event.card.name} being exhausted`;
    },
    onCardLeavesPlay(event: any) {
        return `${event.card.name} leaving play`;
    },
    onCardPlayed(event: any) {
        return `${event.card.name} being played`;
    },
    onCharacterEntersPlay(event: any) {
        return `${event.card.name} entering play`;
    },
    onInitiateAbilityEffects(event: any) {
        return `the effects of ${event.card.name}`;
    },
    onPhaseEnded(event: any) {
        return `${event.phase} phase ending`;
    },
    onPhaseStarted(event: any) {
        return `${event.phase} phase starting`;
    },
    onSacrificed(event: any) {
        return `${event.card.name} being sacrificed`;
    }
};

const AbilityTypeToWord = new Map([
    ['cancelinterrupt', 'interrupt'],
    ['interrupt', 'interrupt'],
    ['reaction', 'reaction'],
    ['forcedreaction', 'forced reaction'],
    ['forcedinterrupt', 'forced interrupt'],
    ['duelreaction', 'reaction']
]);

function FormatTitles(titles: string[]) {
    return titles.reduce((string, title, index) => {
        if (index === 0) {
            return title;
        } else if (index === 1) {
            return title + ' or ' + string;
        }
        return title + ', ' + string;
    }, '');
}

interface Event {
    name: string;
}

export const TriggeredAbilityWindowTitle = {
    getTitle(abilityType: string, eventsaa: Event[] | Event) {
        const events = Array.isArray(eventsaa) ? eventsaa : [eventsaa];
        const abilityWord = AbilityTypeToWord.get(abilityType) ?? abilityType;
        const titles = events
            .map((event) => {
                const func = EventToTitleFunc[event.name];
                if (func) {
                    return func(event);
                }
            })
            .filter(Boolean);

        if (abilityType === AbilityType.ForcedReaction || abilityType === AbilityType.ForcedInterrupt) {
            return titles.length > 0
                ? `Choose ${abilityWord} order for ${FormatTitles(titles)}`
                : `Choose ${abilityWord} order`;
        }

        if (titles.length > 0) {
            return `Any ${abilityWord}s to ${FormatTitles(titles)}?`;
        }

        return `Any ${abilityWord}s?`;
    },
    getAction(event: Event) {
        const func = EventToTitleFunc[event.name];
        if (func) {
            return func(event);
        }
        return event.name;
    }
};
