import AbilityHelper from '../../AbilityHelper';
import { UnitCard } from '../../core/card/CardTypes';
import { EventCard } from '../../core/card/EventCard';
import { TargetMode, Trait, WildcardCardType } from '../../core/Constants';
import { AttacksThisPhaseWatcher } from '../../core/stateWatcher/AttacksThisPhaseWatcher';
import { StateWatcherRegistrar } from '../../core/stateWatcher/StateWatcherRegistrar';

export default class MedalCeremony extends EventCard {
    private attacksThisPhaseWatcher: AttacksThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '4536594859',
            internalName: 'medal-ceremony',
        };
    }

    protected override setupStateWatchers(stateWatcherRegistrar: StateWatcherRegistrar) {
        this.attacksThisPhaseWatcher = new AttacksThisPhaseWatcher(stateWatcherRegistrar, this);
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Give an experience to each of up to three Rebel units that attacked this phase',
            targetResolver: {
                mode: TargetMode.UpTo,
                numCards: 3,
                immediateEffect: AbilityHelper.immediateEffects.giveExperience(),
                cardCondition: (card, context) => {
                    const rebelUnitsAttackedThisPhase = this.attacksThisPhaseWatcher.getCurrentValue()
                        .filter((attack) => attack.attacker.hasSomeTrait(Trait.Rebel))
                        .map((attack) => attack.attacker);

                    return rebelUnitsAttackedThisPhase.includes(card as UnitCard);
                }
            }
        });
    }
}

MedalCeremony.implemented = true;