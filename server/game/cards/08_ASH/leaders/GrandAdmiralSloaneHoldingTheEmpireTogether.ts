import type { IAbilityHelper } from '../../../AbilityHelper';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import type { Arena } from '../../../core/Constants';
import { KeywordName, TargetMode, ZoneName } from '../../../core/Constants';

export default class GrandAdmiralSloaneHoldingTheEmpireTogether extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6779170431',
            internalName: 'grand-admiral-sloane#holding-the-empire-together',
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Choose an arena. Give each unit in that arena Sentinel and Overwhelm for this phase',
            cost: abilityHelper.costs.exhaustSelf(),
            targetResolver: {
                mode: TargetMode.Select,
                activePromptTitle: 'Choose an arena',
                choices: {
                    ['Ground']: this.giveArenaUnitsKeywordsForThisPhase(ZoneName.GroundArena, abilityHelper),
                    ['Space']: this.giveArenaUnitsKeywordsForThisPhase(ZoneName.SpaceArena, abilityHelper),
                }
            }
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'Each other friendly unit gains Overwhelm and Sentinel',
            matchTarget: (card, context) => card.isUnit() && card.controller === context.player && card !== context.source,
            ongoingEffect: [
                abilityHelper.ongoingEffects.gainKeyword(KeywordName.Overwhelm),
                abilityHelper.ongoingEffects.gainKeyword(KeywordName.Sentinel),
            ]
        });
    }

    private giveArenaUnitsKeywordsForThisPhase(arena: Arena, abilityHelper: IAbilityHelper) {
        return abilityHelper.immediateEffects.forThisPhaseCardEffect((context) => ({
            target: context.game.getArenaUnits({ arena }),
            effect: [
                abilityHelper.ongoingEffects.gainKeyword(KeywordName.Sentinel),
                abilityHelper.ongoingEffects.gainKeyword(KeywordName.Overwhelm),
            ]
        }));
    }
}
