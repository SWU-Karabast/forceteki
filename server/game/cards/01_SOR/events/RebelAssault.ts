import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { Trait } from '../../../core/Constants';

export default class RebelAssault extends EventCard {
    protected override getImplementationId () {
        return {
            id: '8988732248',
            internalName: 'rebel-assault',
        };
    }

    public override setupCardAbilities () {
        this.setEventAbility({
            title: 'Attack with a Rebel unit. It gets +1/+0 for this attack',
            initiateAttack: {
                attackerCondition: (card) => card.hasSomeTrait(Trait.Rebel),
                attackerLastingEffects: {
                    effect: AbilityHelper.ongoingEffects.modifyStats({ power: 1, hp: 0 })
                }
            },
            then: {
                title: 'Attack with another Rebel unit. It gets +1/+0 for this attack',
                initiateAttack: {
                    attackerCondition: (card) => card.hasSomeTrait(Trait.Rebel),
                    optional: false,
                    attackerLastingEffects: {
                        effect: AbilityHelper.ongoingEffects.modifyStats({ power: 1, hp: 0 })
                    }
                }
            }
        });
    }
}

RebelAssault.implemented = true;
