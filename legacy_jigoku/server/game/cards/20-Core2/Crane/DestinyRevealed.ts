import { CardTypes, Players } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';
import { Duel } from '../../../Duel';

export default class DestinyRevealed extends DrawCard {
    static id = 'destiny-revealed';

    setupCardAbilities() {
        this.duelStrike({
            title: 'Place a fate on a character',
            duelCondition: (duel, context) => duel.winnerController === context.player,
            gameAction: AbilityDsl.actions.sequentialContext((context) => {
                let firstTarget = undefined;
                const duel: Duel = (context as any).event.duel;
                const twoFate = duel.loser?.some((card) => card.isUnique()) && duel.finalDifference >= 4;

                let placeFateOnDuelist = AbilityDsl.actions.selectCard((context) => ({
                    activePromptTitle: 'Choose a duel participant',
                    hidePromptIfSingleCard: true,
                    cardType: CardTypes.Character,
                    controller: Players.Self,
                    cardCondition: (card) => duel.isInvolved(card),
                    message: '{0} places a fate on {1}',
                    messageArgs: (cards) => [context.player, cards],
                    subActionProperties: (card) => {
                        context.target = card;
                        firstTarget = card;
                    },
                    gameAction: AbilityDsl.actions.placeFate(() => ({
                        target: firstTarget
                    }))
                }));

                let placeFateOnOther = AbilityDsl.actions.selectCard((context) => ({
                    activePromptTitle: 'Choose another character',
                    cardType: CardTypes.Character,
                    controller: Players.Self,
                    cardCondition: (card) => card !== firstTarget,
                    message: '{0} places a fate on {1}',
                    messageArgs: (cards) => [context.player, cards],
                    gameAction: AbilityDsl.actions.placeFate()
                }));

                let gameActions = [placeFateOnDuelist];
                if (twoFate) {
                    gameActions.push(placeFateOnOther);
                }
                return { gameActions };
            }),
            effect: 'place a fate on their duelist'
        });

        this.wouldInterrupt({
            title: 'Cancel a ring effect',
            when: {
                onMoveFate: (event, context) =>
                    event.context.source.type === 'ring' &&
                    event.origin?.controller === context.player &&
                    event.fate > 0,
                onCardHonored: (event, context) =>
                    event.card?.controller === context.player && event.context.source.type === 'ring',
                onCardDishonored: (event, context) =>
                    event.card?.controller === context.player && event.context.source.type === 'ring',
                onCardBowed: (event, context) =>
                    event.card?.controller === context.player && event.context.source.type === 'ring',
                onCardReadied: (event, context) =>
                    event.card?.controller === context.player && event.context.source.type === 'ring'
            },
            gameAction: AbilityDsl.actions.cancel(),
            effect: 'cancel the effects of the {1}',
            effectArgs: (context) => [context.event.context.source]
        });
    }
}
