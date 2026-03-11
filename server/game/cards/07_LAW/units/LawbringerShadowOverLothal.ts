import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { Aspect, TargetMode } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelpers';

export default class LawbringerShadowOverLothal extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6116264542',
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
                mode: TargetMode.Select,
                choices: () => ({
                    [`${TextHelper.aspect(Aspect.Vigilance)}`]: LawbringerShadowOverLothal.buildAbility(Aspect.Vigilance, abilityHelper),
                    [`${TextHelper.aspect(Aspect.Command)}`]: LawbringerShadowOverLothal.buildAbility(Aspect.Command, abilityHelper),
                    [`${TextHelper.aspect(Aspect.Aggression)}`]: LawbringerShadowOverLothal.buildAbility(Aspect.Aggression, abilityHelper),
                    [`${TextHelper.aspect(Aspect.Cunning)}`]: LawbringerShadowOverLothal.buildAbility(Aspect.Cunning, abilityHelper),
                    [`${TextHelper.aspect(Aspect.Villainy)}`]: LawbringerShadowOverLothal.buildAbility(Aspect.Villainy, abilityHelper),
                    [`${TextHelper.aspect(Aspect.Heroism)}`]: LawbringerShadowOverLothal.buildAbility(Aspect.Heroism, abilityHelper),
                })
            }
        });
    }

    private static buildAbility(aspect: Aspect, abilityHelper: IAbilityHelper) {
        return abilityHelper.immediateEffects.forThisPhaseCardEffect((context) => ({
            target: context.player.opponent.getArenaUnits({ aspect: aspect }),
            effect: abilityHelper.ongoingEffects.modifyStats({ power: -2, hp: -2 })
        }));
    }
}
