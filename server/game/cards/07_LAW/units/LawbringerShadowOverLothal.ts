import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { Aspect, TargetMode } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

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
                activePromptTitle: 'Choose an aspect. Each enemy unit with that aspect gets -2/-2 for this phase',
                mode: TargetMode.Select,
                choices: {
                    [TextHelper.Vigilance]: this.buildAbility(Aspect.Vigilance, abilityHelper),
                    [TextHelper.Command]: this.buildAbility(Aspect.Command, abilityHelper),
                    [TextHelper.Aggression]: this.buildAbility(Aspect.Aggression, abilityHelper),
                    [TextHelper.Cunning]: this.buildAbility(Aspect.Cunning, abilityHelper),
                    [TextHelper.Villainy]: this.buildAbility(Aspect.Villainy, abilityHelper),
                    [TextHelper.Heroism]: this.buildAbility(Aspect.Heroism, abilityHelper),
                }
            }
        });
    }

    private buildAbility(aspect: Aspect, abilityHelper: IAbilityHelper) {
        return abilityHelper.immediateEffects.simultaneous([
            abilityHelper.immediateEffects.handler({
                handler: () => { /* No-op, just log the chosen aspect */ },
                effectMessage: () => ['choose {0}', [TextHelper.aspect(aspect)]]
            }),
            abilityHelper.immediateEffects.forThisPhaseCardEffect((context) => ({
                target: context.player.opponent.getArenaUnits({ aspect: aspect }),
                effect: abilityHelper.ongoingEffects.modifyStats({ power: -2, hp: -2 })
            })),
        ]);
    }
}
