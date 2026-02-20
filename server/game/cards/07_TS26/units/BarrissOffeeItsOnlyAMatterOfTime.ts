import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class BarrissOffeeItsOnlyAMatterOfTime extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4835794061',
            internalName: 'barriss-offee#its-only-a-matter-of-time',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Give an Experience token to Barriss Offee',
            when: {
                onAttackDeclared: (event, context) => event.attack.attacker.controller !== context.player,

            },
            optional: true,
            immediateEffect: abilityHelper.immediateEffects.giveExperience((context) => ({ target: context.source }))
        });
    }
}