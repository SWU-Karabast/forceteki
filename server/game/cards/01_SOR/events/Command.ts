import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { CardType, RelativePlayer, WildcardCardType, WildcardRelativePlayer, WildcardZoneName, ZoneName } from '../../../core/Constants';

export default class Command extends EventCard {
    protected override getImplementationId() {
        return {
            id: '0073206444',
            internalName: 'command',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Command modal ability:',
            immediateEffect: AbilityHelper.immediateEffects.chooseModalEffects({
                amountOfChoices: 2,
                choices: (context) => ({
                    ['Give 2 Experience tokens to a unit.']: AbilityHelper.immediateEffects.selectCard({
                        controller: WildcardRelativePlayer.Any,
                        cardTypeFilter: WildcardCardType.Unit,
                        zoneFilter: WildcardZoneName.AnyArena,
                        innerSystem: AbilityHelper.immediateEffects.giveExperience({
                            amount: 2
                        })
                    }),
                    // TODO how to do this within a modal?
                    ['A friendly unit deals damage equal to its power to a non-unique enemy unit.']: AbilityHelper.immediateEffects.selectCard({
                        controller: RelativePlayer.Self,
                        cardTypeFilter: WildcardCardType.Unit,
                        zoneFilter: WildcardZoneName.AnyArena,
                        // name: 'friendlyUnit',
                        innerSystem: AbilityHelper.immediateEffects.selectCard({
                            controller: RelativePlayer.Opponent,
                            cardTypeFilter: WildcardCardType.Unit,
                            zoneFilter: WildcardZoneName.AnyArena,
                            cardCondition: (card) => !card.unique,
                            // name: 'enemyUnit',
                            innerSystem: AbilityHelper.immediateEffects.damage({
                                amount: 3
                            })
                        })
                    }),
                    ['Put this event into play as a resource.']: AbilityHelper.immediateEffects.resourceCard({
                        target: context.source
                    }),
                    ['Return a unit from your discard pile to your hand.']: AbilityHelper.immediateEffects.selectCard({
                        controller: RelativePlayer.Self,
                        cardTypeFilter: CardType.BasicUnit,
                        zoneFilter: ZoneName.Discard,
                        innerSystem: AbilityHelper.immediateEffects.returnToHand()
                    }),
                })
            })
        });
    }
}

Command.implemented = true;
