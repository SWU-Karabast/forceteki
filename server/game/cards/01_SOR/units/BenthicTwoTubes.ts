import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect, KeywordName, RelativePlayer } from '../../../core/Constants';

export default class BenthicTwoTubes extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '0256267292',
            internalName: 'benthic-two-tubes#partisan-lieutenant',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Give Raid 2 to a friendly Aggression unit',
            targetResolver: {
                controller: RelativePlayer.Self,
                cardCondition: (card, context) => card !== context.source && card.isUnit() && card.hasSomeAspect(Aspect.Aggression),
                immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: AbilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Raid, amount: 2 })
                }),
            }
        });
    }
}
