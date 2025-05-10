import AbilityHelper from '../../../AbilityHelper';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import * as EventHelpers from '../../../core/event/EventHelpers';

export default class DarthRevanScourgeOfTheOldRepublic extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4637578649',
            internalName: 'darth-revan#scourge-of-the-old-republic',
        };
    }

    protected override setupLeaderSideAbilities() {
        this.addTriggeredAbility({
            title: 'Exhaust this leader',
            when: {
                onCardDefeated: (event, context) =>
                    event.isDefeatedByAttackerDamage && EventHelpers.defeatSourceCard(event)?.controller === context.player
            },
            optional: true,
            // currently the only way to have multiple simultaneous triggers for this is with TWI Darth Maul,
            // in which case we don't need to trigger for both defeats since they're both giving an experience token to the same unit
            collectiveTrigger: true,
            immediateEffect: AbilityHelper.immediateEffects.exhaust(),
            ifYouDo: (ifYouDoContext) => ({
                title: 'Give an Experience token to the attacking unit',
                immediateEffect: AbilityHelper.immediateEffects.giveExperience({
                    target: EventHelpers.defeatSourceCard(ifYouDoContext.events[0]?.context?.event)
                })
            })
        });
    }

    protected override setupLeaderUnitSideAbilities() {
        this.addTriggeredAbility({
            title: 'Give an Experience token to the attacking unit',
            when: {
                onCardDefeated: (event, context) =>
                    event.isDefeatedByAttackerDamage && EventHelpers.defeatSourceCard(event)?.controller === context.player
            },
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.giveExperience((context) => ({
                target: EventHelpers.defeatSourceCard(context.event)
            }))
        });
    }
}
