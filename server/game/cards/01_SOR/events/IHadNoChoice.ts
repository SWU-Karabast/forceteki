import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { RelativePlayer, TargetMode, WildcardCardType, WildcardRelativePlayer, WildcardZoneName } from '../../../core/Constants';

export default class IHadNoChoice extends EventCard {
    protected override getImplementationId() {
        return {
            id: '2715652707',
            internalName: 'i-had-no-choice',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Choose up to 2 non-leader units. An opponent chooses 1 of those units. Return that unit to its owner’s hand and put the other on the bottom of its owner’s deck.',
            targetResolvers: {
                targetUnits: {
                    mode: TargetMode.UpTo,
                    numCards: 2,
                    cardTypeFilter: WildcardCardType.NonLeaderUnit,
                    zoneFilter: WildcardZoneName.AnyArena,
                    controller: WildcardRelativePlayer.Any
                },
                opponentChoice: {
                    dependsOn: 'targetUnits',
                    mode: TargetMode.Single,
                    choosingPlayer: RelativePlayer.Opponent,
                    cardCondition: (card, context) => context.targets.targetUnits.includes(card),
                    immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                        AbilityHelper.immediateEffects.returnToHand(),
                        AbilityHelper.immediateEffects.moveToBottomOfDeck((context) => ({
                            target: context.targets.targetUnits.filter((card) => card !== context.targets.opponentChoice)
                        }))
                    ])
                }
            },
        });
    }
}
