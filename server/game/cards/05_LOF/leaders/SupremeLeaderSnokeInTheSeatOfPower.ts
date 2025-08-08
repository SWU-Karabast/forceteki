import type { IAbilityHelper } from '../../../AbilityHelper';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { Aspect, RelativePlayer, WildcardCardType } from '../../../core/Constants';
import type { GameSystem } from '../../../core/gameSystem/GameSystem';
import type { TriggeredAbilityContext } from '../../../core/ability/TriggeredAbilityContext';

export default class SupremeLeaderSnokeInTheSeatOfPower extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9919167831',
            internalName: 'supreme-leader-snoke#in-the-seat-of-power',
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Give an Experience token to the unit with the most power among Villainy units',
            cost: [AbilityHelper.costs.abilityActivationResourceCost(1), AbilityHelper.costs.exhaustSelf()],
            immediateEffect: this.buildSnokeAbility(AbilityHelper),
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Give an Experience token to the unit with the most power among Villainy units',
            immediateEffect: this.buildSnokeAbility(AbilityHelper),
        });
    }

    private buildSnokeAbility(AbilityHelper: IAbilityHelper): GameSystem<TriggeredAbilityContext<this>> {
        return AbilityHelper.immediateEffects.conditional((context) => {
            const villainyUnits = context.player.getArenaUnits({ aspect: Aspect.Villainy });
            const maxPower = villainyUnits.map((x) => x.getPower()).reduce((p, c) => (p > c ? p : c), 0);

            return {
                condition: villainyUnits.filter((x) => x.getPower() === maxPower).length > 1,
                onTrue: AbilityHelper.immediateEffects.selectCard({
                    cardTypeFilter: WildcardCardType.Unit,
                    controller: RelativePlayer.Self,
                    cardCondition: (card) => {
                        return card.isUnit() && card.hasSomeAspect(Aspect.Villainy) && card.getPower() === maxPower;
                    },
                    immediateEffect: AbilityHelper.immediateEffects.giveExperience()
                }),
                onFalse: AbilityHelper.immediateEffects.giveExperience({
                    target: villainyUnits.find((x) => x.getPower() === maxPower)
                })
            };
        });
    }
}