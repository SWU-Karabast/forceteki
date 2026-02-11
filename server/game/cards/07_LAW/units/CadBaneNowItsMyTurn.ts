import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { TargetMode } from '../../../core/Constants';


export default class CadBaneNowItsMyTurn extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'cad-bane#now-its-my-turn-id',
            internalName: 'cad-bane#now-its-my-turn',
        };
    }


    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Defeat any number of friendly Credit tokens',
            targetResolver: {
                condition: (context) => context.player.creditTokenCount > 0,
                mode: TargetMode.DropdownList,
                options: (context) => Array.from({ length: context.player.creditTokenCount + 1 }, (_x, i) => `${i}`),
                immediateEffect: AbilityHelper.immediateEffects.defeat((context) => ({
                    target: context.player.baseZone.credits.slice(parseInt(context.select))
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