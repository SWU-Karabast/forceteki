import AbilityHelper from '../../../AbilityHelper';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { Trait, WildcardCardType } from '../../../core/Constants';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { AttacksThisPhaseWatcher } from '../../../stateWatchers/AttacksThisPhaseWatcher';

export default class RoseTicoSavingWhatWeLove extends LeaderUnitCard {
    private attacksThisPhaseWatcher: AttacksThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '3933322003',
            internalName: 'rose-tico#saving-what-we-love',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar) {
        this.attacksThisPhaseWatcher = AbilityHelper.stateWatchers.attacksThisPhase(registrar, this);
    }

    protected override setupLeaderSideAbilities() {
        this.addActionAbility({
            title: 'Heal 2 damage from a Vehicle unit that attacked this phase',
            cost: AbilityHelper.costs.exhaustSelf(),
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.heal({ amount: 2 }),
                cardCondition: (card, context) => {
                    const vehicleUnitsAttackedThisPhase = this.attacksThisPhaseWatcher.getAttackersInPlay((attack) => attack.attacker.hasSomeTrait(Trait.Vehicle));
                    return vehicleUnitsAttackedThisPhase.includes(card);
                }
            }
        });
    }

    protected override setupLeaderUnitSideAbilities() {
        this.addOnAttackAbility({
            title: 'Heal 2 damage from a Vehicle unit',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card) => card.isUnit() && card.hasSomeTrait(Trait.Vehicle),
                immediateEffect: AbilityHelper.immediateEffects.heal({ amount: 2 })
            }
        });
    }
}