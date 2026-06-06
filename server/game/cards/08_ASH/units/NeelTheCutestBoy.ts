import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class NeelTheCutestBoy extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8371755043',
            internalName: 'neel#the-cutest-boy',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'The next unit you play this phase with 1 or less power enters play ready',
            when: {
                whenPlayed: true,
                onAttack: true,
            },
            immediateEffect: AbilityHelper.immediateEffects.forThisPhasePlayerEffect(() => {
                // Closure-captured consumption flag ensures the effect fires only on the
                // *next* qualifying unit, then stops applying for the rest of the phase.
                let consumed = false;
                return {
                    effect: AbilityHelper.ongoingEffects.matchingPlayedUnitEntersPlayReady((card) => {
                        if (consumed) {
                            return false;
                        }
                        if (card.isUnit() && card.getPrintedPower() <= 1) {
                            consumed = true;
                            return true;
                        }
                        return false;
                    })
                };
            })
        });
    }
}
