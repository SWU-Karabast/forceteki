import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { KeywordName } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class VerdantFortress extends UpgradeCard {
    protected override getImplementationId () {
        return {
            id: 'verdant-fortress-id',
            internalName: 'verdant-fortress',
        };
    }

    public override setupCardAbilities (registrar: IUpgradeAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addGainConstantAbilityTargetingAttached({
            title: `Friendly units gain ${TextHelper.Raid(1)}`,
            gainCondition: (context) => context.source.parentCard?.isBase(),
            matchTarget: (card, context) => card.controller === context.player,
            ongoingEffect: abilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Raid, amount: 1 })
        });
    }
}
