import AbilityHelper from '../../../AbilityHelper';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class FinnThisIsARescue extends LeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '9596662994',
            internalName: 'finn#this-is-a-rescue',
        };
    }

    protected override setupLeaderSideAbilities () {
        this.addActionAbility({
            title: 'Defeat a friendly upgrade on a unit',
            cost: AbilityHelper.costs.exhaustSelf(),
            targetResolver: {
                cardTypeFilter: WildcardCardType.Upgrade,
                cardCondition: (card, context) => card.controller === context.source.controller,
                immediateEffect: AbilityHelper.immediateEffects.defeat(),
            },
            ifYouDo: (ifYouDoContext) => ({
                title: 'Give a Shield token to that unit',
                immediateEffect: AbilityHelper.immediateEffects.giveShield({ target: ifYouDoContext.events[0].lastKnownInformation.parentCard }),
            })
        });
    }

    protected override setupLeaderUnitSideAbilities () {
        this.addOnAttackAbility({
            title: 'Defeat a friendly upgrade on a unit',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Upgrade,
                cardCondition: (card, context) => card.controller === context.source.controller,
                immediateEffect: AbilityHelper.immediateEffects.defeat(),
            },
            ifYouDo: (ifYouDoContext) => ({
                title: 'Give a Shield token to that unit',
                immediateEffect: AbilityHelper.immediateEffects.giveShield({ target: ifYouDoContext.events[0].lastKnownInformation.parentCard }),
            })
        });
    }
}

FinnThisIsARescue.implemented = true;
