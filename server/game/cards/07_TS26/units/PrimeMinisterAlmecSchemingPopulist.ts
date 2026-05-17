import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class PrimeMinisterAlmecSchemingPopulist extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8042667309',
            internalName: 'prime-minister-almec#scheming-populist',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Give a friendly unit +2/+2 for this phase. Exhaust each enemy unit in its arena with less power than it',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Self,
                immediateEffect: abilityHelper.immediateEffects.sequential([
                    abilityHelper.immediateEffects.forThisPhaseCardEffect({
                        effect: abilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 2 })
                    }),
                    abilityHelper.immediateEffects.exhaust((context) => ({
                        target: context.player.opponent.getArenaUnits({
                            arena: context.target.zoneName,
                            condition: (c) => c.isUnit() && c.getPower() < context.target.getPower()
                        }),
                    }))
                ])
            }
        });
    }
}