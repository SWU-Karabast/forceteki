import AbilityDsl from '../../../abilitydsl';
import { Durations, TargetModes } from '../../../Constants';
import DrawCard from '../../../drawcard';
import type Player from '../../../player';

type Element = 'air' | 'earth' | 'fire' | 'void' | 'water';

function fluff(element: Element): string {
    switch (element) {
        case 'air':
            return 'with a glorious race they celebrate. A day of games and friendly competition, the herd and the samurai in communion!';
        case 'earth':
            return 'high in the mountains they celebrate. Around a fire, close to the stars, sharing some tasty kumis!';
        case 'fire':
            return "it's a sunny day filled with celebration. The Moto share tales of the desert!";
        case 'water':
            return 'they celebrate at the beach. A day of joyful play for the riders, and the first sight of the sea for a few foals!';
        case 'void':
            return 'with offerings at an open air shrine they celebrate. The Iuchi pay respect to Shinjo-kami, and herd is blessed for a good year!';
        default:
            '';
    }
}

export default class DayOfBrotherHorse extends DrawCard {
    static id = 'day-of-brother-horse';

    setupCardAbilities() {
        this.reaction({
            title: 'Protect a ring and draw three card',
            when: {
                onConflictPass: (event, context) =>
                    context.player === event.conflict.attackingPlayer &&
                    (context.player.cardsInPlay as DrawCard[]).some((card: DrawCard) => !card.bowed)
            },
            target: {
                mode: TargetModes.Ring,
                ringCondition: () => true
            },
            gameAction: AbilityDsl.actions.sequentialContext((context) => ({
                gameActions: [
                    AbilityDsl.actions.ringLastingEffect({
                        duration: Durations.UntilEndOfPhase,
                        target: (context.ring.getElements() as Element[]).map((element) => context.game.rings[element]),
                        effect: AbilityDsl.effects.cannotDeclareRing(
                            (player: Player) => player === context.player.opponent
                        )
                    }),
                    AbilityDsl.actions.draw({ target: context.player, amount: 3 }),
                    AbilityDsl.actions.chosenDiscard({ target: context.player })
                ]
            })),
            max: AbilityDsl.limit.perRound(1),
            effect: 'prevent {1} from declaring {0} conflicts, draw 3 cards, and discard 1 card - {2}',
            effectArgs: (context) => [context.player.opponent, fluff(context.ring.element)]
        });
    }
}