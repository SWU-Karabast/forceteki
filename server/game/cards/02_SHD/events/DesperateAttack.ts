import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';

export default class DesperateAttack extends EventCard {
    protected override getImplementationId () {
        return {
            id: '6962053552',
            internalName: 'desperate-attack',
        };
    }

    public override setupCardAbilities () {
        this.setEventAbility({
            title: 'Attack with a damaged unit. It gets +2/+0 for this attack',
            targetResolver: {
                cardCondition: (card) => card.isUnit() && card.damage !== 0,
                immediateEffect: AbilityHelper.immediateEffects.attack({
                    attackerLastingEffects: { effect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 }) }
                })
            }
        });
    }
}

DesperateAttack.implemented = true;
