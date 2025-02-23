import { EventCard } from '../../../core/card/EventCard';
import { Trait, WildcardZoneName } from '../../../core/Constants';
import AbilityHelper from '../../../AbilityHelper';
import type { AbilityContext } from '../../../core/ability/AbilityContext';
import type { Card } from '../../../core/card/Card';
import { forEach } from 'underscore';
import type Player from '../../../core/Player';

export default class ExecuteOrder66 extends EventCard {
    protected override getImplementationId() {
        return {
            id: '4569767827',
            internalName: 'execute-order-66',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Deal 6 damage to each Jedi unit.',
            immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({
                amount: 6,
                target: this.getJedisInPlay(context)
            })),
            then: (thenContext) => ({
                title: 'For each unit defeated this way, its controller creates a Clone Trooper token.',
                thenCondition: () => thenContext.events.length > 0,
                immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                    this.createCloneTroopers(thenContext, thenContext.player),
                    this.createCloneTroopers(thenContext, thenContext.player.opponent)
                ])
            })
        });
    }

    private getJedisInPlay(context): Card[] {
        const playerJedis = context.player.getUnitsInPlay(WildcardZoneName.AnyArena, (card) => card.hasSomeTrait(Trait.Jedi) && card.isUnit());
        const opponentJedis = context.player.opponent.getUnitsInPlay(WildcardZoneName.AnyArena, (card) => card.hasSomeTrait(Trait.Jedi) && card.isUnit());
        return playerJedis.concat(opponentJedis);
    }

    private createCloneTroopers(thenContext: AbilityContext<Card>, player: Player) {
        let numberClones = 0;
        forEach(thenContext.events, (e) => {
            if (e.willDefeat && e.card.controller === player) {
                numberClones++;
            }
        });

        return AbilityHelper.immediateEffects.createCloneTrooper({
            amount: numberClones,
            target: player
        });
    }
}
