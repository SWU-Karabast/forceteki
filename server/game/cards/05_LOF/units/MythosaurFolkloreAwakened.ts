import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityType, EventName, RelativePlayer, Trait, WildcardCardType, WildcardZoneName, ZoneName } from '../../../core/Constants';
import { ExhaustSourceType } from '../../../IDamageOrDefeatSource';

export default class MythosaurFolkloreAwakened extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'mythosaur#folklore-awakened-id',
            internalName: 'mythosaur#folklore-awakened',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'Friendly upgraded units can\'t be exhausted or returned to hand by enemy card abilities',
            matchTarget: (card, context) =>
                card.controller === context.player &&
                card.isUnit() &&
                card.isUpgraded(),
            ongoingEffect: AbilityHelper.ongoingEffects.gainAbility({
                title: 'This unit can\'t be exhausted or returned to hand by enemy card abilities',
                type: AbilityType.ReplacementEffect,
                effect: 'prevent {1} from {2}',
                effectArgs: (context) => [
                    context.source,
                    context.event.name === EventName.OnCardExhausted
                        ? 'being exhausted'
                        : 'returning to hand'
                ],
                when: {
                    onCardExhausted: (event, context) =>
                        event.card === context.source &&
                        event.exhaustSource.type === ExhaustSourceType.Ability &&
                        event.exhaustSource.player !== context.player,
                    onCardMoved: (event, context) =>
                        event.card === context.source &&
                        event.destination === ZoneName.Hand &&
                        event.context.player !== context.player
                }
            })
        });

        registrar.addConstantAbility({
            title: 'Friendly leaders gain the Mandalorian trait',
            targetZoneFilter: WildcardZoneName.Any,
            targetController: RelativePlayer.Self,
            targetCardTypeFilter: WildcardCardType.Any,
            matchTarget: (card) => card.isLeader(),
            ongoingEffect: AbilityHelper.ongoingEffects.gainTrait(Trait.Mandalorian)
        });
    }
}
