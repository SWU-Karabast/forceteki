import AbilityHelper from '../../../AbilityHelper';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { Aspect, RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class SupremeLeaderSnokeInTheSeatOfPower extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'supreme-leader-snoke#in-the-seat-of-power-id',
            internalName: 'supreme-leader-snoke#in-the-seat-of-power',
        };
    }

    protected override setupLeaderSideAbilities() {
        this.addActionAbility({
            title: 'Give an Experience token to the unit with the most power among Villainy units',
            cost: [AbilityHelper.costs.abilityActivationResourceCost(1), AbilityHelper.costs.exhaustSelf()],
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => {
                    const villainyUnits = context.player.getArenaUnits({ aspect: Aspect.Villainy });
                    const maxPower = villainyUnits.map((x) => x.getPower()).reduce((p, c) => (p > c ? p : c), 0);
                    return villainyUnits.filter((x) => x.getPower() === maxPower).length > 1;
                },
                onTrue: AbilityHelper.immediateEffects.selectCard({
                    cardTypeFilter: WildcardCardType.Unit,
                    controller: RelativePlayer.Self,
                    cardCondition: (card, context) => {
                        const villainyUnits = context.player.getArenaUnits({ aspect: Aspect.Villainy });
                        const maxPower = villainyUnits.map((x) => x.getPower()).reduce((p, c) => (p > c ? p : c), 0);
                        return card.isUnit() && card.hasSomeAspect(Aspect.Villainy) && card.getPower() === maxPower;
                    },
                    innerSystem: AbilityHelper.immediateEffects.giveExperience()
                }),
                onFalse: AbilityHelper.immediateEffects.giveExperience((context) => {
                    const villainyUnits = context.player.getArenaUnits({ aspect: Aspect.Villainy });
                    const maxPower = villainyUnits.map((x) => x.getPower()).reduce((p, c) => (p > c ? p : c), 0);
                    return {
                        target: villainyUnits.find((x) => x.getPower() === maxPower)
                    };
                })
            })
        });
    }

    protected override setupLeaderUnitSideAbilities() {
        this.addOnAttackAbility({
            title: 'Give an Experience token to the unit with the most power among Villainy units',
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => {
                    const villainyUnits = context.player.getArenaUnits({ aspect: Aspect.Villainy });
                    const maxPower = villainyUnits.map((x) => x.getPower()).reduce((p, c) => (p > c ? p : c), 0);
                    return villainyUnits.filter((x) => x.getPower() === maxPower).length > 1;
                },
                onTrue: AbilityHelper.immediateEffects.selectCard({
                    cardTypeFilter: WildcardCardType.Unit,
                    controller: RelativePlayer.Self,
                    cardCondition: (card, context) => {
                        const villainyUnits = context.player.getArenaUnits({ aspect: Aspect.Villainy });
                        const maxPower = villainyUnits.map((x) => x.getPower()).reduce((p, c) => (p > c ? p : c), 0);
                        return card.isUnit() && card.hasSomeAspect(Aspect.Villainy) && card.getPower() === maxPower;
                    },
                    innerSystem: AbilityHelper.immediateEffects.giveExperience()
                }),
                onFalse: AbilityHelper.immediateEffects.giveExperience((context) => {
                    const villainyUnits = context.player.getArenaUnits({ aspect: Aspect.Villainy });
                    const maxPower = villainyUnits.map((x) => x.getPower()).reduce((p, c) => (p > c ? p : c), 0);
                    return {
                        target: villainyUnits.find((x) => x.getPower() === maxPower)
                    };
                })
            })
        });
    }
}
