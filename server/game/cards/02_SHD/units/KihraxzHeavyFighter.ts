import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class KihraxzHeavyFighter extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '4721657243',
            internalName: 'kihraxz-heavy-fighter'
        };
    }

    public override setupCardAbilities () {
        this.addOnAttackAbility({
            title: 'You may exhaust another friendly unit. If you do, this unit gets +3/+0 for this attack.',
            targetResolver: {
                optional: true,
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Self,
                cardCondition: (card, context) => context.source !== card,
                immediateEffect: AbilityHelper.immediateEffects.exhaust()
            },
            ifYouDo: {
                title: 'get +3/+0 for this attack',
                immediateEffect: AbilityHelper.immediateEffects.forThisAttackCardEffect((context) => ({
                    target: context.source,
                    effect: AbilityHelper.ongoingEffects.modifyStats({ power: 3, hp: 0 }),
                }))
            }
        });
    }
}

KihraxzHeavyFighter.implemented = true;
