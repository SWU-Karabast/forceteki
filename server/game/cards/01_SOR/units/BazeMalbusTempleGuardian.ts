import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName } from '../../../core/Constants';

export default class BazeMalbusTempleGuardian extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '5879557998',
            internalName: 'baze-malbus#temple-guardian'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addConstantAbility({
            title: 'While you have the initiative, this unit gains Sentinel',
            condition: (context) => context.player.hasInitiative(),
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Sentinel)
        });
    }
}
