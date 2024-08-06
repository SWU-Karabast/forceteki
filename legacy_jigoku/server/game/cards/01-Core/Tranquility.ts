import AbilityDsl = require('../../abilitydsl');
import type BaseCard = require('../../basecard');
import DrawCard = require('../../drawcard');

export default class Tranquility extends DrawCard {
    static id = 'tranquility';

    public setupCardAbilities() {
        this.action({
            title: "Opponent's characters at home can't use abilities",
            condition: (context) => this.game.isDuringConflict() && context.player.opponent !== undefined,
            effect: "stop characters at {1}'s home from triggering abilities until the end of the conflict",
            effectArgs: (context) => context.player.opponent,
            gameAction: AbilityDsl.actions.cardLastingEffect((context) => ({
                target: (context.player.opponent.cardsInPlay as BaseCard[]).filter((card) => !card.isParticipating()),
                effect: AbilityDsl.effects.cardCannot('triggerAbilities')
            }))
        });
    }
}
