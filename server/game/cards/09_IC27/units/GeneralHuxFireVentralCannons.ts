import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName, Trait } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class GeneralHuxFireVentralCannons extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0237606783',
            internalName: 'general-hux#fire-ventral-cannons',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: `Each other friendly ${TextHelper.Trait.FirstOrder} unit gets +1/+0 and gains ${TextHelper.Overwhelm}`,
            matchTarget: (card, context) => card.isUnit() && card.controller === context.player && card !== context.source && card.hasSomeTrait(Trait.FirstOrder),
            ongoingEffect: [abilityHelper.ongoingEffects.modifyStats({ power: 1, hp: 0 }), abilityHelper.ongoingEffects.gainKeyword(KeywordName.Overwhelm)]
        });
    }
}