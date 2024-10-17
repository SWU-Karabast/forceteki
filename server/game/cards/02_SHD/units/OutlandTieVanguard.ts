import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class OutlandTieVanguard extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '8712779685',
            internalName: 'outland-tie-vanguard'
        };
    }

    public override setupCardAbilities () {
        this.addWhenPlayedAbility({
            title: 'Give an experience to another unit that costs 3 or less',
            targetResolver: {
                cardCondition: (card, context) => card.isUnit() && card.printedCost <= 3 && card !== context.source,
                optional: true,
                immediateEffect: AbilityHelper.immediateEffects.giveExperience()
            }
        });
    }
}

OutlandTieVanguard.implemented = true;
