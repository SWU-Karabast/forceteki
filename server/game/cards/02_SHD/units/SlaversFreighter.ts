import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardZoneName } from '../../../core/Constants';

export default class SlaversFreighter extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6853970496',
            internalName: 'slavers-freighter',
        };
    }

    protected override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'You may ready another unit with power equal to or less than the number of upgrades on enemy units',
            optional: true,
            targetResolver: {
                zoneFilter: WildcardZoneName.AnyArena,
                cardCondition: (card, context) => {
                    const opponentUpgradeCount = context.source.controller.opponent.getUnitsInPlay().reduce(
                        (total, unit) => total + unit.upgrades.length,
                        0);
                    return card.isUnit() && card !== context.source && card.getPower() <= opponentUpgradeCount;
                },
                immediateEffect: AbilityHelper.immediateEffects.ready()
            }
        });
    }
}
