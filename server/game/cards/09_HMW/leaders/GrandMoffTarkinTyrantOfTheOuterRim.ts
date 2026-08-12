import type { IAbilityHelper } from '../../../AbilityHelper';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { CardType, KeywordName, PhaseName, RelativePlayer, WildcardRelativePlayer } from '../../../core/Constants';

export default class GrandMoffTarkinTyrantOfTheOuterRim extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'grand-moff-tarkin#tyrant-of-the-outer-rim-id',
            internalName: 'grand-moff-tarkin#tyrant-of-the-outer-rim',
        };
    }

    // Shared between both sides, so it must be built fresh each time rather than stored as a class field.
    private buildIgnoreFortifyAspectPenaltyProperties(AbilityHelper: IAbilityHelper) {
        return {
            title: 'Ignore the aspect penalties on upgrades with Fortify you play',
            targetController: RelativePlayer.Self,
            ongoingEffect: AbilityHelper.ongoingEffects.ignoreAllAspectPenalties({
                cardTypeFilter: CardType.BasicUpgrade,
                match: (card) => card.hasSomeKeyword(KeywordName.Fortify)
            })
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility(this.buildIgnoreFortifyAspectPenaltyProperties(AbilityHelper));
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility(this.buildIgnoreFortifyAspectPenaltyProperties(AbilityHelper));

        registrar.addTriggeredAbility({
            title: 'Defeat a base with 10 or less remaining HP',
            optional: true,
            when: {
                onPhaseStarted: (context) => context.phase === PhaseName.Regroup
            },
            targetResolver: {
                controller: WildcardRelativePlayer.Any,
                cardTypeFilter: CardType.Base,
                cardCondition: (card) => card.isBase() && card.remainingHp <= 10,
                immediateEffect: AbilityHelper.immediateEffects.defeatBase()
            }
        });
    }
}
