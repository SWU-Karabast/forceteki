import type { IAbilityHelper } from '../../../AbilityHelper';
import type {
    ILeaderUnitAbilityRegistrar,
    ILeaderUnitLeaderSideAbilityRegistrar
} from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { EventName, RelativePlayer, TargetMode, WildcardCardType } from '../../../core/Constants';
import { EventResolutionStatus } from '../../../core/event/GameEvent';

export default class TobiasBeckettPeopleArePredictable extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2772051314',
            internalName: 'tobias-beckett#people-are-predictable',
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Give control of a friendly unit to create a Credit token',
            cost: [abilityHelper.costs.exhaustSelf()],
            targetResolver: {
                activePromptTitle: 'Choose a friendly unit. Opponent takes control of it. If they do, create a Credit token.',
                controller: RelativePlayer.Self,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: abilityHelper.immediateEffects.takeControlOfUnit((context) => ({
                    newController: context.player.opponent
                }))
            },
            ifYouDo: {
                title: 'Create a Credit token',
                immediateEffect: abilityHelper.immediateEffects.createCreditToken()
            }
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Defeat any number of units you own but don\'t control. For each unit defeated this way, create a Credit token and draw a card.',
            optional: true,
            when: {
                onLeaderDeployed: (event, context) => event.card === context.source
            },
            targetResolver: {
                mode: TargetMode.Unlimited,
                canChooseNoCards: true,
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Opponent,
                cardCondition: (card, context) => card.isUnit() && card.owner === context.player,
                immediateEffect: abilityHelper.immediateEffects.defeat()
            },
            ifYouDo: (ifYouDoContext) => {
                const defeatResolved = ifYouDoContext.events.filter((e) => e.name === EventName.OnCardDefeated && e.resolutionStatus === EventResolutionStatus.RESOLVED).length;
                return ({
                    title: 'For each unit defeated this way, create a Credit token and draw a card',
                    immediateEffect: abilityHelper.immediateEffects.simultaneous([
                        abilityHelper.immediateEffects.createCreditToken({ amount: defeatResolved }),
                        abilityHelper.immediateEffects.draw({ amount: defeatResolved }),
                    ])
                });
            }
        });
    }
}
