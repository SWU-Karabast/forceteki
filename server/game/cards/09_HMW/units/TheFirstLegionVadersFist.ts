import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Duration, TargetMode, Trait } from '../../../core/Constants';
import { AllCardsTargetMode } from '../../../core/ongoingEffect/OngoingAllCardsForPlayerEffect';
import { Helpers } from '../../../core/utils/Helpers';
import { TextHelper } from '../../../core/utils/TextHelper';

/** Title Case name of a trait as shown in the dropdown (e.g. 'bounty hunter' -> 'Bounty Hunter') */
function traitDisplayName(trait: Trait): string {
    return trait.split(' ')
        .map(Helpers.capitalize)
        .join(' ');
}

/** Every trait the player can name, keyed by its display name */
const traitsByDisplayName = new Map<string, Trait>(Object.values(Trait).map((trait) => [traitDisplayName(trait), trait]));
const traitDisplayNames = [...traitsByDisplayName.keys()].sort();

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
                options: traitDisplayNames,
            },
            then: (thenContext) => {
                const trait = traitsByDisplayName.get(thenContext.select);

                return {
                    title: `Enemy cards, including those not in play, lose the ${TextHelper.trait(trait)} trait for this phase`,
                    immediateEffect: AbilityHelper.immediateEffects.allCardsForPlayerLastingEffect((context) => ({
                        duration: Duration.UntilEndOfPhase,
                        target: context.player.opponent,
                        cardTargetMode: AllCardsTargetMode.OnlyControlled,
                        includeLeaders: true,
                        ongoingEffectDescription: `remove the ${TextHelper.trait(trait)} trait from all cards controlled by`,
                        effect: AbilityHelper.ongoingEffects.loseTraitAllCardsForPlayer(trait),
                    }))
                };
            }
        });
    }
}
