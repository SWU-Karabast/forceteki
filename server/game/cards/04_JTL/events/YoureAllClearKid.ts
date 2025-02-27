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
            title: 'Defeat an enemy space unit with 3 or less remaining HP',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                zoneFilter: ZoneName.SpaceArena,
                controller: RelativePlayer.Opponent,
                cardCondition: (card) => card.isUnit() && card.remainingHp <= 3,
                immediateEffect: AbilityHelper.immediateEffects.defeat()
            },
            ifYouDo: {
                title: 'If an opponent controls no space, give an experience token to a unit',
                optional: true,
                ifYouDoCondition: (context) => !context.player.opponent.hasSomeArenaUnit({ arena: ZoneName.SpaceArena }),
                targetResolver: {
                    cardTypeFilter: WildcardCardType.Unit,
                    immediateEffect: AbilityHelper.immediateEffects.giveExperience()
                }
            }
        });
    }
}
