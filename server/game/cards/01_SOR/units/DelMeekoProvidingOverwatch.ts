import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { CardType, RelativePlayer } from '../../../core/Constants';

export default class DelMeekoProvidingOverwatch extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9412277544',
            internalName: 'del-meeko#providing-overwatch',
        };
    }

    public override setupCardAbilities() {
        this.addConstantAbility({
            title: 'Each event an opponent plays costs 1 more',
            targetController: RelativePlayer.Opponent,
            ongoingEffect: AbilityHelper.ongoingEffects.increaseCost({
                cardTypeFilter: CardType.Event,
                amount: 1
            })
        });
    }
}
