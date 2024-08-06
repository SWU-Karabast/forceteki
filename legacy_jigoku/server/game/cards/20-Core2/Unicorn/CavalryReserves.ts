import AbilityDsl from '../../../abilitydsl';
import { CardTypes, Locations, Players, TargetModes } from '../../../Constants';
import DrawCard from '../../../drawcard';

export default class CavalryReserves extends DrawCard {
    static id = 'cavalry-reserves';

    setupCardAbilities() {
        this.action({
            title: 'Put Cavalry into play from your discard',
            condition: (context) => context.game.isDuringConflict('military'),
            target: {
                mode: TargetModes.MaxStat,
                activePromptTitle: 'Choose characters',
                cardStat: (card) => card.getCost(),
                maxStat: () => 6,
                numCards: 0,
                cardType: CardTypes.Character,
                location: Locations.DynastyDiscardPile,
                controller: Players.Self,
                cardCondition: (card) => card.hasTrait('cavalry'),
                gameAction: AbilityDsl.actions.putIntoConflict()
            }
        });
    }
}
