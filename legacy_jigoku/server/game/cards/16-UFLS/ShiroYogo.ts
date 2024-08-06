import { CardTypes, Durations } from '../../Constants';
import { StrongholdCard } from '../../StrongholdCard';
import AbilityDsl from '../../abilitydsl';

export default class ShiroYogo extends StrongholdCard {
    static id = 'shiro-yogo';

    setupCardAbilities() {
        this.action({
            title: 'Prevent a character from triggering abilities',
            cost: AbilityDsl.costs.bowSelf(),
            target: {
                cardType: CardTypes.Character,
                cardCondition: (card) => card.isDishonored,
                gameAction: AbilityDsl.actions.cardLastingEffect({
                    duration: Durations.UntilEndOfPhase,
                    effect: AbilityDsl.effects.cardCannot('triggerAbilities')
                })
            },
            effect: 'prevent {0} from triggering their abilities until the end of the phase'
        });
    }
}
