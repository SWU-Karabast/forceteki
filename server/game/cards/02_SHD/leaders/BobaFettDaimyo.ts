import AbilityHelper from '../../../AbilityHelper';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class BobaFettDaimyo extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9334480612',
            internalName: 'boba-fett#daimyo',
        };
    }

    protected override setupLeaderSideAbilities() {
        this.addTriggeredAbility({
            title: 'Exhaust this leader',
            optional: true,
            when: {
                onCardPlayed: (event, context) =>
                    event.card.isUnit() && event.card.controller === context.source.controller && event.card.keywords.length > 0
            },
            immediateEffect: AbilityHelper.immediateEffects.exhaust(),
            ifYouDo: {
                title: 'Give a friendly unit +1/+0 for this phase',
                targetResolver: {
                    controller: RelativePlayer.Self,
                    cardTypeFilter: WildcardCardType.Unit,
                    immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                        effect: AbilityHelper.ongoingEffects.modifyStats({ power: 1, hp: 0 })
                    })
                },
            }
        });
    }

    protected override setupLeaderUnitSideAbilities() {
        this.addConstantAbility({
            title: 'Each other friendly unit that has 1 or more keywords gets +1/+0',
            targetController: RelativePlayer.Self,
            matchTarget: (card, context) => card !== context.source && card.isUnit() && card.keywords.length > 0,
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({ power: 1, hp: 0 })
        });
    }
}
