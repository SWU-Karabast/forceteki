import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect, Conjunction, WildcardCardType } from '../../../core/Constants';
import { aspectString } from '../../../core/utils/EnumHelpers';

export default class SabineWrenSpectreFive extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3553805201',
            internalName: 'sabine-wren#spectre-five',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: `Defeat a non-unique upgrade. If you control a ${aspectString([Aspect.Vigilance, Aspect.Command], Conjunction.Or)} unit, you may defeat an upgrade instead.`,
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => context.player.isAspectInPlay([Aspect.Vigilance, Aspect.Command]),
                onFalse: AbilityHelper.immediateEffects.selectCard({
                    activePromptTitle: 'Defeat a non-unique upgrade',
                    cardTypeFilter: WildcardCardType.Upgrade,
                    cardCondition: (card) => !card.unique,
                    immediateEffect: AbilityHelper.immediateEffects.defeat()
                }),
                onTrue: AbilityHelper.immediateEffects.selectCard({
                    activePromptTitle: 'Defeat an upgrade',
                    cardTypeFilter: WildcardCardType.Upgrade,
                    immediateEffect: AbilityHelper.immediateEffects.defeat()
                }),
            })
        });
    }
}