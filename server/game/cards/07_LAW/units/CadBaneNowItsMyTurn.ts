import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { TargetMode } from '../../../core/Constants';


export default class CadBaneNowItsMyTurn extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6583665254',
            internalName: 'cad-bane#now-its-my-turn',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Defeat any number of friendly Credit tokens',
            targetResolver: {
                activePromptTitle: 'Defeat any number of friendly Credit tokens',
                mode: TargetMode.DropdownList,
                condition: (context) => context.source.controller.creditTokenCount > 0,
                logSelection: false,
                options: (context) => Array.from({ length: context.source.controller.creditTokenCount + 1 }, (_x, i) => `${i}`),
                immediateEffect: AbilityHelper.immediateEffects.defeat((context) => ({
                    target: context.source.controller.baseZone.credits.slice(0, parseInt(context.select))
                })),
            },
            ifYouDo: (ifYouDoContext) => ({
                title: 'Give an Experience token to this unit for each Credit defeated this way',
                immediateEffect:
                   AbilityHelper.immediateEffects.giveExperience({
                       amount: parseInt(ifYouDoContext.select),
                   }),
            })
        });
    }
}