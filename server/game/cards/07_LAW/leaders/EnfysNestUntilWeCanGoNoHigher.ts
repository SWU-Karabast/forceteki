import type { IAbilityHelper } from '../../../AbilityHelper';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { EventName } from '../../../core/Constants';

export default class EnfysNestUntilWeCanGoNoHigher extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'enfys-nest#until-we-can-go-no-higher-id',
            internalName: 'enfys-nest#until-we-can-go-no-higher'
        };
    }

    protected override setupLeaderSideAbilities(
        registrar: ILeaderUnitLeaderSideAbilityRegistrar,
        AbilityHelper: IAbilityHelper
    ) {
        registrar.addTriggeredAbility({
            title: 'Pay 2 resources and exhaust Enfys Nest to use the On Attack ability again',
            contextTitle: (context) => `Pay 2 resources and exhaust ${context.source.title} to use ${context.event.card.title}'s "On Attack" ability again`,
            optional: true,
            when: {
                onCardAbilityInitiated: (event, context) =>
                    event.context.player === context.player &&
                    event.ability.isOnAttackAbility &&
                    (event.ability.eventsTriggeredFor.some((event) => event.name === EventName.OnAttackDeclared) ||
                      event.context.event.name === EventName.OnAttackDeclared)
            },
            immediateEffect: AbilityHelper.immediateEffects.simultaneous((context) => [
                AbilityHelper.immediateEffects.exhaust(),
                AbilityHelper.immediateEffects.payResources({
                    amount: 2,
                    target: context.player
                })
            ]),
            ifYouDo: (ifYouDoContext) => ({
                title: `Use ${ifYouDoContext.event.card.title}'s On Attack ability again`,
                immediateEffect: AbilityHelper.immediateEffects.useOnAttackAbility({
                    target: ifYouDoContext.event.card,
                    resolvedAbilityEvent: ifYouDoContext.event
                })
            })
        });
    }

    protected override setupLeaderUnitSideAbilities(
        registrar: ILeaderUnitAbilityRegistrar,
        AbilityHelper: IAbilityHelper
    ) {
        registrar.addTriggeredAbility({
            title: 'Use the On Attack ability again',
            contextTitle: (context) => `Use ${context.event.card.title}'s "On Attack" ability again`,
            optional: true,
            limit: AbilityHelper.limit.perRound(1),
            when: {
                onCardAbilityInitiated: (event, context) =>
                    event.context.player === context.player &&
                    event.ability.isOnAttackAbility &&
                    event.context.event.name === EventName.OnAttackDeclared
            },
            immediateEffect: AbilityHelper.immediateEffects.useOnAttackAbility((context) => ({
                target: context.event.card,
                resolvedAbilityEvent: context.event
            }))
        });
    }
}