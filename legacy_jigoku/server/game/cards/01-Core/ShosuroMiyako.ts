import { CardTypes, PlayTypes, Players, TargetModes } from '../../Constants';
import AbilityDsl = require('../../abilitydsl');
import DrawCard = require('../../drawcard');

export default class ShosuroMiyako extends DrawCard {
    static id = 'shosuro-miyako';

    public setupCardAbilities() {
        this.reaction({
            title: 'Opponent discards or dishonors',
            when: {
                onCardPlayed: (event, context) =>
                    event.player === context.player &&
                    event.playType === PlayTypes.PlayFromHand &&
                    event.card.type === CardTypes.Character &&
                    context.player.opponent !== undefined
            },
            target: {
                mode: TargetModes.Select,
                player: Players.Opponent,
                choices: {
                    'Discard at random': AbilityDsl.actions.discardAtRandom(),
                    'Dishonor a character': AbilityDsl.actions.selectCard((context) => ({
                        activePromptTitle: 'Choose a character to dishonor',
                        player: Players.Opponent,
                        controller: Players.Opponent,
                        targets: true,
                        message: '{0} chooses to dishonor {1}',
                        messageArgs: (card) => [context.player.opponent, card],
                        gameAction: AbilityDsl.actions.dishonor()
                    }))
                }
            },
            effect: 'force {1} to {2}',
            effectArgs: (context) => [context.player.opponent, context.select.toLowerCase()]
        });
    }
}
