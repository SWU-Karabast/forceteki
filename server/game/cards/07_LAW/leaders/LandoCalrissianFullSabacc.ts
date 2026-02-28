import type { IAbilityHelper } from '../../../AbilityHelper';
import type { AbilityContext } from '../../../core/ability/AbilityContext';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { Aspect, EventName, TargetMode } from '../../../core/Constants';
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
            title: 'Choose an Aspect, then discard the top card from a deck',
            cost: [
                AbilityHelper.costs.abilityActivationResourceCost(1),
                AbilityHelper.costs.exhaustSelf()
            ],
            targetResolver: {
                activePromptTitle: 'Choose an Aspect',
                mode: TargetMode.DropdownList,
                options: [Aspect.Vigilance, Aspect.Command, Aspect.Aggression, Aspect.Cunning, Aspect.Villainy, Aspect.Heroism]
                    .map((a) => aspectString([a]))
            },
            then: (outerContext) => ({
                title: 'Choose a deck to discard from',
                targetResolver: {
                    activePromptTitle: 'Choose a deck to discard from',
                    mode: TargetMode.Player,
                    immediateEffect: AbilityHelper.immediateEffects.discardFromDeck({
                        amount: 1
                    })
                },
                then: (innerContext) => ({
                    title: 'Create a Credit token',
                    thenCondition: () => outerContext.select && this.hasChosenAspect(outerContext.select, innerContext),
                    immediateEffect: AbilityHelper.immediateEffects.createCreditToken()
                })
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

    private hasChosenAspect(aspectStr: string, context: AbilityContext): boolean {
        const chosenAspect = checkConvertToEnum(aspectStr.toLowerCase(), Aspect)[0];
        const discardedCards = context.events
            .filter((e) => e.name === EventName.OnCardDiscarded)
            .map((e) => e.card);

        if (discardedCards.length === 0) {
            return false;
        }

        return discardedCards[0].aspects.includes(chosenAspect);
    }
}