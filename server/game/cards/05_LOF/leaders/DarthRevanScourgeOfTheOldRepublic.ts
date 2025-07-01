import AbilityHelper from '../../../AbilityHelper';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { DefeatCardSystem } from '../../../gameSystems/DefeatCardSystem';

export default class DarthRevanScourgeOfTheOldRepublic extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4637578649',
            internalName: 'darth-revan#scourge-of-the-old-republic',
        };
    }

    protected override setupLeaderSideAbilities(card: this) {
        card.addTriggeredAbility({
            title: 'Exhaust this leader to give an Experience token to the attacking unit',
            when: {
                onCardDefeated: (event, context) =>
                    event.isDefeatedByAttacker && DefeatCardSystem.defeatSourceCard(event)?.controller === context.player
            },
            optional: true,
            // currently the only way to have multiple simultaneous triggers for this is with TWI Darth Maul,
            // in which case we don't need to trigger for both defeats since they're both giving an experience token to the same unit
            collectiveTrigger: true,
            immediateEffect: AbilityHelper.immediateEffects.exhaust(),
            ifYouDo: (ifYouDoContext) => ({
                title: 'Give an Experience token to the attacking unit',
                immediateEffect: AbilityHelper.immediateEffects.giveExperience({
                    target: DefeatCardSystem.defeatSourceCard(ifYouDoContext.events[0]?.context?.event)
                })
            })
        });
    }

    protected override setupLeaderUnitSideAbilities(card: this) {
        card.addTriggeredAbility({
            title: 'Give an Experience token to the attacking unit',
            when: {
                onCardDefeated: (event, context) =>
                    event.isDefeatedByAttacker && DefeatCardSystem.defeatSourceCard(event)?.controller === context.player
            },
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.giveExperience((context) => ({
                target: DefeatCardSystem.defeatSourceCard(context.event)
            }))
        });
    }
}
