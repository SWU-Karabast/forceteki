import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { TargetMode } from '../../../core/Constants';

export default class YodaOldMaster extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4405415770',
            internalName: 'yoda#old-master'
        };
    }

    public override setupCardAbilities() {
        this.addWhenDefeatedAbility({
            title: 'Choose any number of players to draw 1 card',
            targetResolver: {
                mode: TargetMode.MultiplePlayers,
                immediateEffect: AbilityHelper.immediateEffects.draw()
            }
        });
    }
}

YodaOldMaster.implemented = true;
