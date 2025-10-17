import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import type { AttacksThisPhaseWatcher } from '../../../stateWatchers/AttacksThisPhaseWatcher';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import { RelativePlayer, WildcardCardType, WildcardZoneName } from '../../../core/Constants';

export default class RuleWithRespect extends EventCard {
    private attacksThisPhaseWatcher: AttacksThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '8080818347',
            internalName: 'rule-with-respect',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper) {
        this.attacksThisPhaseWatcher = AbilityHelper.stateWatchers.attacksThisPhase(registrar);
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'A friendly unit captures each enemy non-leader unit that attacked your base this phase',
            targetResolver: {
                controller: RelativePlayer.Self,
                cardTypeFilter: WildcardCardType.Unit,
                zoneFilter: WildcardZoneName.AnyArena,
                immediateEffect: AbilityHelper.immediateEffects.capture((context) => ({
                    captor: context.target,
                    target: this.attacksThisPhaseWatcher.getAttackersInPlay((attack) =>
                        attack.targets.some((target) => target.isBase()) &&
                        attack.defendingPlayer === context.player &&
                        attack.attackingPlayer !== context.player &&
                        attack.attacker.controller !== context.player)
                }))
            }
        });
    }
}
