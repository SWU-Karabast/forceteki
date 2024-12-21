import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { AttacksThisPhaseWatcher } from '../../../stateWatchers/AttacksThisPhaseWatcher';
import { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import { RelativePlayer, WildcardCardType, WildcardZoneName } from '../../../core/Constants';

export default class RuleWithRespect extends EventCard {
    private attacksThisPhaseWatcher: AttacksThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '8080818347',
            internalName: 'rule-with-respect',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar) {
        this.attacksThisPhaseWatcher = AbilityHelper.stateWatchers.attacksThisPhase(registrar, this);
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'A friendly unit captures each enemy non-leader unit that attacked your base this phase',
            targetResolver: {
                controller: RelativePlayer.Self,
                cardTypeFilter: WildcardCardType.Unit,
                zoneFilter: WildcardZoneName.AnyArena,
                immediateEffect: AbilityHelper.immediateEffects.capture((context) => ({
                    captor: context.target,
                    target: this.attacksThisPhaseWatcher.getAttackersInPlay((attack) =>
                        attack.target.isBase() &&
                        attack.defendingPlayer === context.source.controller &&
                        attack.attackingPlayer !== context.source.controller &&
                        attack.attacker.controller !== context.source.controller)
                }))
            }
        });
    }
}

RuleWithRespect.implemented = true;
