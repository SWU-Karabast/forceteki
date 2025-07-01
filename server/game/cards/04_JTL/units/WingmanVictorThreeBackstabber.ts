import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityType, WildcardRelativePlayer } from '../../../core/Constants';

export default class WingmanVictorThreeBackstabber extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '1911230033',
            internalName: 'wingman-victor-three#backstabber',
        };
    }

    public override setupCardAbilities(card: this) {
        card.addPilotingAbility({
            type: AbilityType.Triggered,
            title: 'Give an Experience token to another unit',
            when: {
                whenPlayed: true,
            },
            optional: true,
            targetResolver: {
                activePromptTitle: 'Choose a unit to give an Experience token to',
                controller: WildcardRelativePlayer.Any,
                cardCondition: (card, context) => card !== context.source.parentCard,
                immediateEffect: AbilityHelper.immediateEffects.giveExperience()
            }
        });
    }
}