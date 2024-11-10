import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName } from '../../../core/Constants';

export default class TrandoshanHunters extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1743599390',
            internalName: 'trandoshan-hunters',
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'If an enemy unit has a Bounty, give an Experience token to this unit',
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => context.source.controller.opponent.isKeywordInPlay(KeywordName.Bounty),
                onTrue: AbilityHelper.immediateEffects.giveExperience(),
                onFalse: AbilityHelper.immediateEffects.noAction()
            })
        });
    }
}

TrandoshanHunters.implemented = true;
