import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { CardType, RelativePlayer, WildcardCardType, WildcardRelativePlayer, WildcardZoneName, ZoneName } from '../../../core/Constants';

export default class Command extends EventCard {
    protected override getImplementationId() {
        return {
            id: '0073206444',
            internalName: 'command',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar) {
        registrar.setEventAbility({
            title: 'Command modal ability:',
            immediateEffect: AbilityHelper.immediateEffects.chooseModalEffects({
                amountOfChoices: 2,
                choices: (context) => ({
                    ['Give 2 Experience tokens to a unit.']: AbilityHelper.immediateEffects.selectCard({
                        controller: WildcardRelativePlayer.Any,
                        cardTypeFilter: WildcardCardType.Unit,
                        zoneFilter: WildcardZoneName.AnyArena,
                        immediateEffect: AbilityHelper.immediateEffects.giveExperience({
                            amount: 2
                        })
                    }),
                    ['A friendly unit deals damage equal to its power to a non-unique enemy unit.']: AbilityHelper.immediateEffects.selectCard({
                        controller: RelativePlayer.Self,
                        cardTypeFilter: WildcardCardType.Unit,
                        zoneFilter: WildcardZoneName.AnyArena,
                        name: 'friendlyUnit',
                        immediateEffect: AbilityHelper.immediateEffects.selectCard({
                            controller: RelativePlayer.Opponent,
                            cardTypeFilter: WildcardCardType.Unit,
                            zoneFilter: WildcardZoneName.AnyArena,
                            cardCondition: (card) => !card.unique,
                            name: 'enemyUnit',
                            immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({
                                amount: context.targets.friendlyUnit?.getPower(),
                                target: context.targets.enemyUnit
                            }))
                        })
                    }),
                    ['Put this event into play as a resource.']: AbilityHelper.immediateEffects.resourceCard({
                        target: context.source
                    }),
                    ['Return a unit from your discard pile to your hand.']: AbilityHelper.immediateEffects.selectCard({
                        controller: RelativePlayer.Self,
                        cardTypeFilter: CardType.BasicUnit,
                        zoneFilter: ZoneName.Discard,
                        immediateEffect: AbilityHelper.immediateEffects.returnToHand()
                    }),
                })
            })
        });
    }
}

