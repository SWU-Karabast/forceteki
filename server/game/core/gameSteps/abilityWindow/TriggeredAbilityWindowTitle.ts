import { AbilityType } from '../../Constants';

// TODO: update these
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

interface GameEvent {
    name: string;
}

export const TriggeredAbilityWindowTitle = {
    getTitle(eventsaa: GameEvent[] | GameEvent) {
        const events = Array.isArray(eventsaa) ? eventsaa : [eventsaa];
        const titles = events
            .map((event) => {
                const func = EventToTitleFunc[event.name];
                if (func) {
                    return func(event);
                }
            })
            .filter(Boolean);

        return titles.length > 0
            ? `Choose ability order for ${FormatTitles(titles)}`
            : 'Choose ability order';
    },
    getAction(event: GameEvent) {
        const func = EventToTitleFunc[event.name];
        if (func) {
            return func(event);
        }
        return event.name;
    }
};
