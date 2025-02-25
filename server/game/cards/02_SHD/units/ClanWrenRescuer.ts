import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class ClanWrenRescuer extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0282219568',
            internalName: 'clan-wren-rescuer',
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'Give an experience token to a unit',
            targetResolver: {
                immediateEffect: AbilityHelper.immediateEffects.giveExperience()
            }
        });
    }
}
