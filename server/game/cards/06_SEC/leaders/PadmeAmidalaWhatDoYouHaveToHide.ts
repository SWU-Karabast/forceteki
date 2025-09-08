import type { IAbilityHelper } from '../../../AbilityHelper';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { WildcardCardType, WildcardZoneName, ZoneName } from '../../../core/Constants';

export default class PadmeAmidalaWhatDoYouHaveToHide extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'padme-amidala#what-do-you-have-to-hide-id',
            internalName: 'padme-amidala#what-do-you-have-to-hide',
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, AbilityHelper: IAbilityHelper): void {
        registrar.addTriggeredAbility({
            title: 'Exhaust Padmé Amidala to deal 1 damage to a unit',
            optional: true,
            collectiveTrigger: true,
            when: {
                onCardDiscarded: (event, context) =>
                    event.card.owner === context.player &&
                    event.discardedFromZone === ZoneName.Hand,
                onCardRevealed: (event, context) => event.player === context.player,
            },
            immediateEffect: AbilityHelper.immediateEffects.exhaust(),
            ifYouDo: {
                title: 'Deal 1 damage to a unit',
                targetResolver: {
                    cardTypeFilter: WildcardCardType.Unit,
                    zoneFilter: WildcardZoneName.AnyArena,
                    immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 1 })
                }
            }
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper): void {
        registrar.addTriggeredAbility({
            title: 'Deal 1 damage to a unit',
            optional: true,
            collectiveTrigger: true,
            when: {
                onCardDiscarded: (event, context) =>
                    event.card.owner === context.player &&
                    event.discardedFromZone === ZoneName.Hand,
                onCardRevealed: (event, context) => event.player === context.player,
            },
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                zoneFilter: WildcardZoneName.AnyArena,
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 1 })
            }
        });
    }

    // private shouldTriggerAbility(event, context: AbilityContext): boolean {
    //     const window = event.window;
    //     const discardEvents = window.events
    //         .filter((e) =>
    //             e.name === EventName.OnCardDiscarded &&
    //             e.card.owner === context.player &&
    //             e.discardedFromZone === ZoneName.Hand
    //         );

    //     if (discardEvents.length === 0) {
    //         return false;
    //     }

    //     return discardEvents[discardEvents.length - 1] === event;
    // }
}