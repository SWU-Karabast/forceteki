import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { KeywordName, Trait } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class HuntersInstinct extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '7386366914',
            internalName: 'hunters-instinct',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addConstantAbilityTargetingAttached({
            title: `Attached unit gains ${TextHelper.Grit}`,
            condition: (context) => context.source.parentCard.hasSomeTrait(Trait.Creature),
            ongoingEffect: abilityHelper.ongoingEffects.gainKeyword(KeywordName.Grit)
        });
    }
}
