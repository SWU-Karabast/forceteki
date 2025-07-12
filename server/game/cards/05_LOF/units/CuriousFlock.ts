import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { TargetMode } from '../../../core/Constants';

export default class CuriousFlock extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4974236883',
            internalName: 'curious-flock'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addWhenPlayedAbility({
            title: 'Pay up to 6 resources. For each resource paid this way, give an Experience token to this unit',
            targetResolver: {
                mode: TargetMode.DropdownList,
                options: (context) => Array.from({ length: Math.min(6, context.player.readyResourceCount) + 1 }, (_x, i) => `${i}`),
                immediateEffect: AbilityHelper.immediateEffects.sequential([
                    AbilityHelper.immediateEffects.payResourceCost((context) => ({
                        amount: parseInt(context.select),
                        target: context.player,
                    })),
                    AbilityHelper.immediateEffects.giveExperience((context) => ({
                        amount: parseInt(context.select),
                        target: context.source
                    }))
                ]),
            },
        });
    }
}
