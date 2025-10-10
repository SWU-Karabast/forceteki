import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
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
                    event.card === context.source.upgrades[0] &&
                    context.source.upgrades.length === 1 &&
                    event.defeatSource.type === DefeatSourceType.Ability &&
                    event.defeatSource.player !== context.player,
                onCardMoved: (event, context) =>
                    event.card === context.source.upgrades[0] &&
                    context.source.upgrades.length === 1 &&
                    event.destination === 'hand' &&
                    event.context.player !== context.player
            }
        });
    }
}