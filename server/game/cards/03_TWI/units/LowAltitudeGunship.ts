import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, Trait, WildcardCardType } from '../../../core/Constants';

export default class LowAltitudeGunship extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3476041913',
            internalName: 'low-altitude-gunship',
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'Deal 1 damage to an enemy unit for each friendly Republic unit',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Opponent,
                immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({
                    amount: context.source.controller.getArenaUnits({ trait: Trait.Republic }).length
                }))
            }
        });
    }
}

LowAltitudeGunship.implemented = true;
