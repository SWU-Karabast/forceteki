import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class LukeSkywalkerOverplayingHisHand extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1939202085',
            internalName: 'luke-skywalker#overplaying-his-hand',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Put an enemy non-leader unit on the bottom of its owner\'s deck. Its owner draws 2 cards.',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                controller: RelativePlayer.Opponent,
                immediateEffect: abilityHelper.immediateEffects.moveToBottomOfDeck()
            },
            then: (thenContext) => ({
                title: 'Its owner draws 2 cards',
                thenCondition: (context) => context.target != null,
                immediateEffect: abilityHelper.immediateEffects.draw({ amount: 2, target: thenContext.target?.owner })
            })
        });
    }
}