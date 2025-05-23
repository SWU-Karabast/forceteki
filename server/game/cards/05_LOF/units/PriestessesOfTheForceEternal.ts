import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { TargetMode, WildcardCardType } from '../../../core/Constants';

export default class PriestessesOfTheForceEternal extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'priestesses-of-the-force#eternal-id',
            internalName: 'priestesses-of-the-force#eternal'
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'Use the Force to give a shield token to each of up to 5 units',
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.useTheForce(),
            ifYouDo: {
                title: 'Give a shield token to each of up to 5 units',
                targetResolver: {
                    mode: TargetMode.UpTo,
                    numCards: 5,
                    cardTypeFilter: WildcardCardType.Unit,
                    immediateEffect: AbilityHelper.immediateEffects.giveShield(),
                },
            }
        });
    }
}
