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
                onCardPlayed: (event, context) => event.card.controller === context.source.controller.opponent,
            },
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: (context) => context.event.costs.resources < context.event.card.cost,
                    onTrue: AbilityHelper.immediateEffects.chooseModalEffects((context) => ({
                        amountOfChoices: 1,
                        choices: () => ({
                            ['Ready']: AbilityHelper.immediateEffects.ready({ target: context.target }),
                            ['Exhaust']: AbilityHelper.immediateEffects.exhaust({ target: context.target })
                        })
                    })),
                    onFalse: AbilityHelper.immediateEffects.noAction()
                })
            }
        });
    }
}
