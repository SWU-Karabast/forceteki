import type { IAbilityHelper } from '../../../AbilityHelper';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import type { Arena } from '../../../core/Constants';
import { KeywordName, ZoneName } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class GrandAdmiralSloaneHoldingTheEmpireTogether extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6779170431',
            internalName: 'grand-admiral-sloane#holding-the-empire-together',
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: `Give each unit in an arena ${TextHelper.Sentinel} and ${TextHelper.Overwhelm} for this phase`,
            cost: abilityHelper.costs.exhaustSelf(),
            immediateEffect: abilityHelper.immediateEffects.chooseModalEffects({
                amountOfChoices: 1,
                // Space is listed first to match the client's arena layout (space on the left, ground on the right)
                choices: {
                    [`Give each space unit ${TextHelper.Sentinel} and ${TextHelper.Overwhelm} for this phase`]:
                        this.giveArenaUnitsKeywordsForThisPhase(ZoneName.SpaceArena, abilityHelper),
                    [`Give each ground unit ${TextHelper.Sentinel} and ${TextHelper.Overwhelm} for this phase`]:
                        this.giveArenaUnitsKeywordsForThisPhase(ZoneName.GroundArena, abilityHelper),
                }
            })
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: `Each other friendly unit gains ${TextHelper.Overwhelm} and ${TextHelper.Sentinel}`,
            matchTarget: (card, context) => card.isUnit() && card.controller === context.player && card !== context.source,
            ongoingEffect: [
                abilityHelper.ongoingEffects.gainKeyword(KeywordName.Overwhelm),
                abilityHelper.ongoingEffects.gainKeyword(KeywordName.Sentinel),
            ]
        });
    }

    private giveArenaUnitsKeywordsForThisPhase(arena: Arena, abilityHelper: IAbilityHelper) {
        return abilityHelper.immediateEffects.forThisPhaseCardEffect((context) => ({
            title: `Gains ${TextHelper.Sentinel} and ${TextHelper.Overwhelm} for this phase`,
            target: context.game.getArenaUnits({ arena }),
            effect: [
                abilityHelper.ongoingEffects.gainKeyword(KeywordName.Sentinel),
                abilityHelper.ongoingEffects.gainKeyword(KeywordName.Overwhelm),
            ]
        }));
    }
}
