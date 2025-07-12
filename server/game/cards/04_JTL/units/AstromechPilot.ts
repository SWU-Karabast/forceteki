import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityType, WildcardCardType } from '../../../core/Constants';
import AbilityHelper from '../../../AbilityHelper';

export default class AstromechPilot extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0511138070',
            internalName: 'astromech-pilot',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addPilotingAbility({
            title: 'Heal 2 damage from a unit',
            type: AbilityType.Triggered,
            when: {
                whenPlayed: true,
            },
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.heal({ amount: 2 })
            }
        });
    }
}