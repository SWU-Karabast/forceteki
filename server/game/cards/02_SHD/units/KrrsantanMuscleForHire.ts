import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName, WildcardCardType, ZoneName } from '../../../core/Constants';

export default class KrrsantanMuscleForHire extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3622749641',
            internalName: 'krrsantan#muscle-for-hire',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Ready this unit',
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => context.player.opponent.hasSomeArenaUnit({ keyword: KeywordName.Bounty }),
                onTrue: AbilityHelper.immediateEffects.ready(),
            })
        });

        registrar.addOnAttackAbility({
            title: 'Deal 1 damage to a unit for each damage on this unit',
            optional: true,
            targetResolver: {
                zoneFilter: ZoneName.GroundArena,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({
                    amount: context.source.damage
                }))
            }
        });
    }
}
