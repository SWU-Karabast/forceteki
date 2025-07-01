import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName, RelativePlayer, Trait } from '../../../core/Constants';

export default class InvasionControlShip extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9937756875',
            internalName: 'invasion-control-ship',
        };
    }

    public override setupCardAbilities(card: this) {
        card.addConstantAbility({
            title: 'Friendly Droid units gain Raid 2',
            targetController: RelativePlayer.Self,
            matchTarget: (card) => card.hasSomeTrait(Trait.Droid),
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Raid, amount: 2 }),
        });
    }
}
