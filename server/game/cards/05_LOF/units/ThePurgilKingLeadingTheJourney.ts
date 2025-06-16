import AbilityHelper from '../../../AbilityHelper';
import type { AbilityContext } from '../../../core/ability/AbilityContext';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class ThePurgilKingLeadingTheJourney extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2968188569',
            internalName: 'the-purrgil-king#leading-the-journey',
        };
    }

    private getDrawAmount(context: AbilityContext) {
        return context.player.getArenaUnits().filter((card) => card.remainingHp >= 7).length;
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'Draw a card for each friendly unit with 7 or more remaining HP',
            immediateEffect: AbilityHelper.immediateEffects.draw((context) => ({ amount: this.getDrawAmount(context) }))
        });
    }
}
