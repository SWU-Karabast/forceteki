import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { WildcardCardType } from '../../../core/Constants';

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
            immediateEffect: AbilityHelper.immediateEffects.chooseModalEffects({
                amountOfChoices: 1,
                choices: () => ({
                    ['Defeat a non-leader unit with 3 or less remaining HP']: AbilityHelper.immediateEffects
                        .selectCard({
                            cardTypeFilter: WildcardCardType.NonLeaderUnit,
                            cardCondition: (card) => card.isUnit() && card.remainingHp <= 3,
                            innerSystem: AbilityHelper.immediateEffects.defeat(),
                        }),
                    ['Use the Force. If you do, defeat a non-leader unit']: AbilityHelper.immediateEffects
                        .useTheForce()
                }),
            }),
            ifYouDo: (ifYouDoContext) => ({
                title: 'Defeat a non-leader unit',
                ifYouDoCondition: () => {
                    const { card, isResolved, player } = ifYouDoContext.events[0];
                    return player === ifYouDoContext.player && card.isForceToken() && isResolved;
                },
                targetResolver: {
                    cardTypeFilter: WildcardCardType.NonLeaderUnit,
                    immediateEffect: AbilityHelper.immediateEffects.defeat(),
                }
            })
        });
    }
}
