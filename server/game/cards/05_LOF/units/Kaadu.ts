import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName, RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class Kaadu extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3893171959',
            internalName: 'kaadu'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addWhenPlayedAbility({
            optional: true,
            title: 'Give a unit overwhelm',
            targetResolver: {
                controller: RelativePlayer.Self,
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card, context) => card !== context.source,
                immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: AbilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Overwhelm })
                }),
            },
        });
    }
}