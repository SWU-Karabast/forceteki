import { CardTypes, DuelTypes, Players } from '../../Constants';
import AbilityDsl from '../../abilitydsl';
import DrawCard from '../../drawcard';

export default class TaryuJiai extends DrawCard {
    static id = 'taryu-jiai';

    setupCardAbilities() {
        this.action({
            title: 'Initiate a glory duel between two shugenja',
            condition: () => this.game.isDuringConflict(),
            targets: {
                myShugenja: {
                    activePromptTitle: 'Choose a friendly shugenja',
                    controller: Players.Self,
                    cardType: CardTypes.Character,
                    cardCondition: (card) => card.hasTrait('shugenja')
                },
                oppShugenja: {
                    dependsOn: 'myShugenja',
                    activePromptTitle: 'Choose an opposing shugenja',
                    controller: Players.Opponent,
                    cardType: CardTypes.Character,
                    cardCondition: (card) => card.hasTrait('shugenja'),
                    gameAction: AbilityDsl.actions.duel((context) => ({
                        type: DuelTypes.Glory,
                        challenger: context.targets.myShugenja,
                        message: '{0} chooses a ring effect to resolve',
                        messageArgs: (duel) => duel.winnerController,
                        gameAction: (duel) =>
                            AbilityDsl.actions.selectRing({
                                activePromptTitle: 'Choose a ring effect to resolve',
                                player: duel.winnerController === context.player ? Players.Self : Players.Opponent,
                                ringCondition: () => (duel.winner?.length ?? 0) > 0,
                                targets: true,
                                message: "{0} chooses to resolve {1}'s effect",
                                messageArgs: (ring) => [duel.winnerController, ring],
                                gameAction: AbilityDsl.actions.resolveRingEffect({
                                    player: duel.winnerController
                                })
                            })
                    }))
                }
            }
        });
    }
}
