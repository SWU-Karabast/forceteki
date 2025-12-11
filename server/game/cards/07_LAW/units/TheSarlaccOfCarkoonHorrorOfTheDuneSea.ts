import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType, ZoneName } from '../../../core/Constants';

export default class TheSarlaccOfCarkoonHorrorOfTheDuneSea extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'the-sarlacc-of-carkoon#horror-of-the-dune-sea-id',
            internalName: 'the-sarlacc-of-carkoon#horror-of-the-dune-sea',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Put a unit from your discard pile on the bottom of your deck. Deal damage equal to that unit\'s power to an enemy ground unit',
            targetResolvers: {
                discardUnit: {
                    cardTypeFilter: WildcardCardType.Unit,
                    controller: RelativePlayer.Self,
                    zoneFilter: ZoneName.Discard,
                },
                enemyUnit: {
                    cardTypeFilter: WildcardCardType.Unit,
                    controller: RelativePlayer.Opponent,
                    zoneFilter: ZoneName.GroundArena,
                    dependsOn: 'discardUnit',
                    immediateEffect: AbilityHelper.immediateEffects.simultaneous((context) => [
                        AbilityHelper.immediateEffects.moveToBottomOfDeck({
                            target: context.targets.discardUnit
                        }),
                        AbilityHelper.immediateEffects.damage({
                            amount: context.targets.discardUnit.printedPower
                        })
                    ])
                }
            }
        });
    }
}