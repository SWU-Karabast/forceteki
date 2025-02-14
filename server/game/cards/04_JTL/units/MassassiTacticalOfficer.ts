import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Trait } from '../../../core/Constants';

export default class MassassiTacticalOfficer extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '6600603122',
            internalName: 'massassi-tactical-officer',
        };
    }

    public override setupCardAbilities () {
        this.addActionAbility({
            title: 'Attack with a Fighter unit. It get +2/+0 for this attack',
            cost: AbilityHelper.costs.exhaustSelf(),
            initiateAttack: {
                attackerCondition: (card) => card.hasSomeTrait(Trait.Fighter),
                attackerLastingEffects: {
                    effect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 }),
                }
            }
        });
    }
}
