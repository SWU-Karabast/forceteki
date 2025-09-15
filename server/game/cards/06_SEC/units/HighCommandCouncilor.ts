import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName, Trait } from '../../../core/Constants';

export default class HighCommandCouncilor extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'high-command-councilor-id',
            internalName: 'high-command-councilor',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'While you control another Official unit, this unit gains Raid 2',
            condition: (context) => context.player.isTraitInPlay(Trait.Official, context.source),
            matchTarget: (card, context) => card === context.source,
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Raid, amount: 2 })
        });
    }
}
