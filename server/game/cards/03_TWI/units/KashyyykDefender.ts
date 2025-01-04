import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType, WildcardRelativePlayer } from '../../../core/Constants';

export default class KashyyykDefender extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8552292852',
            internalName: 'kashyyyk-defender'
        };
    }

    public override setupCardAbilities() {
        this.addTriggeredAbility({
            title: 'Heal up to 2 damage from another unit',
            when: {
                onCardPlayed: (event, context) => event.card.controller === context.source.controller
            },
            immediateEffect: AbilityHelper.immediateEffects.distributeHealingAmong({
                amountToDistribute: 2,
                cardCondition: (card, context) => card !== context.source,
                controller: WildcardRelativePlayer.Any,
                canDistributeLess: true,
                canChooseNoTargets: false,
                cardTypeFilter: WildcardCardType.Unit,
                maxTargets: 1
            }),
            then: (thenContext) => ({
                title: 'Deal that much damage to this unit.',
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: thenContext.events[0].damageRemoved }),
            })
        });
    }
}

KashyyykDefender.implemented = true;
