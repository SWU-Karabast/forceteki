import type { IAbilityHelper } from '../../../../../server/game/AbilityHelper';
import { NonLeaderUnitCard } from '../../../../../server/game/core/card/NonLeaderUnitCard';
import { Duration, EventName } from '../../../../../server/game/core/Constants';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';

export default class QuiGonJinnsAetherspriteGuidedByTheForce extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0661066339',
            internalName: 'quigon-jinns-aethersprite#guided-by-the-force',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'The next time you use a "When Played" ability this phase, you may use that ability again',
            immediateEffect: AbilityHelper.immediateEffects.delayedPlayerEffect({
                title: 'You may use that "When Played" ability again',
                duration: Duration.UntilEndOfPhase,
                when: {
                    onCardAbilityInitiated: (event, context) => event.context.player === context.player &&
                      event.ability.isWhenPlayed &&
                      (event.ability.eventsTriggeredFor.some((event) => event.name === EventName.OnCardPlayed) ||
                        event.context.event.name === EventName.OnCardPlayed)
                },
                immediateEffect: AbilityHelper.immediateEffects.optional({
                    title: 'Use that "When Played" ability again',
                    innerSystem: AbilityHelper.immediateEffects.useWhenPlayedAbility((context) => {
                        const event = context.events.find((event) => event.name === EventName.OnCardAbilityInitiated);
                        return {
                            target: event.card,
                            resolvedAbilityEvent: event,
                        };
                    })
                })
            })
        });
    }
}