import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Trait } from '../../../core/Constants';

export default class MazKanataTheLightGuides extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8834515285',
            internalName: 'maz-kanata#the-light-guides',
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'Attack with a unit',
            optional: true,
            initiateAttack: {
                attackerCondition: (card) => card.hasSomeTrait(Trait.Force),
                attackerLastingEffects: {
                    effect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 }),
                }
            }
        });
    }
}
