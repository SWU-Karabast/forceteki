import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { EventName } from '../../../core/Constants';

export default class ShadowCasterJustBusiness extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9033398895',
            internalName: 'shadow-caster#just-business'
        };
    }

    public override setupCardAbilities() {
        this.addTriggeredAbility({
            title: 'When a friendly unit is defeated, you may use all of its When Defeated abilities again',
            optional: true,
            when: {
                // This is technically a little incorrect from a rules perspective, but it's better for user experience
                onCardAbilityInitiated: (event, context) => event.context.player === context.player && event.ability.isWhenDefeated && (event.ability.eventsTriggeredFor.some((event) => (event.name === EventName.OnCardDefeated)))
            },
            immediateEffect: AbilityHelper.immediateEffects.useWhenDefeatedAbility((context) => ({
                target: context.event.card,
                resolvedAbilityEvent: context.event,
                triggerAll: true
            }))
        });
    }
}