import type { IAbilityHelper } from '../../../AbilityHelper';
import type { AbilityContext } from '../../../core/ability/AbilityContext';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { Aspect, CardType, EventName, RelativePlayer, TargetMode } from '../../../core/Constants';
import { aspectString, checkConvertToEnum } from '../../../core/utils/EnumHelpers';

export default class LandoCalrissianFullSabacc extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8647843496',
            internalName: 'lando-calrissian#full-sabacc',
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Choose an Aspect, then discard the top card of your deck',
            cost: [
                AbilityHelper.costs.abilityActivationResourceCost(1),
                AbilityHelper.costs.exhaustSelf()
            ],
            targetResolver: {
                activePromptTitle: 'Choose an Aspect',
                mode: TargetMode.DropdownList,
                condition: (context) => context.player.drawDeck.length > 0,
                options: [Aspect.Vigilance, Aspect.Command, Aspect.Aggression, Aspect.Cunning, Aspect.Villainy, Aspect.Heroism]
                    .map((a) => aspectString([a])),
                immediateEffect: AbilityHelper.immediateEffects.discardFromDeck((context) => ({
                    amount: 1,
                    target: context.player
                }))
            },
            then: (thenContext) => ({
                title: 'Create a Credit token',
                thenCondition: () => thenContext.select && this.hasChosenAspect(thenContext),
                immediateEffect: AbilityHelper.immediateEffects.createCreditToken()
            })
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Defeat a friendly Credit token to create 3 Credit tokens',
            optional: true,
            when: {
                onLeaderDeployed: (event, context) => event.card === context.source
            },
            targetResolver: {
                cardTypeFilter: CardType.TokenCard,
                controller: RelativePlayer.Self,
                cardCondition: (card) => card.isCreditToken(),
                immediateEffect: AbilityHelper.immediateEffects.defeat(),
            },
            ifYouDo: {
                title: 'Create 3 Credit tokens',
                immediateEffect: AbilityHelper.immediateEffects.createCreditToken({
                    amount: 3
                })
            }
        });
    }

    private hasChosenAspect(context: AbilityContext): boolean {
        const chosenAspect = checkConvertToEnum(context.select.toLowerCase(), Aspect)[0];
        const discardedCards = context.events
            .filter((e) => e.name === EventName.OnCardDiscarded)
            .map((e) => e.card);

        if (discardedCards.length === 0) {
            return false;
        }

        return discardedCards[0].aspects.includes(chosenAspect);
    }
}