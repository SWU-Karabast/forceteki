import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName } from '../../../core/Constants';
import * as EnumHelpers from '../../../core/utils/EnumHelpers';

export default class CalculatingMagnaGuard extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1039828081',
            internalName: 'calculating-magnaguard'
        };
    }

    public override setupCardAbilities(card: this) {
        card.addTriggeredAbility({
            title: 'This unit gains Sentinel for this phase',
            when: {
                whenPlayed: true,
                onCardDefeated: (event, context) =>
                    EnumHelpers.isUnit(event.lastKnownInformation.type) &&
                    event.lastKnownInformation.controller === context.player &&
                    event.card !== context.source,
            },
            immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                effect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Sentinel)
            })
        });
    }
}

