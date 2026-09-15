import type { IAbilityHelper } from '../../../AbilityHelper';
import type { AbilityContext } from '../../../core/ability/AbilityContext';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { KeywordName, RelativePlayer, TargetMode, WildcardCardType } from '../../../core/Constants';
import type { IReplaceKeywordProperties } from '../../../core/ongoingEffect/effectImpl/ReplaceKeyword';
import { TextHelper } from '../../../core/utils/TextHelper';
import type { IActionTargetsResolver } from '../../../TargetInterfaces';

export default class AsajjVentressNoTimeForRegret extends LeaderUnitCard {
    private static readonly replaceRaidWithRestore: IReplaceKeywordProperties = { from: KeywordName.Raid, to: KeywordName.Restore };
    private static readonly replaceRestoreWithRaid: IReplaceKeywordProperties = { from: KeywordName.Restore, to: KeywordName.Raid };

    protected override getImplementationId() {
        return {
            id: 'asajj-ventress#no-time-for-regret-id',
            internalName: 'asajj-ventress#no-time-for-regret',
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: this.buildAbilityTitle(),
            cost: AbilityHelper.costs.exhaustSelf(),
            targetResolvers: this.buildTargetResolvers(AbilityHelper)
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: this.buildAbilityTitle(),
            targetResolvers: this.buildTargetResolvers(AbilityHelper)
        });
    }

    private buildAbilityTitle(): string {
        return `Attack with a unit. For this attack, replace any ${TextHelper.keyword(KeywordName.Raid)} it has or gains with ${TextHelper.keyword(KeywordName.Restore)}, or vice versa`;
    }

    /**
     * The replacement only goes one way, so the player picks a direction after choosing the attacker. The choice is
     * always offered: because the replacement covers keywords the attacker *gains* during the attack, a unit with
     * neither keyword right now can still end up with one before damage is dealt.
     */
    private buildTargetResolvers(AbilityHelper: IAbilityHelper): IActionTargetsResolver<AbilityContext<this>> {
        return {
            attacker: {
                controller: RelativePlayer.Self,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.attack((context) => ({
                    attackerLastingEffects: {
                        effect: AbilityHelper.ongoingEffects.replaceKeyword(this.getChosenReplacement(context))
                    }
                }))
            },
            replacement: {
                activePromptTitle: 'Choose which keyword to replace for this attack',
                mode: TargetMode.Select,
                choices: {
                    [AsajjVentressNoTimeForRegret.buildChoiceText(AsajjVentressNoTimeForRegret.replaceRaidWithRestore)]:
                        AbilityHelper.immediateEffects.noAction({ hasLegalTarget: true }),
                    [AsajjVentressNoTimeForRegret.buildChoiceText(AsajjVentressNoTimeForRegret.replaceRestoreWithRaid)]:
                        AbilityHelper.immediateEffects.noAction({ hasLegalTarget: true })
                }
            }
        };
    }

    /**
     * Reads the chosen direction back off the context. Defaults to replacing Raid while the choice is still
     * unresolved, since the attack system also builds its properties during target legality checks.
     */
    private getChosenReplacement(context: AbilityContext<this>): IReplaceKeywordProperties {
        const choice = context.selects.replacement?.choice;

        return choice === AsajjVentressNoTimeForRegret.buildChoiceText(AsajjVentressNoTimeForRegret.replaceRestoreWithRaid)
            ? AsajjVentressNoTimeForRegret.replaceRestoreWithRaid
            : AsajjVentressNoTimeForRegret.replaceRaidWithRestore;
    }

    private static buildChoiceText(replacement: IReplaceKeywordProperties): string {
        return `Replace ${TextHelper.keyword(replacement.from)} with ${TextHelper.keyword(replacement.to)}`;
    }
}
