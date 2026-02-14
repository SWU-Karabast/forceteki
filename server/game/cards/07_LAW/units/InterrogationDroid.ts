import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class InterrogationDroid extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '9623555910',
            internalName: 'interrogation-droid'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Exhaust an enemy unit. If you do, and that costs 3 or less, its owner discards a card from their hand',
            targetResolver: {
                controller: RelativePlayer.Opponent,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.exhaust()
            },
            ifYouDo: (ifYouDoContext) => ({
                title: 'If that unit costs 3 or less, its owner discards a card from their hand',
                ifYouDoCondition: (ifYouDoContext) => ifYouDoContext?.target.cost <= 3,
                immediateEffect: AbilityHelper.immediateEffects.discardCardsFromOwnHand({
                    target: ifYouDoContext.target.controller,
                    amount: 1
                }),
            })
        });
    }
}