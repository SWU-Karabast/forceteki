import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { Trait, WildcardCardType, ZoneName } from '../../../core/Constants';

export default class AdventurerSniperRifle extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '0201864172',
            internalName: 'adventurer-sniper-rifle',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setAttachCondition((context) => !context.attachTarget.hasSomeTrait(Trait.Vehicle));

        registrar.addGainActionAbilityTargetingAttached({
            title: 'Choose an undamaged non-leader ground unit. Its printed HP is considered to be 1 for this phase',
            cost: AbilityHelper.costs.exhaustSelf(),
            targetResolver: {
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                zoneFilter: ZoneName.GroundArena,
                cardCondition: (card) => card.isUnit() && card.damage === 0,
                immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: AbilityHelper.ongoingEffects.overridePrintedAttributes({
                        printedHp: 1
                    })
                })
            }
        });
    }
}