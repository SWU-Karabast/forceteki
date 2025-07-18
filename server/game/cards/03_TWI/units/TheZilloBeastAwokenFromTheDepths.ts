import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { ZoneName, PhaseName } from '../../../core/Constants';

export default class TheZilloBeastAwokenFromTheDepths extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '0216922902',
            internalName: 'the-zillo-beast#awoken-from-the-depths',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Give each enemy ground unit -5/-0 for this phase',
            immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect((context) => ({
                target: context.player.opponent.getArenaUnits({ arena: ZoneName.GroundArena }),
                effect: AbilityHelper.ongoingEffects.modifyStats({ power: -5, hp: 0 })
            })),
        });

        registrar.addTriggeredAbility({
            title: 'Heal 5 damage from The Zillo Beast',
            when: {
                onPhaseStarted: (context) => context.phase === PhaseName.Regroup
            },
            immediateEffect: AbilityHelper.immediateEffects.heal({ amount: 5 })
        });
    }
}
