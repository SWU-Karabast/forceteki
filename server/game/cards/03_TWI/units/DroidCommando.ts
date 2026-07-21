import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName, Trait } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class DroidCommando extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6999668340',
            internalName: 'droid-commando'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: `While you control another ${TextHelper.Trait.Separatist} unit, this unit gains ${TextHelper.Ambush}`,
            condition: (context) => context.player.isTraitInPlay(Trait.Separatist, context.source),
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Ambush)
        });
    }
}
