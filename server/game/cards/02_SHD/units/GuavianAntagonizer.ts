import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class GuavianAntagonizer extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2151430798',
            internalName: 'guavian-antagonizer',
        };
    }

    public override setupCardAbilities() {
        this.addBountyAbility({
            title: 'Draw a card',
            immediateEffect: AbilityHelper.immediateEffects.draw()
        });
    }
}

GuavianAntagonizer.implemented = true;
