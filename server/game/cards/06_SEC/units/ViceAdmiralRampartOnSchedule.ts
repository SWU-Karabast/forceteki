import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect, TargetMode } from '../../../core/Constants';
import * as Helpers from '../../../core/utils/Helpers';

export default class ViceAdmiralRampartOnSchedule extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6496365934',
            internalName: 'vice-admiral-rampart#on-schedule',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        const aspects = [Aspect.Command, Aspect.Command, Aspect.Villainy];
        registrar.addOnAttackAbility({
            title: `Disclose ${Helpers.aspectString(aspects)} to give an Experience token to each of up to 2 other units`,
            immediateEffect: abilityHelper.immediateEffects.disclose({ aspects }),
            ifYouDo: {
                title: 'Give an Experience token to each of up to 2 other units',
                targetResolver: {
                    mode: TargetMode.UpTo,
                    numCards: 2,
                    cardCondition: (card, context) => card !== context.source,
                    immediateEffect: abilityHelper.immediateEffects.giveExperience()
                }
            }
        });
    }
}
