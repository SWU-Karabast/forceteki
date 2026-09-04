import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Duration, TargetMode, Trait } from '../../../core/Constants';
import { AllCardsTargetMode } from '../../../core/ongoingEffect/OngoingAllCardsForPlayerEffect';
import { EnumHelpers } from '../../../core/utils/EnumHelpers';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class TheFirstLegionVadersFist extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'the-first-legion#vaders-fist-id',
            internalName: 'the-first-legion#vaders-fist',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Name a trait. Enemy cards, including those not in play, lose that trait for this phase',
            targetResolver: {
                mode: TargetMode.DropdownList,
                options: this.game.traitNames,
            },
            then: (thenContext) => {
                const [trait] = EnumHelpers.checkConvertToEnum(thenContext.select, Trait);

                return {
                    title: `Enemy cards, including those not in play, lose the ${TextHelper.trait(trait)} trait for this phase`,
                    immediateEffect: AbilityHelper.immediateEffects.allCardsForPlayerLastingEffect((context) => ({
                        duration: Duration.UntilEndOfPhase,
                        target: context.player.opponent,
                        cardTargetMode: AllCardsTargetMode.OnlyControlled,
                        ongoingEffectDescription: `remove the ${TextHelper.trait(trait)} trait from all cards controlled by`,
                        effect: AbilityHelper.ongoingEffects.allCardsForPlayerLoseTrait(trait),
                    }))
                };
            }
        });
    }
}
