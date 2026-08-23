import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { RelativePlayer, Trait, WildcardCardType, WildcardRelativePlayer, ZoneName } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class BactaTank extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: 'bacta-tank-id',
            internalName: 'bacta-tank',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: `Heal up to 3 damage from a non-${TextHelper.Trait.Vehicle} unit`,
            immediateEffect: abilityHelper.immediateEffects.distributeHealingAmong({
                amountToDistribute: 3,
                controller: WildcardRelativePlayer.Any,
                canChooseNoTargets: true,
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card) => !card.hasSomeTrait(Trait.Vehicle),
                maxTargets: 1,
            }),
        });

        registrar.addActionAbility({
            title: `Put a non-${TextHelper.Trait.Vehicle} unit from your discard pile on top of your deck`,
            cost: [abilityHelper.costs.defeatSelf()],
            targetResolver: {
                zoneFilter: ZoneName.Discard,
                controller: RelativePlayer.Self,
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card) => !card.hasSomeTrait(Trait.Vehicle),
                immediateEffect: abilityHelper.immediateEffects.moveToTopOfDeck()
            }
        });
    }
}
