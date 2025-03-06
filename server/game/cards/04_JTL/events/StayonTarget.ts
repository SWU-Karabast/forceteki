import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { Trait, AbilityType, DamageType } from '../../../core/Constants';

export default class StayonTarget extends EventCard {
    protected override getImplementationId() {
        return {
            id: '8734471238',
            internalName: 'stay-on-target',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Attack with a Vehicle unit. For this attack, it gets +2/+0 and gains: "When this unit deals damage to a base: Draw a card"',
            initiateAttack: {
                attackerCondition: (card) => card.hasSomeTrait(Trait.Vehicle),
                attackerLastingEffects: [
                    { effect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 }) },
                    {
                        effect: AbilityHelper.ongoingEffects.gainAbility({
                            type: AbilityType.Triggered,
                            title: 'When this unit deals damage to a base: Draw a card.',
                            when: {
                                onDamageDealt: (event, context) => (
                                    event.damageSource?.attack?.attacker === context.source &&
                                    ((event.type === DamageType.Combat && event.damageSource.attack.target?.isBase()) || event.type === DamageType.Overwhelm))
                            },
                            immediateEffect: AbilityHelper.immediateEffects.draw(),
                        })
                    },
                ],

            },
        });
    }
}
