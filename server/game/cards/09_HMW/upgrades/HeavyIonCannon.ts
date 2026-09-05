import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { WildcardCardType } from '../../../core/Constants';

export default class HeavyIonCannon extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: 'heavy-ion-cannon-id',
            internalName: 'heavy-ion-cannon',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Draw a card',
            immediateEffect: AbilityHelper.immediateEffects.draw()
        });

        registrar.addGainActionAbilityTargetingAttached({
            title: 'Deal 2 damage to a unit',
            limit: AbilityHelper.limit.perPhase(1),
            canResolveWithoutLegalTargets: true,
            cost: [AbilityHelper.costs.discardCardFromOwnHand()],
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 2 })
            },
        });
    }
}