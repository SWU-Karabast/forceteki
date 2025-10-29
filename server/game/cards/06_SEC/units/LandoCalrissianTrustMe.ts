import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType, WildcardZoneName } from '../../../core/Constants';

export default class LandoCalrissianTrustMe extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4946042773',
            internalName: 'lando-calrissian#trust-me',
        };
    }

    public override setupCardAbilities(
        registrar: INonLeaderUnitAbilityRegistrar,
        AbilityHelper: IAbilityHelper
    ) {
        registrar.addWhenPlayedAbility({
            title: 'An enemy unit captures another friendly non-leader unit. If they do, heal 6 damage from your base.',
            optional: true,
            targetResolvers: {
                enemyUnit: {
                    activePromptTitle: 'Choose an enemy unit. It will capture another friendly non-leader unit.',
                    controller: RelativePlayer.Opponent,
                    cardTypeFilter: WildcardCardType.Unit,
                    zoneFilter: WildcardZoneName.AnyArena
                },
                otherFriendlyUnit: {
                    dependsOn: 'enemyUnit',
                    activePromptTitle: 'Choose a friendly non-leader unit to be captured.',
                    controller: RelativePlayer.Self,
                    cardTypeFilter: WildcardCardType.NonLeaderUnit,
                    zoneFilter: WildcardZoneName.AnyArena,
                    cardCondition: (card, context) => card !== context.source,
                    immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                        AbilityHelper.immediateEffects.heal((context) => ({
                            target: context.player.base,
                            amount: 6
                        })),
                        AbilityHelper.immediateEffects.capture((context) => ({
                            captor: context.targets.enemyUnit
                        })),
                    ])
                }
            }
        });
    }
}