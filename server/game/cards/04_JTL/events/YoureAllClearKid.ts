import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { RelativePlayer, WildcardCardType, ZoneName } from '../../../core/Constants';

export default class YoureAllClearKid extends EventCard {
    protected override getImplementationId() {
        return {
            id: '5834478243',
            internalName: 'youre-all-clear-kid',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Defeat a non-leader Vehicle unit',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                zoneFilter: ZoneName.SpaceArena,
                controller: RelativePlayer.Opponent,
                cardCondition: (card) => card.isUnit() && card.remainingHp <= 3,
                immediateEffect: AbilityHelper.immediateEffects.defeat()
            },
            ifYouDo: {
                title: 'If an opponent controls no space, give an experience token to a unit',
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: (context) => !context.player.opponent.hasSomeArenaUnit({ arena: ZoneName.SpaceArena }),
                    onTrue: AbilityHelper.immediateEffects.selectCard({
                        cardTypeFilter: WildcardCardType.Unit,
                        optional: true,
                        innerSystem: AbilityHelper.immediateEffects.giveExperience()
                    }),
                    onFalse: AbilityHelper.immediateEffects.noAction()
                })
            }
        });
    }
}
