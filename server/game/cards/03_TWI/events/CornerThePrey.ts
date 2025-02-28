import { EventCard } from '../../../core/card/EventCard';
import AbilityHelper from '../../../AbilityHelper';

export default class CornerThePrey extends EventCard {
    protected override getImplementationId() {
        return {
            id: '6476609909',
            internalName: 'corner-the-prey',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Attack with a unit. It gets +1/+0 for this attack for each damage on the defender at the start of this attack.',
            initiateAttack: {
                attackerLastingEffects: (_context, attack) =>
                    ({
                        condition: () => !attack.target.isBase(),
                        effect: AbilityHelper.ongoingEffects.modifyStats({ power: attack.target.damage, hp: 0 })
                    })
            }
        });
    }
}
