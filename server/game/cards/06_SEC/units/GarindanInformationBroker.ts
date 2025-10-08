import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { TargetMode } from '../../../core/Constants';

export default class GarindanInformationBroker extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'garindan#information-broker-id',
            internalName: 'garindan#information-broker',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Name a card, look at opponent\'s hand, and discard a card with that name',
            targetResolver: {
                mode: TargetMode.DropdownList,
                options: this.game.playableCardTitles,
                condition: (context) => context.player.opponent.hand.length > 0   // skip ability if opponent has no cards in hand
            },
            then: (thenContext) => ({
                title: 'Look at opponent\'s hand and discard a card with that name from it',
                thenCondition: (context) => context.player.opponent.hand.length > 0,   // skip ability if opponent has no cards in hand
                immediateEffect: abilityHelper.immediateEffects.lookAtAndSelectCard((context) => ({
                    target: context.player.opponent.hand,
                    useDisplayPrompt: true,
                    canChooseFewer: false,
                    immediateEffect: abilityHelper.immediateEffects.discardSpecificCard(),
                    cardCondition: (card) => card.title === thenContext.select,
                })),
            })
        });
    }
}
