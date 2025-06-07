import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Trait } from '../../../core/Constants';

export default class BabuFrikHeyyy extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6501780064',
            internalName: 'babu-frik#heyyy',
        };
    }

    public override setupCardAbilities() {
        this.addActionAbility({
            title: 'Give a Shield token to a unit with Sentinel',
            cost: AbilityHelper.costs.exhaustSelf(),
            optional: true,
            initiateAttack: {
                attackerCondition: (card) => card.hasSomeTrait(Trait.Droid),
                attackerLastingEffects: {
                    effect: AbilityHelper.ongoingEffects.modifyStats((context) => ({
                        power: context.source.remainingHp - context.source.getPower(),
                        hp: 0
                    })),
                }
            }
        });
    }
}