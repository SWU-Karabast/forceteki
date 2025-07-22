import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName, Trait } from '../../../core/Constants';

export default class FrontierATRT extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4685993945',
            internalName: 'frontier-atrt'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'Gain Ambush while you control another Vehicle unit',
            condition: (context) => context.player.isTraitInPlay(Trait.Vehicle, context.source),
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Ambush)
        });
    }
}
