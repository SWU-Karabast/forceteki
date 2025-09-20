import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { KeywordName } from '../../../core/Constants';
import type { Card } from '../../../core/card/Card';

export default class FigureOfUnity extends UpgradeCard {
    protected override getImplementationId () {
        return {
            id: 'figure-of-unity-id',
            internalName: 'figure-of-unity',
        };
    }

    public override canAttach (targetCard: Card): boolean {
        return targetCard.isUnit() && targetCard.unique;
    }

    public override setupCardAbilities (registrar: IUpgradeAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addGainConstantAbilityTargetingAttached({
            title: 'While this unit is ready, each other friendly unit gains Overwhelm, Raid 1, and Restore 1',
            condition: (context) => !context.source.exhausted,
            matchTarget: (card, context) => card !== context.source && card.controller === context.player,
            ongoingEffect: [
                abilityHelper.ongoingEffects.gainKeyword(KeywordName.Overwhelm),
                abilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Raid, amount: 1 }),
                abilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Restore, amount: 1 }),
            ]
        });
    }
}
