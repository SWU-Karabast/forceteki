import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { KeywordName } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class MilitaryAcademy extends UpgradeCard {
    protected override getImplementationId () {
        return {
            id: 'military-academy-id',
            internalName: 'military-academy',
        };
    }

    public override setupCardAbilities (registrar: IUpgradeAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addGainConstantAbilityTargetingAttached({
            title: `Friendly units gain ${TextHelper.Overwhelm}`,
            gainCondition: (context) => context.source.parentCard?.isBase(),
            matchTarget: (card, context) => card.controller === context.player,
            ongoingEffect: abilityHelper.ongoingEffects.gainKeyword(KeywordName.Overwhelm)
        });
    }
}
