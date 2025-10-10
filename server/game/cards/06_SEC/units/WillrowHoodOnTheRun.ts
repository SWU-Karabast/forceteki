import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { ZoneName } from '../../../core/Constants';
import { DefeatSourceType } from '../../../IDamageOrDefeatSource';

export default class WillrowHoodOnTheRun extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'willrow-hood#on-the-run-id',
            internalName: 'willrow-hood#on-the-run',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addReplacementEffectAbility({
            title: 'Upgrade cannot be defeated or returned to hand by enemy card abilities',
            when: {
                onCardDefeated: (event, context) =>
                    context.source.upgrades.filter((upgrade) => upgrade.owner === context.player).length === 1 &&
                    context.source.upgrades.includes(event.card) &&
                    event.card.owner === context.player &&
                    event.defeatSource.type === DefeatSourceType.Ability &&
                    event.defeatSource.player !== context.player,
                onCardMoved: (event, context) =>
                    context.source.upgrades.filter((upgrade) => upgrade.owner === context.player).length === 1 &&
                    event.card.owner === context.player &&
                    context.source.upgrades.includes(event.card) &&
                    event.destination === ZoneName.Hand &&
                    event.context.player !== context.player
            }
        });
    }
}