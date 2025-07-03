import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Trait } from '../../../core/Constants';

export default class ResistanceXWing extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5052103576',
            internalName: 'resistance-xwing',
        };
    }

    public override setupCardAbilities(card: this) {
        card.addConstantAbility({
            title: 'While this unit has a Pilot on it, it gets +1/+1',
            condition: (context) => context.source.isUpgraded() && context.source.upgrades.some((upgrade) => upgrade.hasSomeTrait(Trait.Pilot)),
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({ power: 1, hp: 1 })
        });
    }
}
