import { AbilityTypes } from '../Constants';

const EventToTitleFunc = {
    onCardBowed(event: any) {
        return `${event.card.name} being bowed`;
    },
    onCardDishonored(event: any) {
        return `${event.card.name} being dishonored`;
    },
    onCardHonored(event: any) {
        return `${event.card.name} being honored`;
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
    onClaimRing(event: any) {
        return `to the ${event.ring.element} ring being claimed`;
    },
    onInitiateAbilityEffects(event: any) {
        return `the effects of ${event.card.name}`;
    },
    onMoveCharactersToConflict() {
        return 'characters moving to the conflict';
    },
    onMoveFate(event: any) {
        return `Fate being moved from ${event.origin ? event.origin.name : event.card ? event.card.name : 'somewhere'}`;
    },
    onPhaseEnded(event: any) {
        return `${event.phase} phase ending`;
    },
    onPhaseStarted(event: any) {
        return `${event.phase} phase starting`;
    },
    onRemovedFromChallenge(event: any) {
        return `${event.card.name} being removed from the challenge`;
    },
    onReturnRing(event: any) {
        return `returning the ${event.ring.element} ring`;
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

type Event = {
    name: string;
};

export const TriggeredAbilityWindowTitle = {
    getTitle(abilityType: string, eventsaa: Event[] | Event) {
        const events = Array.isArray(eventsaa) ? eventsaa : [eventsaa];
        const abilityWord = AbilityTypeToWord.get(abilityType) ?? abilityType;
        const titles = events
            .map((event) => {
                let func = EventToTitleFunc[event.name];
                if (func) {
                    return func(event);
                }
            })
            .filter(Boolean);

        if (abilityType === AbilityTypes.ForcedReaction || abilityType === AbilityTypes.ForcedInterrupt) {
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
        let func = EventToTitleFunc[event.name];
        if (func) {
            return func(event);
        }
        return event.name;
    }
};
