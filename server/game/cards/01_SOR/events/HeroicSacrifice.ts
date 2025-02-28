import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { AbilityType, DamageType } from '../../../core/Constants';

export default class HeroicSacrifice extends EventCard {
    protected override getImplementationId() {
        return {
            id: '6954704048',
            internalName: 'heroic-sacrifice',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Draw a card',
            immediateEffect: AbilityHelper.immediateEffects.draw(),
            then: {
                title: 'Attack with a unit. For this attack, it gets +2/+0 and gains: "When this unit deals combat damage: Defeat it."',
                targetResolver: {
                    immediateEffect: AbilityHelper.immediateEffects.attack({
                        attackerLastingEffects: [
                            { effect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 }) },
                            {
                                effect: AbilityHelper.ongoingEffects.gainAbility({
                                    type: AbilityType.Triggered,
                                    title: 'When this unit deals combat damage: Defeat it.',
                                    when: {
                                        onDamageDealt: (event, context) => (
                                            event.type === DamageType.Combat &&
                                            event.damageSource.attack.attacker === context.source &&
                                            event.damageSource.damageDealtBy === context.source)
                                    },
                                    immediateEffect: AbilityHelper.immediateEffects.defeat(),
                                })
                            },
                        ],
                    }),
                },
            },
        });
    }
}
