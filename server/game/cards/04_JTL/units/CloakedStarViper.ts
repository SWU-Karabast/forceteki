import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class CloakedStarViper extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1996597848',
            internalName: 'cloaked-starviper'
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'Give 2 Shield tokens to this unit',
            immediateEffect: AbilityHelper.immediateEffects.giveShield((context) => ({
                target: context.source,
                amount: 2
            }))
        });
    }
}