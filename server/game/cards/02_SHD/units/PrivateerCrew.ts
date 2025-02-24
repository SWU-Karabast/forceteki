import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { PlayType } from '../../../core/Constants';

export default class PrivateerCrew extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2288926269',
            internalName: 'privateer-crew',
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'Give 3 experience tokens to this unit',
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => context.event.playType === PlayType.Smuggle,
                onTrue: AbilityHelper.immediateEffects.giveExperience((context) => ({
                    amount: 3,
                    target: context.source
                })),
            })
        });
    }
}
