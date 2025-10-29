import type { IAbilityHelper } from '../../../AbilityHelper';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { Aspect, Conjunction, EventName, WildcardCardType } from '../../../core/Constants';
import { DiscloseMode } from '../../../gameSystems/DiscloseAspectsSystem';
import * as EnumHelpers from '../../../core/utils/EnumHelpers';
import * as Contract from '../../../core/utils/Contract';
import type { AbilityContext } from '../../../core/ability/AbilityContext';
import type { Card } from '../../../core/card/Card';

export default class LeiaOrganaOfASecretBloodline extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2281320807',
            internalName: 'leia-organa#of-a-secret-bloodline',
        };
    }

    protected override setupLeaderSideAbilities(
        registrar: ILeaderUnitLeaderSideAbilityRegistrar,
        AbilityHelper: IAbilityHelper
    ) {
        const aspects = [Aspect.Vigilance, Aspect.Command, Aspect.Aggression, Aspect.Cunning, Aspect.Heroism];
        registrar.addActionAbility({
            title: `Disclose ${EnumHelpers.aspectString(aspects, Conjunction.Or)} to give an experience token to a unit that does not share an aspect with the disclosed card`,
            cost: [
                AbilityHelper.costs.abilityActivationResourceCost(1),
                AbilityHelper.costs.exhaustSelf()
            ],
            immediateEffect: AbilityHelper.immediateEffects.disclose({
                aspects: aspects,
                mode: DiscloseMode.Any
            }),
            ifYouDo: (ifYouDoContext) => ({
                title: `Give an experience token to a unit that does not have a ${this.reducedAspectList(this.disclosedCard(ifYouDoContext).aspects)} aspect`,
                targetResolver: {
                    cardTypeFilter: WildcardCardType.Unit,
                    cardCondition: (card, _) => !this.disclosedCardSharesAspect(ifYouDoContext, card),
                    immediateEffect: AbilityHelper.immediateEffects.giveExperience()
                }
            })
        });
    }

    protected override setupLeaderUnitSideAbilities(
        registrar: ILeaderUnitAbilityRegistrar,
        AbilityHelper: IAbilityHelper
    ) {
        const aspects = [Aspect.Vigilance, Aspect.Command, Aspect.Aggression, Aspect.Cunning, Aspect.Heroism];
        registrar.addOnAttackAbility({
            title: `Disclose ${EnumHelpers.aspectString(aspects, Conjunction.Or)} to give an experience token to a unit that does not share an aspect with the disclosed card`,
            immediateEffect: AbilityHelper.immediateEffects.disclose({
                aspects: aspects,
                mode: DiscloseMode.Any
            }),
            ifYouDo: (ifYouDoContext) => ({
                title: `Give an experience token to a unit that does not have a ${this.reducedAspectList(this.disclosedCard(ifYouDoContext).aspects)} aspect`,
                targetResolver: {
                    cardTypeFilter: WildcardCardType.Unit,
                    cardCondition: (card, _) => !this.disclosedCardSharesAspect(ifYouDoContext, card),
                    immediateEffect: AbilityHelper.immediateEffects.giveExperience()
                }
            })
        });
    }

    private disclosedCard(context: AbilityContext): Card {
        const revealedCards = context.events
            .filter((event) => event.name === EventName.OnAspectsDisclosed)
            .flatMap((event) => event.disclosedCards || []);

        // Only one card should be revealed
        Contract.assertArraySize(revealedCards, 1);

        return revealedCards[0];
    }

    private disclosedCardSharesAspect(context: AbilityContext, card: Card): boolean {
        const disclosedCard = this.disclosedCard(context);

        return card.aspects.some((aspect) => disclosedCard.aspects.includes(aspect));
    }

    private reducedAspectList(aspects: Aspect[]): string {
        // Eliminate duplicates so we don't say "Vigilance or Vigilance" in the ifYouDo ability title
        const set = new Set(aspects);
        return EnumHelpers.aspectString(Array.from(set), Conjunction.Or);
    }
}