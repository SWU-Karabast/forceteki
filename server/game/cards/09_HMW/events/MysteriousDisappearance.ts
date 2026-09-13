import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventCard } from '../../../core/card/EventCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { RelativePlayer, TargetMode, WildcardCardType } from '../../../core/Constants';

export default class MysteriousDisappearance extends EventCard {
    protected override getImplementationId() {
        return {
            id: 'mysterious-disappearance-id',
            internalName: 'mysterious-disappearance',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'A player chooses a non-leader unit they control. You may defeat that unit. If you do, that player creates a Beast token',
            targetResolvers: {
                player: {
                    mode: TargetMode.Player,
                },
                unit: {
                    dependsOn: 'player',
                    // The chosen player picks from their own units, regardless of who played this.
                    choosingPlayer: (context) => (context.targets.player === context.player ? RelativePlayer.Self : RelativePlayer.Opponent),
                    controller: (context) => (context.targets.player === context.player ? RelativePlayer.Self : RelativePlayer.Opponent),
                    cardTypeFilter: WildcardCardType.NonLeaderUnit,
                }
            },
            then: (thenContext) => ({
                title: `Defeat ${thenContext.targets.unit?.title}`,
                // Nothing to defeat if the chosen player had no non-leader units.
                thenCondition: () => !!thenContext.targets.unit,
                optional: true,
                immediateEffect: abilityHelper.immediateEffects.defeat({ target: thenContext.targets.unit }),
                ifYouDo: {
                    title: 'That player creates a Beast token',
                    immediateEffect: abilityHelper.immediateEffects.createBeast({ target: thenContext.targets.player })
                }
            })
        });
    }
}
