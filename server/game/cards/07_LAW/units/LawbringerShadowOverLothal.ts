import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { Aspect, TargetMode } from '../../../core/Constants';
import { aspectString } from '../../../core/utils/EnumHelpers';

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
                    [aspectString([Aspect.Vigilance])]: LawbringerShadowOverLothal.buildAbility(Aspect.Vigilance, abilityHelper),
                    [aspectString([Aspect.Command])]: LawbringerShadowOverLothal.buildAbility(Aspect.Command, abilityHelper),
                    [aspectString([Aspect.Aggression])]: LawbringerShadowOverLothal.buildAbility(Aspect.Aggression, abilityHelper),
                    [aspectString([Aspect.Cunning])]: LawbringerShadowOverLothal.buildAbility(Aspect.Cunning, abilityHelper),
                    [aspectString([Aspect.Villainy])]: LawbringerShadowOverLothal.buildAbility(Aspect.Villainy, abilityHelper),
                    [aspectString([Aspect.Heroism])]: LawbringerShadowOverLothal.buildAbility(Aspect.Heroism, abilityHelper),
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
