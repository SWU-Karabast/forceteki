import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { KeywordName, Trait } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class WookieeRangers extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'wookiee-rangers-id',
            internalName: 'wookiee-rangers',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: `While you control another ${TextHelper.Trait.Wookiee} unit or a ${TextHelper.Trait.Kashyyyk} base, this unit gains ${TextHelper.Sentinel}`,
            condition: (context) => context.player.isTraitInPlay(Trait.Wookiee, context.source) || context.player.base.hasSomeTrait(Trait.Kashyyyk),
            matchTarget: (card, context) => card === context.source,
            ongoingEffect: abilityHelper.ongoingEffects.gainKeyword(KeywordName.Sentinel)
        });
    }
}