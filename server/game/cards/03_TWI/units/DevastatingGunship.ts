import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer } from '../../../core/Constants';

export default class DevastatingGunship extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2761325938',
            internalName: 'devastating-gunship',
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'Defeat an enemy unit with 2 or less remaining HP',
            targetResolver: {
                controller: RelativePlayer.Opponent,
                cardCondition: (card) => card.isUnit() && card.remainingHp <= 2,
                immediateEffect: AbilityHelper.immediateEffects.defeat()
            }
        });
    }
}

DevastatingGunship.implemented = true;
