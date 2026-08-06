import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class DarthTyranusServantOfSidious extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4347039495',
            internalName: 'darth-tyranus#servant-of-sidious'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: `While the Force is with you, this unit gains ${TextHelper.Ambush}`,
            condition: (context) => context.player.hasTheForce,
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Ambush)
        });
    }
}