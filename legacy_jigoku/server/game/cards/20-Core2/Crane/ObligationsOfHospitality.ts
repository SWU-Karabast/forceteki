import { CardTypes, Players, Locations } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

export default class ObligationsOfHospitality extends DrawCard {
    static id = 'obligations-of-hospitality';

    setupCardAbilities() {
        this.persistentEffect({
            location: Locations.Any,
            targetController: Players.Any,
            match: (player) => player.imperialFavor !== '',
            effect: AbilityDsl.effects.reduceCost({ match: (card, source) => card === source })
        });

        this.action({
            title: 'Take control of a character',
            condition: () => this.game.isDuringConflict(),
            target: {
                cardType: CardTypes.Character,
                controller: Players.Opponent,
                cardCondition: (card, context) => !card.anotherUniqueInPlay(context.player) && card.costLessThan(3),
                gameAction: AbilityDsl.actions.cardLastingEffect((context) => ({
                    effect: AbilityDsl.effects.takeControl(context.player)
                }))
            },
            effect: 'take control of {0}'
        });
    }

    canPlay(context, playType) {
        return context.player.opponent && context.player.isMoreHonorable() && super.canPlay(context, playType);
    }
}
