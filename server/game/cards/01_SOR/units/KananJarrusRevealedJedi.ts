import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { Aspect } from '../../../core/Constants';
import { EventName, Trait } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class KananJarrusRevealedJedi extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1662196707',
            internalName: 'kanan-jarrus#revealed-jedi'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: `Discard a card from the defending player's deck for each ${TextHelper.Trait.Spectre} you control. Heal 1 damage for each aspect among the discarded cards.`,
            contextTitle: (context) => {
                const count = context.player.getArenaUnits({ trait: Trait.Spectre }).length;
                return `Discard ${count} ${count === 1 ? 'card' : 'cards'} from the defending player's deck. Heal 1 damage for each aspect among the discarded cards.`;
            },
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.sequential([
                AbilityHelper.immediateEffects.discardFromDeck((context) => ({
                    amount: context.player.getArenaUnits({ trait: Trait.Spectre }).length,
                    target: context.source.activeAttack.getDefendingPlayer(),
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
