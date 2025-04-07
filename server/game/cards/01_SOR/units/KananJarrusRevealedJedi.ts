import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { Aspect } from '../../../core/Constants';
import { EventName, Trait } from '../../../core/Constants';

export default class KananJarrusRevealedJedi extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1662196707',
            internalName: 'kanan-jarrus#revealed-jedi'
        };
    }

    public override setupCardAbilities() {
        this.addOnAttackAbility({
            title: 'Discard a card from the defending player\'s deck for each Spectre you control. Heal 1 damage for each aspect among the discarded cards.',
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.sequential([
                AbilityHelper.immediateEffects.discardFromDeck((context) => ({
                    amount: context.player.getArenaUnits({ trait: Trait.Spectre }).length,
                    target: context.source.activeAttack.getSingleTarget().controller
                })),
                AbilityHelper.immediateEffects.heal((context) => ({
                    target: context.player.base,
                    amount: this.getAspectCountFromEvents(context.events)
                }))
            ])
        });
    }

    private getAspectCountFromEvents(events: any[]): number {
        const aspects = new Set<Aspect>();
        const discardedCards = events.filter((event) => event.name === EventName.OnCardDiscarded).map((event) => event.card);
        for (const card of discardedCards) {
            card.aspects.forEach((aspect) => aspects.add(aspect));
        }
        return aspects.size;
    }
}
