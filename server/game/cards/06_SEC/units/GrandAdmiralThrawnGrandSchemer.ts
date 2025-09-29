import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, TargetMode, WildcardCardType, WildcardZoneName } from '../../../core/Constants';

export default class GrandAdmiralThrawnGrandSchemer extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'grand-admiral-thrawn#grand-schemer-id',
            internalName: 'grand-admiral-thrawn#grand-schemer',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'An opponent may choose a non-leader unit they control. If they do, this unit captures that unit. If they don\'t, ready this unit.',
            targetResolver: ({
                choosingPlayer: RelativePlayer.Opponent,
                mode: TargetMode.Select,
                choices: () => ({
                    ['Choose a non-leader unit to be captured']: abilityHelper.immediateEffects.selectCard({
                        choosingPlayer: RelativePlayer.Opponent,
                        controller: RelativePlayer.Opponent,
                        cardTypeFilter: WildcardCardType.NonLeaderUnit,
                        immediateEffect: abilityHelper.immediateEffects.capture(),
                    }),
                    ['Opponent readies Grand Admiral Thrawn']: abilityHelper.immediateEffects.ready(),
                })
            })
        });

        registrar.addWhenDefeatedAbility({
            title: 'A friendly unit captures an enemy non-leader unit in the same arena',
            targetResolvers: {
                friendlyUnit: {
                    zoneFilter: WildcardZoneName.AnyArena,
                    controller: RelativePlayer.Self,
                    cardTypeFilter: WildcardCardType.Unit
                },
                captureUnit: {
                    dependsOn: 'friendlyUnit',
                    controller: RelativePlayer.Opponent,
                    cardCondition: (card, context) => card.zoneName === context.targets['friendlyUnit'].zoneName,
                    immediateEffect: abilityHelper.immediateEffects.capture((context) => ({ captor: context.targets['friendlyUnit'] }))
                }
            }
        });
    }
}
