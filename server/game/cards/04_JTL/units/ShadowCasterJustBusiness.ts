import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

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
                onCardDefeated: (event, context) => event.card.controller === context.player && event.card.isUnit()
            },
            immediateEffect: AbilityHelper.immediateEffects.useWhenDefeatedAbility((context) => ({
                target: context.event.card,
                resolvedAbilityEvent: context.event,
                triggerAll: true
            }))
        });
    }
}