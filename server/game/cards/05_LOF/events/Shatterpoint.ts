import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { RelativePlayer, TargetMode, WildcardCardType } from '../../../core/Constants';
import ForceToken from '../tokens/ForceToken';

export default class Shatterpoint extends EventCard {
    protected override getImplementationId() {
        return {
            id: 'shatterpoint-id',
            internalName: 'shatterpoint',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Choose one: Defeat a non-leader unit with 3 or less remaining HP or Use the Force. If you do, defeat a non-leader unit',
            targetResolver: {
                mode: TargetMode.Select,
                choosingPlayer: RelativePlayer.Self,
                showUnresolvable: true,
                choices: () => ({
                    ['Defeat a non-leader unit with 3 or less remaining HP']:
                        AbilityHelper.immediateEffects.selectCard({
                            cardTypeFilter: WildcardCardType.NonLeaderUnit,
                            cardCondition: (card) => card.isUnit() && card.remainingHp <= 3,
                            innerSystem: AbilityHelper.immediateEffects.defeat(),
                        }),
                    ['Use the Force. If you do, defeat a non-leader unit']:
                        AbilityHelper.immediateEffects.useTheForce()
                }),
            },
            ifYouDo: (ifYouDoContext) => ({
                title: 'Defeat a non-leader unit',
                ifYouDoCondition: () => {
                    const { card, isResolved, player } = ifYouDoContext.events[0];
                    return player === ifYouDoContext.player && card instanceof ForceToken && isResolved;
                },
                targetResolver: {
                    cardTypeFilter: WildcardCardType.NonLeaderUnit,
                    immediateEffect: AbilityHelper.immediateEffects.defeat(),
                }
            })
        });
    }
}
