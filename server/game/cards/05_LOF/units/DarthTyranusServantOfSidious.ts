import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName } from '../../../core/Constants';

export default class DarthTyranusServantOfSidious extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4347039495',
            internalName: 'darth-tyranus#servant-of-sidious'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addConstantAbility({
            title: 'While the Force is with you, this unit gains Ambush',
            condition: (context) => context.player.hasTheForce,
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Ambush)
        });
    }
}