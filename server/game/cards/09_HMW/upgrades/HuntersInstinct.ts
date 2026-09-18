import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { KeywordName, Trait } from '../../../core/Constants';

export default class HuntersInstinct extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '7386366914',
            internalName: 'hunters-instinct',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addGainKeywordTargetingAttached({
            keyword: KeywordName.Grit,
            gainCondition: (context) => context.source.parentCard.hasSomeTrait(Trait.Creature),
        });
    }
}
