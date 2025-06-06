import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { Trait } from '../../../core/Constants';

export default class Pounce extends EventCard {
    protected override getImplementationId () {
        return {
            id: '3591040205',
            internalName: 'pounce',
        };
    }

    public override setupCardAbilities () {
        this.setEventAbility({
            title: 'Attack with a Creature unit. It gets +4/+0 for this attack',
            initiateAttack: {
                attackerCondition: (card) => card.hasSomeTrait(Trait.Creature),
                attackerLastingEffects: {
                    effect: AbilityHelper.ongoingEffects.modifyStats({ power: 4, hp: 0 })
                }
            }
        });
    }
}
