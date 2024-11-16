import AbilityHelper from '../../../AbilityHelper';
import * as Helpers from '../../../core/utils/Helpers.js';
import { EventCard } from '../../../core/card/EventCard';
import { RelativePlayer, TargetMode, WildcardCardType, WildcardLocation } from '../../../core/Constants';

export default class IHadNoChoice extends EventCard {
    protected override getImplementationId() {
        return {
            id: '2715652707',
            internalName: 'i-had-no-choice',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Choose up to 2 non-leader units. An opponent chooses 1 of those units. Return that unit to its owner’s hand and put the other on the bottom of its owner’s deck.',
            targetResolvers: {
                targetUnits: {
                    mode: TargetMode.UpTo,
                    numCards: 2,
                    cardTypeFilter: WildcardCardType.NonLeaderUnit,
                    locationFilter: WildcardLocation.AnyArena,
                    controller: RelativePlayer.Any
                },
                opponentChoice: {
                    dependsOn: 'targetUnits',
                    mode: TargetMode.Single,
                    choosingPlayer: RelativePlayer.Opponent,
                    cardCondition: (card, context) => Helpers.asArray(context.targets.targetUnits).includes(card),
                    immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                        AbilityHelper.immediateEffects.returnToHand(),
                        AbilityHelper.immediateEffects.moveToBottomOfDeck((context) => ({
                            target: Helpers.asArray(context.targets.targetUnits).filter((card) => card !== context.targets.opponentChoice)
                        }))
                    ])
                }
            },
        });
    }
}

IHadNoChoice.implemented = true;