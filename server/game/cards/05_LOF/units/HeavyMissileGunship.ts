import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType, ZoneName } from '../../../core/Constants';

export default class HeavyMissileGunship extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3433996932',
            internalName: 'heavy-missile-gunship',
        };
    }

    public override setupCardAbilities(card: this) {
        card.addActionAbility({
            title: 'Deal 2 damage to a ground unit',
            cost: AbilityHelper.costs.exhaustSelf(),
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                zoneFilter: ZoneName.GroundArena,
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 2 })
            }
        });
    }
}