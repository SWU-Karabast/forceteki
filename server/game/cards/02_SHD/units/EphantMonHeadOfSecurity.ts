import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { AttacksThisPhaseWatcher } from '../../../stateWatchers/AttacksThisPhaseWatcher';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class EphantMonHeadOfSecurity extends NonLeaderUnitCard {
    private attacksThisPhaseWatcher: AttacksThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '9734237871',
            internalName: 'ephant-mon#head-of-security',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper): void {
        this.attacksThisPhaseWatcher = AbilityHelper.stateWatchers.attacksThisPhase();
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Choose an enemy non-leader unit that attacked your base this phase. A friendly unit in the same arena captures that unit.',
            targetResolvers: {
                enemyUnit: {
                    controller: RelativePlayer.Opponent,
                    cardTypeFilter: WildcardCardType.NonLeaderUnit,
                    cardCondition: (card, context) => this.attacksThisPhaseWatcher.someUnitAttackedControlledByPlayer({ controller: context.player.opponent, filter: (entry) => entry.attacker === card && entry.targets.includes(context.player.base) }),
                },
                friendlyUnit: {
                    dependsOn: 'enemyUnit',
                    controller: RelativePlayer.Self,
                    cardTypeFilter: WildcardCardType.Unit,
                    cardCondition: (card, context) => card.zoneName === context.targets.enemyUnit.zoneName,
                    immediateEffect: AbilityHelper.immediateEffects.capture((context) => ({
                        target: context.targets.enemyUnit,
                        captor: context.targets.friendlyUnit,
                    }))
                }
            }
        });
    }
}

