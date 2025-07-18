import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { TargetMode, Trait } from '../../../core/Constants';

export default class DorneanGunship extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3622750563',
            internalName: 'dornean-gunship',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Deal indirect damage to a player equal to the number of Vehicle units you control',
            targetResolver: {
                mode: TargetMode.Player,
                immediateEffect: AbilityHelper.immediateEffects.indirectDamageToPlayer((context) => ({
                    amount: context.player.getArenaUnits({
                        condition: (card) => card.hasSomeTrait(Trait.Vehicle)
                    }).length,
                })),
            }
        });
    }
}
