import { CardTypes, Locations, Phases } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';
import { AshigaruRecruit } from '../../AshigaruRecruit';
import type { AbilityContext } from '../../../AbilityContext';

function putAshigaruTokenIntoPlay(context: AbilityContext) {
    const card = context.player.dynastyDeck.first();
    const token = context.game.createToken(card, AshigaruRecruit);
    card.owner.removeCardFromPile(card);
    card.moveTo(Locations.RemovedFromGame);
    const moveEvents = [];
    context.game.actions.putIntoPlay({ target: token }).addEventsToArray(moveEvents, context);
    context.game.openThenEventWindow(moveEvents);
    return true;
}

export default class AshigaruEncampment extends DrawCard {
    static id = 'ashigaru-encampment';

    setupCardAbilities() {
        this.reaction({
            title: 'Fill this province with a card',
            when: {
                onPhaseStarted: (event) => event.phase === Phases.Dynasty
            },
            gameAction: AbilityDsl.actions.fillProvince((context) => ({
                location: context.source.location,
                fillTo: context.source.controller.getDynastyCardsInProvince(context.source.location).length + 1
            })),
            effect: 'fill its province with 1 card'
        });

        this.action({
            title: 'Recruit a fresh Ashigaru',
            effect: 'recruit {1}!',
            effectArgs: {
                id: 'ashigaru-recruit',
                label: 'Ashigaru Recruit',
                name: 'Ashigaru Recruit',
                facedown: false,
                type: CardTypes.Character
            },
            gameAction: AbilityDsl.actions.handler({ handler: putAshigaruTokenIntoPlay })
        });
    }
}