import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class YounglingPadawan extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0612354523',
            internalName: 'youngling-padawan',
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'The Force is with you',
            immediateEffect: AbilityHelper.immediateEffects.theForceIsWithYou()
        });
    }
}
