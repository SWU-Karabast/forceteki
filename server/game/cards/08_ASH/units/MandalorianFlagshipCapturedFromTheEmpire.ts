import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { KeywordName, Trait } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class MandalorianFlagshipCapturedFromTheEmpire extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7405707601',
            internalName: 'mandalorian-flagship#captured-from-the-empire',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: `While you control a leader unit, this unit gains ${TextHelper.Ambush}`,
            condition: (context) => context.player.hasSomeArenaUnit({
                condition: (card) => card.isLeaderUnit()
            }),
            ongoingEffect: abilityHelper.ongoingEffects.gainKeyword(KeywordName.Ambush)
        });

        registrar.addConstantAbility({
            title: 'This unit gets +1/+0 for each other friendly Mandalorian unit',
            ongoingEffect: abilityHelper.ongoingEffects.modifyStats((target) => {
                const otherMandalorianUnits = target.controller.getArenaUnits({
                    otherThan: target,
                    trait: Trait.Mandalorian
                }).length;
                return ({
                    power: otherMandalorianUnits,
                    hp: 0,
                });
            }),
        });
    }
}