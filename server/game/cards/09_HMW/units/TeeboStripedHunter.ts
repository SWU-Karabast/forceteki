import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName, Trait } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class TeeboStripedHunter extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'teebo#striped-hunter-id',
            internalName: 'teebo#striped-hunter',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: `Other friendly ${TextHelper.Trait.Ewok} units gain ${TextHelper.Hidden}`,
            matchTarget: (card, context) =>
                card.isUnit() &&
                card.hasSomeTrait(Trait.Ewok) &&
                card.controller === context.player &&
                card !== context.source,
            ongoingEffect: abilityHelper.ongoingEffects.gainKeyword(KeywordName.Hidden)

        });
    }
}