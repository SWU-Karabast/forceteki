import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class LuxBonteriRenegadeSeparatist extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0199085444',
            internalName: 'lux-bonteri#renegade-separatist',
        };
    }

    public override setupCardAbilities() {
        this.addTriggeredAbility({
            title: 'Ready or exhaust a unit',
            when: {
                onCardPlayed: (event, context) =>
                    // the card is not written like this, but we want to avoid multiple trigger when player use card like Palpatine's Return
                    event.card.controller === context.source.controller.opponent &&
                    event.costs.resources < event.card.cost,
            },
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.chooseModalEffects((context) => ({
                    amountOfChoices: 1,
                    choices: () => ({
                        ['Ready']: AbilityHelper.immediateEffects.ready({ target: context.target }),
                        ['Exhaust']: AbilityHelper.immediateEffects.exhaust({ target: context.target })
                    })
                })),
            }
        });
    }
}
