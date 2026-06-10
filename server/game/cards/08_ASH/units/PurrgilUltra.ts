import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class PurrgilUltra extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3984721556',
            internalName: 'purrgil-ultra'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Return a friendly non-leader unit to its owner\'s hand',
            optional: true,
            when: {
                whenPlayed: true,
                whenDefeated: true,
            },
            targetResolver: {
                controller: RelativePlayer.Self,
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                cardCondition: (card, context) => card.isUnit() && card !== context?.source,
                immediateEffect: AbilityHelper.immediateEffects.returnToHand()
            },
            ifYouDo: (ifYouDoContext) => ({
                // TODO: Update this ability to read cost from LKI, since cards like Clone can copy
                // another card's printed attributes while in play
                title: `Deal ${ifYouDoContext.target.cost} damage to a unit`,
                targetResolver: {
                    cardTypeFilter: WildcardCardType.Unit,
                    immediateEffect: AbilityHelper.immediateEffects.damage({ amount: ifYouDoContext.target.cost }),
                }
            })
        });
    }
}