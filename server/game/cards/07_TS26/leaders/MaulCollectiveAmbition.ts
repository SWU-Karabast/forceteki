import type { IAbilityHelper } from '../../../AbilityHelper';
import type { AbilityContext } from '../../../core/ability/AbilityContext';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import type { IUnitCard } from '../../../core/card/propertyMixins/UnitProperties';
import { WildcardCardType } from '../../../core/Constants';

export default class MaulCollectiveAmbition extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0319685377',
            internalName: 'maul#collective-ambition',
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, AbilityHelper: IAbilityHelper): void {
        registrar.addActionAbility({
            title: 'Give an Experience token and deal 1 damage to a unit with more Keywords than Experience tokens',
            cost: AbilityHelper.costs.exhaustSelf(),
            targetResolver: {
                activePromptTitle: 'Choose a unit. If it has more Keywords than Experience tokens, give it an Experience token and deal 1 damage to it',
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: (context) => this.targetHasMoreKeywordsThanExperienceTokens(context),
                    onTrue: AbilityHelper.immediateEffects.simultaneous([
                        AbilityHelper.immediateEffects.giveExperience(),
                        AbilityHelper.immediateEffects.damage({ amount: 1 })
                    ]),
                    onFalse: AbilityHelper.immediateEffects.noAction({ hasLegalTarget: true })
                })
            }
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper): void {
        registrar.addTriggeredAbility({
            title: 'Give an Experience token and deal 1 damage to a unit with more Keywords than Experience tokens',
            when: {
                onLeaderDeployed: (event, context) => event.card === context.source,
                onAttack: true
            },
            targetResolver: {
                activePromptTitle: 'Choose a unit. If it has more Keywords than Experience tokens, give it an Experience token and deal 1 damage to it',
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: (context) => this.targetHasMoreKeywordsThanExperienceTokens(context),
                    onTrue: AbilityHelper.immediateEffects.simultaneous([
                        AbilityHelper.immediateEffects.giveExperience(),
                        AbilityHelper.immediateEffects.damage({ amount: 1 })
                    ]),
                    onFalse: AbilityHelper.immediateEffects.noAction({ hasLegalTarget: true })
                })
            }
        });
    }

    private targetHasMoreKeywordsThanExperienceTokens(context: AbilityContext): boolean {
        if (!context.target.isCard() || !context.target.isUnit()) {
            return false;
        }

        const target = context.target as IUnitCard;
        const keywords = target.keywords;
        const uniqueKeywords = new Set(keywords.map((k) => k.name));
        return uniqueKeywords.size > target.upgrades.filter((upgrade) => upgrade.isExperience()).length;
    }
}