import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class InfernoSquadWeCanGrieveLater extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: 'inferno-squad#we-can-grieve-later-id',
            internalName: 'inferno-squad#we-can-grieve-later'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Deal 1 damage to a unit and give a Weakness token to it',
            when: {
                whenPlayed: true,
                whenDefeated: true
            },
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                    AbilityHelper.immediateEffects.damage({ amount: 1 }),
                    AbilityHelper.immediateEffects.giveWeakness()
                ])
            }
        });
    }
}