import { EventCard } from '../../../core/card/EventCard';
import AbilityHelper from '../../../AbilityHelper';
import { Attack } from '../../../core/attack/Attack';

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
                attackerLastingEffects: [
                    {
                        condition: (attack: Attack) => !attack.target.isBase(),
                        effect: (attack: Attack) => {
                            const damageOnDefender = attack.target.damage;
                            return AbilityHelper.ongoingEffects.modifyStats({ power: damageOnDefender, hp: 0 });
                        }
                    }
                ]
            }
        });
    }
}

CornerThePrey.implemented = true;
