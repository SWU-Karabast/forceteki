import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { CardType, RelativePlayer } from '../../../core/Constants';

export default class ShaakTiUnityWinsWars extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1314547987',
            internalName: 'shaak-ti#unity-wins-wars'
        };
    }

    protected override setupCardAbilities() {
        this.addConstantAbility({
            title: 'Each friendly token unit gets +1/+0.',
            targetController: RelativePlayer.Self,
            targetCardTypeFilter: CardType.TokenUnit,
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({ power: 1, hp: 0 })
        });

        this.addOnAttackAbility({
            title: 'Create a Clone Trooper token.',
            immediateEffect: AbilityHelper.immediateEffects.createCloneTrooper()
        });
    }
}

ShaakTiUnityWinsWars.implemented = true;
