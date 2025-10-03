import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { KeywordName } from '../../../core/Constants';

export default class DisciplesDevotion extends UpgradeCard {
    protected override getImplementationId () {
        return {
            id: '0217687208',
            internalName: 'disciples-devotion',
        };
    }

    public override setupCardAbilities (registrar: IUpgradeAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addConstantAbilityTargetingAttached({
            title: 'While attached unit is exhausted, it gains Sentinel',
            condition: (context) => context.source.parentCard.exhausted,
            ongoingEffect: abilityHelper.ongoingEffects.gainKeyword(KeywordName.Sentinel)
        });
    }
}
