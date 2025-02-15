import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { AbilityType, DamageType, Trait } from '../../../core/Constants';

export default class IHaveYouNow extends EventCard {
    protected override getImplementationId() {
        return {
            id: '5667308555',
            internalName: 'i-have-you-now',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Attack with a Vehicle unit',
            initiateAttack: {
                attackerCondition: (card, context) => card.controller === context.source.controller && card.hasSomeTrait(Trait.Vehicle),
                attackerLastingEffects: [
                    { effect: AbilityHelper.ongoingEffects.gainAbility({
                        title: 'Prevent all damage that would be dealt to it during this attack',
                        type: AbilityType.ReplacementEffect,
                        when: { onDamageDealt: (event, context) => event.card === context.source && event.type === DamageType.Combat }
                    }) }]
            }
        });
    }
}