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
                canChooseNoTargets: true,
                cardTypeFilter: WildcardCardType.Unit,
                maxTargets: 1
            }),
            ifYouDo: (ifYouDoContext) => ({
                title: 'Deal that much damage to this unit.',
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: ifYouDoContext.events[0].totalDistributed }),
            })
        });
    }
}

KashyyykDefender.implemented = true;
