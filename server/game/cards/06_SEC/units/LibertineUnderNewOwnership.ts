import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType, WildcardZoneName } from '../../../core/Constants';

export default class LibertineUnderNewOwnership extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'libertine#under-new-ownership-id',
            internalName: 'libertine#under-new-ownership',
        };
    }

    public override setupCardAbilities(
        registrar: INonLeaderUnitAbilityRegistrar,
        AbilityHelper: IAbilityHelper
    ) {
        registrar.addConstantAbility({
            title: 'This unit gets +1/+0 for each captured card it\'s guarding',
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats((target) => ({
                power: target.capturedUnits.length,
                hp: 0,
            })),
        });

        registrar.addWhenPlayedAbility({
            title: 'An enemy unit captures a friendly non-leader unit',
            targetResolvers: {
                enemyUnit: {
                    activePromptTitle: 'Choose an enemy unit. It will capture a friendly non-leader unit.',
                    controller: RelativePlayer.Opponent,
                    cardTypeFilter: WildcardCardType.Unit,
                    zoneFilter: WildcardZoneName.AnyArena
                },
                friendlyUnit: {
                    activePromptTitle: 'Choose a friendly non-leader unit to be captured.',
                    dependsOn: 'enemyUnit',
                    controller: RelativePlayer.Self,
                    cardTypeFilter: WildcardCardType.NonLeaderUnit,
                    zoneFilter: WildcardZoneName.AnyArena,
                    immediateEffect: AbilityHelper.immediateEffects.capture((context) => ({
                        captor: context.targets.enemyUnit
                    }))
                }
            }
        });
    }
}