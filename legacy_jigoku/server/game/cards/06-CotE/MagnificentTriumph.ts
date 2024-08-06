import { CardTypes, Players } from '../../Constants';
import type { Duel } from '../../Duel';
import { EventRegistrar } from '../../EventRegistrar';
import AbilityDsl from '../../abilitydsl';
import type BaseCard from '../../basecard';
import DrawCard from '../../drawcard';

export default class MagnificentTriumph extends DrawCard {
    static id = 'magnificent-triumph';

    #duelWinnersThisConflict = new Set<BaseCard>();

    public setupCardAbilities() {
        this.eventRegistrar = new EventRegistrar(this.game, this);
        this.eventRegistrar.register(['onConflictFinished', 'afterDuel']);
        this.action({
            title: 'Give a character +2/+2',
            condition: () => this.game.isDuringConflict(),
            target: {
                cardType: CardTypes.Character,
                controller: Players.Any,
                cardCondition: (card) => this.#duelWinnersThisConflict.has(card),
                gameAction: AbilityDsl.actions.cardLastingEffect((context) => ({
                    effect: [
                        AbilityDsl.effects.modifyBothSkills(2),
                        AbilityDsl.effects.cardCannot({
                            cannot: 'target',
                            restricts: 'opponentsEvents',
                            applyingPlayer: context.player
                        })
                    ]
                }))
            },
            effect: "give {0} +2{1}, +2{2}, and prevent them from being targeted by opponent's events",
            effectArgs: () => ['military', 'political']
        });
    }

    public onConflictFinished() {
        this.#duelWinnersThisConflict.clear();
    }

    public afterDuel(event: any) {
        for (const winner of (event.duel as Duel).winner ?? []) {
            this.#duelWinnersThisConflict.add(winner);
        }
    }
}
