import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Trait } from '../../../core/Constants';

export default class RepublicTacticalOfficer extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2395430106',
            internalName: 'republic-tactical-officer',
        };
    }

    protected override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'You may attack with a Republic unit. It gets +2/+0 for this attack.',
            optional: true,
            initiateAttack: {
                attackerCondition: (card) => card.hasSomeTrait(Trait.Republic),
                attackerLastingEffects: {
                    effect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 }),
                }
            }
        });
    }
}

RepublicTacticalOfficer.implemented = true;
