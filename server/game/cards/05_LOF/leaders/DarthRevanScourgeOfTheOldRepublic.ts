import AbilityHelper from '../../../AbilityHelper';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';

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
                    // TODO: update trigger condition so that defender being defeated by attacker at the 'on attack' stage will also work
                    event.isDefeatedByAttackerDamage &&
                    event.defeatSource.attack.attacker.controller === context.player
            },
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.exhaust(),
            ifYouDo: (ifYouDoContext) => ({
                title: 'Give an Experience token to the attacking unit',
                // ifYouDoCondition: (ifYouDoContext) =>
                //     // need to confirm that the attacker wasn't defeated  // and is still in play as a unit (e.g. JTL L3-37)
                //     ifYouDoContext.events[0].defeatSource.attack.attacker.isInPlay(),
                // // && ifYouDoContext.events[0].defeatSource.attack.attacker.isUnit(),
                immediateEffect: AbilityHelper.immediateEffects.giveExperience({
                    target: ifYouDoContext.events[0]?.context?.event?.defeatSource?.attack?.attacker
                })
            })
        });
    }

    protected override setupLeaderUnitSideAbilities() {
        // this.addOnAttackAbility({
        //     title: 'The next unit you play this phase gains Hidden',
        //     immediateEffect: AbilityHelper.immediateEffects.delayedPlayerEffect({
        //         title: 'The next unit you play this phase gains Hidden',
        //         when: {
        //             onCardPlayed: (event, context) => this.isUnitPlayedEvent(event, context),
        //         },
        //         duration: Duration.UntilEndOfPhase,
        //         effectDescription: 'give Hidden to the next unit they will play this phase',
        //         immediateEffect: AbilityHelper.immediateEffects.cardLastingEffect((context) => ({
        //             target: context.events.find((event) => this.isUnitPlayedEvent(event, context)).card,
        //             effect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Hidden),
        //             duration: Duration.Persistent,
        //         }))
        //     })
        // });
    }
}
