import { CardTypes, Players, TargetModes } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

export default class DaidojiOta extends DrawCard {
    static id = 'daidoji-ota';

    setupCardAbilities() {
        this.persistentEffect({
            targetController: Players.Opponent,
            condition: (context) =>
                context.player.cardsInPlay.any(
                    (card) => card.getType() === CardTypes.Character && card.isParticipating()
                ),
            effect: AbilityDsl.effects.reduceCost({
                amount: (card, player) => {
                    const dynastyMatchesByName = player.dynastyDiscardPile.filter((a) => a.name === card.name);
                    const conflictMatchesByName = player.conflictDiscardPile.filter((a) => a.name === card.name);
                    if (dynastyMatchesByName.length + conflictMatchesByName.length > 0) {
                        return -1;
                    }
                    return 0;
                },
                match: (card) => card.type === CardTypes.Event
            })
        });

        this.action({
            title: 'Have opponent discard a card or show you their hand',
            condition: (context) => context.source.isParticipating(),
            target: {
                player: Players.Opponent,
                mode: TargetModes.Select,
                choices: {
                    'Discard an event': AbilityDsl.actions.chosenDiscard({
                        cardCondition: (card) => card.type === CardTypes.Event
                    }),
                    'Reveal your hand': AbilityDsl.actions.lookAt((context) => ({
                        target: context.player.opponent.hand.sortBy((card: DrawCard) => card.name),
                        chatMessage: true,
                        message: '{0} reveals their hand: {1}',
                        messageArgs: (cards) => [context.player.opponent, cards]
                    }))
                }
            },
            effect: 'make {1}{2}',
            effectArgs: (context) =>
                context.select === 'Discard an event'
                    ? [context.player.opponent, ' discard an event']
                    : [context.player.opponent, ' reveal their hand']
        });
    }
}
