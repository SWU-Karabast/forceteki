import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import * as EnumHelpers from '../../../core/utils/EnumHelpers.js';

export default class HK47ExclamationDieMeatbag extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2407397504',
            internalName: 'hk47#exclamation-die-meatbag',
        };
    }

    protected override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addTriggeredAbility({
            title: 'Deal 1 damage to its controller\'s base',
            when: {
                onCardDefeated: (event, context) => EnumHelpers.isUnit(event.lastKnownInformation.type) &&
                  event.lastKnownInformation.controller !== context.player
            },
            immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({
                amount: 1,
                target: context.event.lastKnownInformation.controller?.base,
            }))
        });
    }
}