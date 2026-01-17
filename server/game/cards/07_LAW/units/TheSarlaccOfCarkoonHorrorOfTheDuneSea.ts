import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType, ZoneName } from '../../../core/Constants';

export default class TheSarlaccOfCarkoonHorrorOfTheDuneSea extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6089627415',
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
                    immediateEffect: AbilityHelper.immediateEffects.moveToBottomOfDeck()
                },
                enemyUnit: {
                    cardTypeFilter: WildcardCardType.Unit,
                    controller: RelativePlayer.Opponent,
                    zoneFilter: ZoneName.GroundArena,
                    dependsOn: 'discardUnit',
                    immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({
                        amount: context.targets.discardUnit.printedPower
                    }))
                }
            }
        });
    }
}