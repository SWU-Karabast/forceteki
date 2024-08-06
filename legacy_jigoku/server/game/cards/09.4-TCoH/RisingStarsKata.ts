import { CardTypes, Durations } from '../../Constants';
import { EventRegistrar } from '../../EventRegistrar';
import AbilityDsl = require('../../abilitydsl');
import BaseCard = require('../../basecard');
import DrawCard = require('../../drawcard');

export default class RisingStarsKata extends DrawCard {
    static id = 'rising-stars-kata';

    private duelWinnersThisConflict = new Set<BaseCard>();

    public setupCardAbilities() {
        this.eventRegistrar = new EventRegistrar(this.game, this);
        this.eventRegistrar.register(['onConflictFinished', 'afterDuel']);

        this.action({
            title: 'Give a participating unique character +3 military skill',
            condition: (context) => context.game.isDuringConflict(),
            target: {
                cardType: CardTypes.Character,
                cardCondition: (card) => card.isUnique() && card.isParticipating(),
                gameAction: AbilityDsl.actions.cardLastingEffect((context) => ({
                    duration: Durations.UntilEndOfConflict,
                    effect: this.duelWinnersThisConflict.has(context.target)
                        ? AbilityDsl.effects.modifyMilitarySkill(5)
                        : AbilityDsl.effects.modifyMilitarySkill(3)
                }))
            },
            effect: 'give {0} +{1} {2} skill until the end of the conflict',
            effectArgs: (context) => [this.duelWinnersThisConflict.has(context.target) ? 5 : 3, 'military'],
            max: AbilityDsl.limit.perConflict(1)
        });
    }

    public onConflictFinished() {
        this.duelWinnersThisConflict.clear();
    }

    public afterDuel(event: any) {
        if (event.duel.winner) {
            const winners: BaseCard[] = Array.isArray(event.duel.winner) ? event.duel.winner : [event.duel.winner];
            winners.forEach((duelWinner) => this.duelWinnersThisConflict.add(duelWinner));
        }
    }
}
