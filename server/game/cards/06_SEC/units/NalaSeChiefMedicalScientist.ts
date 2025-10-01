import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect, WildcardRelativePlayer } from '../../../core/Constants';
import * as EnumHelpers from '../../../core/utils/EnumHelpers';

export default class NalaSeChiefMedicalScientist extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'nala-se#chief-medical-scientist-id',
            internalName: 'nala-se#chief-medical-scientist',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        const aspects = [Aspect.Vigilance, Aspect.Vigilance];
        registrar.addOnAttackAbility({
            title: `Disclose ${EnumHelpers.aspectString(aspects)}. If you do, heal up to 4 damage from among other units`,
            immediateEffect: AbilityHelper.immediateEffects.disclose({ aspects }),
            ifYouDo: {
                title: 'Heal up to 4 damage from among other units',
                immediateEffect: AbilityHelper.immediateEffects.distributeHealingAmong({
                    amountToDistribute: 4,
                    controller: WildcardRelativePlayer.Any,
                    canChooseNoTargets: true,
                    canDistributeLess: true,
                    cardCondition: (card, context) => card.isUnit() && card !== context.source,
                }),
            }
        });
    }
}