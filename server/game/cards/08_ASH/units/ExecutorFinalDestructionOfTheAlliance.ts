import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class ExecutorFinalDestructionOfTheAlliance extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'executor#final-destruction-of-the-alliance-id',
            internalName: 'executor#final-destruction-of-the-alliance',
        };
    }

    public override setupCardAbilities (registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'This unit gets +1/+0 for each upgrade on other friendly units',
            ongoingEffect: abilityHelper.ongoingEffects.modifyStats((target) => {
                const upgradeCountOnOtherFriendlyUnits = target.controller.getArenaUnits({ otherThan: target }).flatMap((x) => x.upgrades).length;
                return ({
                    power: upgradeCountOnOtherFriendlyUnits,
                    hp: 0,
                });
            }),
        });

        registrar.addWhenPlayedAbility({
            title: 'Give an Advantage token to each other friendly unit',
            immediateEffect: abilityHelper.immediateEffects.giveAdvantage((context) => ({
                amount: 1,
                target: context.player.getArenaUnits({ otherThan: context.source })
            }))
        });
    }
}