import AbilityDsl from '../../../abilitydsl';
import type BaseCard from '../../../basecard';
import { CardTypes } from '../../../Constants';
import DrawCard from '../../../drawcard';
import { EventRegistrar } from '../../../EventRegistrar';

export default class CraneIndustry extends DrawCard {
    static id = 'crane-industry';

    private eventRegistrar?: EventRegistrar;
    private eventsPlayedThisConflictByThisPlayer = new Set<string>();

    public setupCardAbilities() {
        this.eventRegistrar = new EventRegistrar(this.game, this);
        this.eventRegistrar.register(['onConflictFinished', 'onCardPlayed']);
        this.reaction({
            when: {
                onConflictStarted: () => true
            },
            max: AbilityDsl.limit.perConflict(1),
            title: 'Reduce the cost to play events',
            effect: 'reduce the cost of the first copy of each event they play this conflict by 1',
            gameAction: AbilityDsl.actions.playerLastingEffect((context) => ({
                targetController: context.player,
                effect: AbilityDsl.effects.reduceCost({
                    amount: 1,
                    match: (card) => !this.hasEventBeenPlayedByThisPlayer(card)
                })
            }))
        });
    }

    public onConflictFinished() {
        this.eventsPlayedThisConflictByThisPlayer.clear();
    }

    public onCardPlayed(event: BaseCard) {
        if (event.card.type === CardTypes.Event && event.context.player === this.controller) {
            this.eventsPlayedThisConflictByThisPlayer.add(event.card.name);
        }
    }

    private hasEventBeenPlayedByThisPlayer(card: BaseCard) {
        return this.eventsPlayedThisConflictByThisPlayer.has(card.name);
    }
}
