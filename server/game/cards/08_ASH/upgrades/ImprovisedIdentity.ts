import type { IAbilityHelper } from '../../../AbilityHelper';
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
            immediateEffect: AbilityHelper.immediateEffects.deckSearch({
                activePromptTitle: 'Choose a ground unit to discard',
                searchCount: 3,
                cardCondition: (card) =>
                    card.isUnit() &&
                    card.defaultArena === ZoneName.GroundArena,
                selectedCardsImmediateEffect: AbilityHelper.immediateEffects.sequential([
                    AbilityHelper.immediateEffects.discardSpecificCard(),
                    AbilityHelper.immediateEffects.attack((deckSearchContext) => {
                        const discardedUnit = deckSearchContext.selectedPromptCards[0];
                        const keywords = discardedUnit.keywords;
                        return {
                            activePromptTitle: `Attack with ${deckSearchContext.source.title}. It gains ${discardedUnit.title}'s abilities for this attack.`,
                            target: deckSearchContext.source,
                            optional: true,
                            attackerLastingEffects: {
                                effect: [
                                    AbilityHelper.ongoingEffects.gainNonKeywordAbilitiesFromUnit(discardedUnit),
                                    AbilityHelper.ongoingEffects.gainKeywords(() =>
                                        keywords.map((keyword) => keyword.toProperties())
                                    )
                                ]
                            }
                        };
                    })
                ])
            })
        });
    }
}
