import type { IAbilityHelper } from '../../../AbilityHelper';
import type { AbilityContext } from '../../../core/ability/AbilityContext';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { Aspect, EventName, TargetMode } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class LandoCalrissianFullSabacc extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8647843496',
            internalName: 'lando-calrissian#full-sabacc',
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Choose an Aspect, then discard the top card from a deck',
            cost: [
                AbilityHelper.costs.abilityActivationResourceCost(1),
                AbilityHelper.costs.exhaustSelf()
            ],
            targetResolvers: {
                aspect: {
                    activePromptTitle: 'Choose an aspect',
                    mode: TargetMode.Select,
                    choices: {
                        [TextHelper.Vigilance]: this.choiceHandler(Aspect.Vigilance, AbilityHelper),
                        [TextHelper.Command]: this.choiceHandler(Aspect.Command, AbilityHelper),
                        [TextHelper.Aggression]: this.choiceHandler(Aspect.Aggression, AbilityHelper),
                        [TextHelper.Cunning]: this.choiceHandler(Aspect.Cunning, AbilityHelper),
                        [TextHelper.Villainy]: this.choiceHandler(Aspect.Villainy, AbilityHelper),
                        [TextHelper.Heroism]: this.choiceHandler(Aspect.Heroism, AbilityHelper)
                    }
                },
                deck: {
                    activePromptTitle: 'Choose a deck to discard from',
                    mode: TargetMode.Player,
                    immediateEffect: AbilityHelper.immediateEffects.discardFromDeck({
                        amount: 1
                    })
                }
            },
            then: (thenContext) => ({
                title: 'Create a Credit token',
                thenCondition: () => this.discardedCardHasChosenAspect(thenContext),
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
            immediateEffect: AbilityHelper.immediateEffects.conditional((context) => ({
                condition: context.player.creditTokenCount > 0,
                onTrue: AbilityHelper.immediateEffects.defeat({
                    target: context.player.baseZone.credits[0]
                })
            })),
            ifYouDo: {
                title: 'Create 3 Credit tokens',
                immediateEffect: AbilityHelper.immediateEffects.createCreditToken({
                    amount: 3
                })
            }
        });
    }

    private choiceHandler(aspect: Aspect, AbilityHelper: IAbilityHelper) {
        return AbilityHelper.immediateEffects.handler({
            handler: (context) => context['_landoChosenAspect'] = aspect,
            effectMessage: () => ['choose {0}', [TextHelper.aspect(aspect)]]
        });
    }

    private discardedCardHasChosenAspect(context: AbilityContext): boolean {
        const aspect = context['_landoChosenAspect'] as Aspect;
        const discardedCards = context.events
            .filter((e) => e.name === EventName.OnCardDiscarded)
            .map((e) => e.card);

        if (discardedCards.length === 0) {
            return false;
        }

        return discardedCards[0].aspects.includes(aspect);
    }
}