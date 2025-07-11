import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { DefeatCardSystem } from '../../../gameSystems/DefeatCardSystem';

export default class MaceWinduPartyCrasher extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5230572435',
            internalName: 'mace-windu#party-crasher',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addTriggeredAbility({
            title: 'Ready Mace Windu',
            when: {
                onCardDefeated: (event, context) =>
                    event.isDefeatedByAttacker && DefeatCardSystem.defeatSourceCard(event) === context.source
            },
            immediateEffect: AbilityHelper.immediateEffects.ready((context) => ({ target: context.source })),
        });
    }
}
