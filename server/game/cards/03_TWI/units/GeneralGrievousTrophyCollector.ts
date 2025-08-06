import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, TargetMode, Trait, WildcardCardType } from '../../../core/Constants';

export default class GeneralGrievousTrophyCollector extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4776553531',
            internalName: 'general-grievous#trophy-collector'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'Ignore the aspect penalty on each Lightsaber upgrade you play on this unit',
            ongoingEffect: AbilityHelper.ongoingEffects.ignoreAllAspectPenalties({
                cardTypeFilter: WildcardCardType.Playable,
                attachTargetCondition: (target, source) => target === source,
                match: (card) => card.hasSomeTrait(Trait.Lightsaber)
            })
        });

        registrar.addOnAttackAbility({
            title: 'Defeat 4 enemy units',
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => context.source.upgrades.filter((upgrade) => upgrade.hasSomeTrait(Trait.Lightsaber)).length >= 4,
                onTrue: AbilityHelper.immediateEffects.selectCard({
                    cardTypeFilter: WildcardCardType.Unit,
                    controller: RelativePlayer.Opponent,
                    mode: TargetMode.ExactlyVariable,
                    numCardsFunc: (context) => Math.min(4, context.player.opponent.getArenaUnits().length),
                    immediateEffect: AbilityHelper.immediateEffects.defeat()
                }),
            })
        });
    }
}
