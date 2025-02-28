import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, TargetMode, WildcardCardType } from '../../../core/Constants';
import type { IUnitCard } from '../../../core/card/propertyMixins/UnitProperties';

export default class RadiantVIIAmbassadorsArrival extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3567283316',
            internalName: 'radiant-vii#ambassadors-arrival',
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'Deal 5 indirect damage to a player',
            targetResolver: {
                mode: TargetMode.Player,
                immediateEffect: AbilityHelper.immediateEffects.indirectDamageToPlayer({ amount: 5 }),
            },
        });

        this.addConstantAbility({
            title: 'Each enemy non-leader unit gets –1/–0 for each damage on it',
            targetController: RelativePlayer.Opponent,
            targetCardTypeFilter: WildcardCardType.NonLeaderUnit,
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats((target: IUnitCard) => ({
                power: -target.damage,
                hp: 0
            }))
        });
    }
}
