import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName } from '../../../core/Constants';

export default class PloKoonIDontBelieveInChance extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2352895392',
            internalName: 'plo-koon#i-dont-believe-in-chance',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'While the Force is with you, this unit gains Grit',
            condition: (context) => context.player.hasTheForce,
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Grit),
        });
    }
}