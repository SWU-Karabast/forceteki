import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardRelativePlayer } from '../../../core/Constants';

export default class RedemptionMedicalFregate extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3896582249',
            internalName: 'redemption#medical-frigate',
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'Heal up to 8 total damage from any number of units and/or bases.',
            immediateEffect: AbilityHelper.immediateEffects.distributeHealingAmong({
                amountToDistribute: 8,
                controller: WildcardRelativePlayer.Any,
                canChooseNoTargets: true,
                canDistributeLess: true,
                cardCondition: (card) => (card.isUnit() || card.isBase()) && card.damage > 0,
            }),
            then: (thenContext) => ({
                title: 'Deal that much damage to this unit.',
                optional: false,
                immediateEffect: AbilityHelper.immediateEffects.damage(() => {
                    const totalDamageRemoved = thenContext.events.reduce((acc, healedCard) => acc + healedCard.damageRemoved, 0);
                    return { amount: totalDamageRemoved };
                }),
            })
        });
    }
}

RedemptionMedicalFregate.implemented = true;
