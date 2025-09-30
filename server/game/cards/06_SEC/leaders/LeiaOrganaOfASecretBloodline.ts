import type { IAbilityHelper } from '../../../AbilityHelper';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { Aspect, EventName, WildcardCardType } from '../../../core/Constants';
import { DiscloseMode } from '../../../gameSystems/DiscloseAspectsSystem';
import * as Helpers from '../../../core/utils/Helpers';
import * as Contract from '../../../core/utils/Contract';
import type { AbilityContext } from '../../../core/ability/AbilityContext';
import type { Card } from '../../../core/card/Card';

export default class LeiaOrganaOfASecretBloodline extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'leia-organa#of-a-secret-bloodline-id',
            internalName: 'leia-organa#of-a-secret-bloodline',
        };
    }

    protected override setupLeaderSideAbilities(
        registrar: ILeaderUnitLeaderSideAbilityRegistrar,
        AbilityHelper: IAbilityHelper
    ) {
        const aspects = [Aspect.Vigilance, Aspect.Command, Aspect.Aggression, Aspect.Cunning, Aspect.Heroism];
        registrar.addActionAbility({
            title: `Disclose ${Helpers.aspectString(aspects, 'or')} to give an experience token to a unit that does not share an aspect with the disclosed card`,
            cost: AbilityHelper.costs.exhaustSelf(),
            immediateEffect: AbilityHelper.immediateEffects.disclose({
                aspects: aspects,
                mode: DiscloseMode.Any
            }),
            ifYouDo: (ifYouDoContext) => ({
                title: 'Give experience to a unit that does not share an aspect with the disclosed card',
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
            title: `Disclose ${Helpers.aspectString(aspects, 'or')} to give an experience token to a unit that does not share an aspect with the disclosed card`,
            immediateEffect: AbilityHelper.immediateEffects.disclose({
                aspects: aspects,
                mode: DiscloseMode.Any
            }),
            ifYouDo: (ifYouDoContext) => ({
                title: 'Give experience to a unit that does not share an aspect with the disclosed card',
                targetResolver: {
                    cardTypeFilter: WildcardCardType.Unit,
                    cardCondition: (card, _) => !this.disclosedCardSharesAspect(ifYouDoContext, card),
                    immediateEffect: AbilityHelper.immediateEffects.giveExperience()
                }
            })
        });
    }

    private disclosedCardSharesAspect(context: AbilityContext, card: Card): boolean {
        const revealedCards = context.events
            .filter((event) => event.name === EventName.OnCardRevealed)
            .flatMap((event) => event.cards);

        // Only one card should be revealed
        Contract.assertArraySize(revealedCards, 1);

        const disclosedCard = revealedCards[0];

        return card.aspects.some((aspect) => disclosedCard.aspects.includes(aspect));
    }
}