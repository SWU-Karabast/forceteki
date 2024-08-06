import CardAbility from '../../../CardAbility';
import { CardTypes, ConflictTypes, Players, TargetModes } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

export default class TheVoidOfWar extends DrawCard {
    static id = 'the-void-of-war';

    setupCardAbilities() {
        this.action({
            title: 'Each player bows an opponent character until refused',
            condition: (context) => context.game.isDuringConflict(ConflictTypes.Military),
            target: {
                controller: Players.Opponent,
                player: Players.Opponent,
                cardType: CardTypes.Character,
                cardCondition: (card) => card.isParticipating(),
                gameAction: AbilityDsl.actions.bow()
            },
            effect: 'bow {0}.',
            then: (context) => ({
                target: {
                    player: context.player.opponent ? Players.Opponent : Players.Self,
                    mode: TargetModes.Select,
                    activePromptTitle: "Resolve The Void of War's ability again?",
                    choices: {
                        Yes: AbilityDsl.actions.resolveAbility({
                            ability: context.ability as CardAbility,
                            player: context.player.opponent ? context.player.opponent : context.player,
                            subResolution: true,
                            choosingPlayerOverride: context.choosingPlayerOverride
                        }),
                        No: () => true
                    }
                },
                message: "{3} chooses {4}to resolve {1}'s ability again",
                messageArgs: (thenContext) => [
                    context.player.opponent ? context.player.opponent : context.player,
                    thenContext.select === 'No' ? 'not ' : ''
                ]
            })
        });
    }
}
