import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType, WildcardRelativePlayer } from '../../../core/Constants';

export default class NinthSisterHulkingInquisitor extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'ninth-sister#hulking-inquisitor-id',
            internalName: 'ninth-sister#hulking-inquisitor',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'An opponent discards a card from their hand. You may deal damage equal to its cost divided as you choose among any number of units.',
            immediateEffect: AbilityHelper.immediateEffects.discardCardsFromOpponentsHand({ amount: 1 }),
            ifYouDo: (ifYouDoContext) => ({
                title: `Deal ${ifYouDoContext.events[0]?.card?.printedCost ?? 0} damage divided as you choose among any number of units`,
                optional: true,
                immediateEffect: AbilityHelper.immediateEffects.distributeDamageAmong({
                    amountToDistribute: ifYouDoContext.events[0]?.card?.printedCost ?? 0,
                    canChooseNoTargets: true,
                    controller: WildcardRelativePlayer.Any,
                    cardTypeFilter: WildcardCardType.Unit,
                })
            })
        });
    }
}
