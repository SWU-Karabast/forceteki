import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Trait } from '../../../core/Constants';

export default class BibFortunaDieWannaWanga extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2210391815',
            internalName: 'bib-fortuna#die-wanna-wanga'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Create a Credit token',
            immediateEffect: abilityHelper.immediateEffects.conditional({
                condition: (context) => context.player.isTraitInPlay(Trait.Underworld, context.source),
                onTrue: abilityHelper.immediateEffects.createCreditToken()
            })
        });
    }
}