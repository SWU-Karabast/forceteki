import AbilityHelper from '../../../../../server/game/AbilityHelper';
import { NonLeaderUnitCard } from '../../../../../server/game/core/card/NonLeaderUnitCard';
import { EventName } from '../../../../../server/game/core/Constants';
import { perGame } from '../../../core/ability/AbilityLimit';

export default class QuiGonJinnsAetherspriteGuidedByTheForce extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0661066339',
            internalName: 'quigon-jinns-aethersprite#guided-by-the-force',
        };
    }

    protected override setupCardAbilities() {
        this.addOnAttackAbility({
            title: 'The next time you use a "When Played" ability this phase, you may use that ability again',
            immediateEffect: AbilityHelper.immediateEffects.delayedPlayerEffect({
                title: 'You may use that "When Played" ability again',
                optional: true,
                when: {
                    onCardAbilityInitiated: (event, context) => event.context.player === context.player &&
                      event.ability.isWhenPlayed &&
                      (event.ability.eventsTriggeredFor.some((event) => event.name === EventName.OnCardPlayed) ||
                        event.context.event.name === EventName.OnCardPlayed)
                },
                immediateEffect: AbilityHelper.immediateEffects.useWhenPlayedAbility((context) => {
                    const event = context.events.find((event) => event.name === EventName.OnCardAbilityInitiated);
                    return {
                        target: event.card,
                        resolvedAbilityEvent: event,
                    };
                }),
                limit: perGame(1)
            })
        });
    }
}