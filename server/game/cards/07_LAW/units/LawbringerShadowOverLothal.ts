import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { Aspect, TargetMode } from '../../../core/Constants';
import { aspectString, checkConvertToEnum } from '../../../core/utils/EnumHelpers';

export default class LawbringerShadowOverLothal extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'lawbringer#shadow-over-lothal-id',
            internalName: 'lawbringer#shadow-over-lothal',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Choose an aspect. Give each enemy unit with that aspect -2/-2 for this phase.',
            when: {
                whenPlayed: true,
                onAttack: true,
            },
            targetResolver: {
                activePromptTitle: 'Choose an Aspect',
                mode: TargetMode.DropdownList,
                options: [Aspect.Vigilance, Aspect.Command, Aspect.Aggression, Aspect.Cunning, Aspect.Villainy, Aspect.Heroism]
                    .map((a) => aspectString([a])),
                immediateEffect: abilityHelper.immediateEffects.forThisPhaseCardEffect((context) => ({
                    target: context.player.opponent.getArenaUnits({
                        aspect: checkConvertToEnum(context.select.toLowerCase(), Aspect)[0]
                    }),
                    effect: abilityHelper.ongoingEffects.modifyStats({ power: -2, hp: -2 })
                }))
            }
        });
    }
}
