import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { DefeatCardSystem } from '../../../gameSystems/DefeatCardSystem';
import * as EnumHelpers from '../../../core/utils/EnumHelpers';

export default class ArquitensAssaultCruiser extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1086021299',
            internalName: 'arquitens-assault-cruiser',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addTriggeredAbility({
            title: 'Put the defeated unit into play as a resource under your control',
            when: {
                onCardDefeated: (event, context) =>
                    event.isDefeatedByAttacker &&
                    EnumHelpers.isNonLeaderUnit(event.lastKnownInformation.type) &&
                    DefeatCardSystem.defeatSourceCard(event) === context.source
            },
            immediateEffect: AbilityHelper.immediateEffects.resourceCard((context) => ({ target: context.event.card }))
        });
    }
}
