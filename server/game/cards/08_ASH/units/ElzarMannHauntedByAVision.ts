import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { EffectName, RelativePlayer, Trait, WildcardCardType, WildcardZoneName } from '../../../core/Constants';
import { OngoingEffectBuilder } from '../../../core/ongoingEffect/OngoingEffectBuilder';

export default class ElzarMannHauntedByAVision extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'elzar-mann#haunted-by-a-vision-id',
            internalName: 'elzar-mann#haunted-by-a-vision'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'While you control a Force leader, this unit enters play ready',
            sourceZoneFilter: WildcardZoneName.Any,
            condition: (context) => context.player.leader.hasSomeTrait(Trait.Force),
            ongoingEffect: OngoingEffectBuilder.card.static(EffectName.EntersPlayReady)
        });

        registrar.addWhenPlayedAbility({
            title: 'Distribute up to 5 Advantage tokens among other friendly units',
            immediateEffect: AbilityHelper.immediateEffects.distributeAdvantageAmong({
                amountToDistribute: 5,
                canChooseNoTargets: true,
                canDistributeLess: true,
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Self,
                cardCondition: (card, context) => card !== context.source,
            }),
            ifYouDo: (ifYouDoContext) => ({
                title: 'An opponent searches twice that many cards from the top of their deck for an event, reveals it, and draws it',
                ifYouDoCondition: () => ifYouDoContext.events[0].totalDistributed > 0,
                immediateEffect: AbilityHelper.immediateEffects.deckSearch({
                    activePromptTitle: 'Reveal and draw an event',
                    target: ifYouDoContext.player.opponent,
                    searchCount: 2 * ifYouDoContext.events[0].totalDistributed,
                    selectCount: 1,
                    cardCondition: (card) => card.isEvent(),
                    selectedCardsImmediateEffect: AbilityHelper.immediateEffects.revealAndDraw({
                        useDisplayPrompt: true,
                        promptedPlayer: RelativePlayer.Opponent
                    })
                })
            })
        });
    }
}
