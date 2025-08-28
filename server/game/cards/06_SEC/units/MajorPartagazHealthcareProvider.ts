import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { EventName, Trait } from '../../../core/Constants';

export default class MajorPartagazHealthcareProvider extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'major-partagaz#healthcare-provider-id',
            internalName: 'major-partagaz#healthcare-provider',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'When another friendly Official unit attacks: This unit gets +2/+2 for this phase.',
            when: {
                [EventName.OnAttackDeclared]: (event, context) =>
                    event.attack.attacker !== context.source &&
                    event.attack.attacker.controller === context.player &&
                    event.attack.attacker.isUnit() &&
                    event.attack.attacker.hasSomeTrait(Trait.Official)
            },
            immediateEffect: abilityHelper.immediateEffects.forThisPhaseCardEffect({
                effect: abilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 2 })
            })
        });
    }
}
