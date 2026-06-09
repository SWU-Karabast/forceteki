import type { IAbilityHelper } from '../../../AbilityHelper';
import type { AbilityContext } from '../../../core/ability/AbilityContext';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { ZoneName } from '../../../core/Constants';

export default class ImprovisedIdentity extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '6801123100',
            internalName: 'improvised-identity',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setAttachCondition((context) => context.attachTarget.zoneName === ZoneName.GroundArena);

        registrar.addGainActionAbilityTargetingAttached({
            title: 'Search the top 3 cards of your deck for a ground unit and discard it. Then, you may attack with this unit. For this attack, this unit gains the discarded unit\'s abilities.',
            limit: AbilityHelper.limit.perRound(1),
            immediateEffect: AbilityHelper.immediateEffects.sequential([
                AbilityHelper.immediateEffects.deckSearch({
                    activePromptTitle: 'Choose a ground unit to discard',
                    searchCount: 3,
                    cardCondition: (card) =>
                        card.isUnit() &&
                        card.defaultArena === ZoneName.GroundArena,
                    selectedCardsImmediateEffect: AbilityHelper.immediateEffects.discardSpecificCard()
                }),
                AbilityHelper.immediateEffects.attack((context) => {
                    const discardedUnit = context.selectedPromptCards?.[0];
                    const discardedUnitKeywords = discardedUnit?.keywords || [];
                    const attackerLastingEffects = discardedUnit
                        ? {
                            effect: [
                                AbilityHelper.ongoingEffects.gainNonKeywordAbilitiesFromUnit(discardedUnit),
                                AbilityHelper.ongoingEffects.gainKeywords(() =>
                                    discardedUnitKeywords.map((keyword) => keyword.toProperties())
                                )
                            ]
                        }
                        : undefined;

                    return {
                        activePromptTitle: this.buildAttackPromptTitle(context),
                        target: context.source,
                        optional: true,
                        attackerLastingEffects
                    };
                })
            ])
        });
    }

    private buildAttackPromptTitle(context: AbilityContext): string {
        const discardedUnit = context.selectedPromptCards?.[0];
        if (!discardedUnit) {
            return `Attack with ${context.source.title}`;
        }
        return `Attack with ${context.source.title}. It gains ${discardedUnit.title}'s abilities for this attack.`;
    }
}
