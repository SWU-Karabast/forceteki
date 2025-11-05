import type { IAbilityHelper } from '../../../AbilityHelper';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { EventName } from '../../../core/Constants';

export default class GrandAdmiralThrawnHowUnfortunate extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5846322081',
            internalName: 'grand-admiral-thrawn#how-unfortunate',
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        const title = 'Exhaust Grand Admiral Thrawn to use the When Defeated ability again';

        registrar.addTriggeredAbility({
            title: title,
            contextTitle: (context) => (context.event
                ? `Exhaust ${context.source.title} to use ${context.event.card.title}'s "When Defeated" ability again`
                : title),
            optional: true,
            when: {
                onCardAbilityInitiated: (event, context) => event.context.player === context.player && event.ability.isWhenDefeated && (event.ability.eventsTriggeredFor.some((event) => (event.name === EventName.OnCardDefeated)) || event.context.event.name === EventName.OnCardDefeated)
            },
            immediateEffect: AbilityHelper.immediateEffects.exhaust(),
            ifYouDo: (ifYouDoContext) => ({
                title: `Use ${ifYouDoContext.event.card.title}'s When Defeated ability again`,
                immediateEffect: AbilityHelper.immediateEffects.useWhenDefeatedAbility(() => {
                    return {
                        target: ifYouDoContext.event.card,
                        resolvedAbilityEvent: ifYouDoContext.event
                    };
                })
            })
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        const title = 'Use the When Defeated ability again';
        registrar.addTriggeredAbility({
            title: title,
            contextTitle: (context) => (context.event
                ? `Use ${context.event.card.title}'s "When Defeated" ability again`
                : title),
            optional: true,
            when: {
                onCardAbilityInitiated: (event, context) => event.context.player === context.player && event.ability.isWhenDefeated && (event.ability.eventsTriggeredFor.some((event) => (event.name === EventName.OnCardDefeated)) || event.context.event.name === EventName.OnCardDefeated)
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