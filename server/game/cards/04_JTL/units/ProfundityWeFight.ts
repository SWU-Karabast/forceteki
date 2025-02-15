import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { TargetMode } from '../../../core/Constants';

export default class ProfundityWeFight extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '7072861308',
            internalName: 'profundity#we-fight',
        };
    }

    public override setupCardAbilities () {
        this.addTriggeredAbility({
            title: 'Make a player discard a card from their hand',
            when: {
                onCardPlayed: (event, context) => event.card === context.source,
                onCardDefeated: (event, context) => event.card === context.source,
            },
            targetResolver: {
                activePromptTitle: 'Choose a player to discard a card from their hand',
                mode: TargetMode.Player,
                immediateEffect: AbilityHelper.immediateEffects.discardCardsFromOwnHand({ amount: 1 })
            },
            then: (thenContext) => ({
                title: `${thenContext.target} discards a card from their hand`,
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: (context) => thenContext.target.hand.length > context.player.hand.length,
                    onTrue: AbilityHelper.immediateEffects.discardCardsFromOwnHand({ amount: 1 }),
                    onFalse: AbilityHelper.immediateEffects.noAction(),
                }),
            }),
        });
    }
}
