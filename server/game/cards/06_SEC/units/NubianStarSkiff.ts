import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName, Trait } from '../../../core/Constants';

export default class NubianStarSkiff extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7241924417',
            internalName: 'nubian-star-skiff',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'While you control an Official unit, this unit gains Restore 2',
            condition: (context) => context.player.hasSomeArenaUnit({ trait: Trait.Official }),
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Restore, amount: 2 }),
        });
    }
}
