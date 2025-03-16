import AbilityHelper from '../../../AbilityHelper';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';

export default class GrandAdmiralThrawnHowUnfortunate extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5846322081',
            internalName: 'grand-admiral-thrawn#how-unfortunate',
        };
    }

    protected override setupLeaderSideAbilities() {
        this.addTriggeredAbility({
            title: 'Exhaust this leader',
            optional: true,
            when: {
                onCardAbilityInitiated: (event, context) => event.context.player === context.player && event.ability.isWhenDefeated && event.ability.eventsTriggeredFor.some((event) => event.name === EventName.OnCardDefeated);
            },
            immediateEffect: AbilityHelper.immediateEffects.exhaust(),
            ifYouDo: (ifYouDoContext) => ({
                title: 'Use When Defeated ability again',
                immediateEffect: AbilityHelper.immediateEffects.useWhenDefeatedAbility(() => {
                    return {
                        target: ifYouDoContext.event.card,
                        resolvedAbilityEvent: ifYouDoContext.event
                    };
                })
            })
        });
    }

    protected override setupLeaderUnitSideAbilities() {
        this.addTriggeredAbility({
            title: 'Use When Defeated ability again',
            optional: true,
            when: {
                onCardAbilityInitiated: (event, context) => event.context.player === context.player && event.ability.isWhenDefeated
            },
            immediateEffect: AbilityHelper.immediateEffects.useWhenDefeatedAbility((context) => {
                return {
                    target: context.event.card,
                    resolvedAbilityEvent: context.event
                };
            }),
            limit: AbilityHelper.limit.perRound(1)
        });
    }
}