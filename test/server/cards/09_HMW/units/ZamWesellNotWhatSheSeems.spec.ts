import { Trait } from '../../../../../server/game/core/Constants';

describe('Zam Wesell, Not What She Seems', function() {
    integration(function(contextRef) {
        describe('its trait-granting ability', function() {
            it('should gain a trait from an undeployed friendly leader while in play', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['zam-wesell#not-what-she-seems'],
                        leader: { card: 'saw-gerrera#bring-down-the-empire', deployed: false }
                    }
                });

                const { context } = contextRef;

                expect(context.zamWesell.hasSomeTrait(Trait.Rebel)).toBeTrue();
            });

            it('should gain a trait from a deployed friendly leader unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['zam-wesell#not-what-she-seems'],
                        leader: { card: 'saw-gerrera#bring-down-the-empire', deployed: true }
                    }
                });

                const { context } = contextRef;

                expect(context.zamWesell.hasSomeTrait(Trait.Rebel)).toBeTrue();
            });

            it('should gain a friendly leader\'s traits but exclude Force', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['zam-wesell#not-what-she-seems'],
                        leader: { card: 'chirrut-imwe#one-with-the-force', deployed: false }
                    }
                });

                const { context } = contextRef;

                expect(context.zamWesell.hasSomeTrait(Trait.Rebel)).toBeTrue();
                expect(context.zamWesell.hasSomeTrait(Trait.Force)).toBeFalse();
            });

            it('should gain leader traits without duplicating traits she already has', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['zam-wesell#not-what-she-seems'],
                        // Jango Fett's traits (Underworld, Bounty Hunter) are identical to Zam's own printed traits
                        leader: { card: 'jango-fett#concealing-the-conspiracy', deployed: false }
                    }
                });

                const { context } = contextRef;

                expect(context.zamWesell.hasEveryTrait([Trait.Underworld, Trait.BountyHunter])).toBeTrue();

                // No duplication despite the overlap between Zam's printed traits and the leader's traits
                expect(context.zamWesell.traits.size).toBe(2);
            });

            it('should gain a friendly leader\'s traits while she is in hand', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['zam-wesell#not-what-she-seems'],
                        leader: { card: 'saw-gerrera#bring-down-the-empire', deployed: false }
                    }
                });

                const { context } = contextRef;

                expect(context.zamWesell).toBeInZone('hand');
                expect(context.zamWesell.hasSomeTrait(Trait.Rebel)).toBeTrue();
            });

            it('should gain a friendly leader\'s traits while she is in the discard pile', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        discard: ['zam-wesell#not-what-she-seems'],
                        leader: { card: 'saw-gerrera#bring-down-the-empire', deployed: false }
                    }
                });

                const { context } = contextRef;

                expect(context.zamWesell).toBeInZone('discard');
                expect(context.zamWesell.hasSomeTrait(Trait.Rebel)).toBeTrue();
            });

            it('should continue to grant the leader\'s trait after the leader deploys as a unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['zam-wesell#not-what-she-seems'],
                        leader: { card: 'saw-gerrera#bring-down-the-empire', deployed: false }
                    }
                });

                const { context } = contextRef;

                // Trait is granted while the leader is undeployed, in the base zone
                expect(context.zamWesell.hasSomeTrait(Trait.Rebel)).toBeTrue();

                // Deploying the leader as a unit mid-phase re-evaluates the dynamic effect;
                // the trait grant should keep working across the zone/type change
                context.player1.setLeaderStatus({ card: 'saw-gerrera#bring-down-the-empire', deployed: true });

                expect(context.sawGerrera).toBeInZone('groundArena');
                expect(context.zamWesell.hasSomeTrait(Trait.Rebel)).toBeTrue();
            });

            it('should not gain any traits from a friendly leader whose only trait is Force', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['zam-wesell#not-what-she-seems'],
                        leader: { card: 'osha#haunted-by-her-past', deployed: false }
                    }
                });

                const { context } = contextRef;

                // Only Zam's own printed traits remain; Osha's only trait (Force) grants nothing
                expect(context.zamWesell.hasSomeTrait(Trait.Force)).toBeFalse();
                expect(context.zamWesell.hasEveryTrait([Trait.Underworld, Trait.BountyHunter])).toBeTrue();
                expect(context.zamWesell.traits.size).toBe(2);
            });

            it('should not gain traits from an enemy leader', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['zam-wesell#not-what-she-seems'],
                        leader: { card: 'saw-gerrera#bring-down-the-empire', deployed: false }
                    },
                    player2: {
                        leader: { card: 'leia-organa#alliance-general', deployed: false }
                    }
                });

                const { context } = contextRef;

                expect(context.zamWesell.hasSomeTrait(Trait.Official)).toBeFalse();
            });

            it('should gain traits from a friendly non-leader unit made a leader unit by The Darksaber', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [
                            'zam-wesell#not-what-she-seems',
                            { card: 'r2d2#ignoring-protocol', upgrades: ['the-darksaber#icon-of-leadership'] }
                        ],
                        // Osha's only trait is Force, which contributes nothing, so any gained traits
                        // are unambiguously coming from R2-D2 (made a leader unit by The Darksaber)
                        leader: { card: 'osha#haunted-by-her-past', deployed: false }
                    }
                });

                const { context } = contextRef;

                expect(context.r2d2.isLeader()).toBeTrue();

                // Mandalorian is granted directly by The Darksaber; Droid is R2-D2's own printed trait
                expect(context.zamWesell.hasSomeTrait(Trait.Mandalorian)).toBeTrue();
                expect(context.zamWesell.hasSomeTrait(Trait.Droid)).toBeTrue();
                expect(context.zamWesell.hasSomeTrait(Trait.Force)).toBeFalse();
            });

            it('should gain traits from both a pilot leader deployed as an upgrade and its host Vehicle unit, and can herself hold a Pilot upgrade once she gains the Vehicle trait', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['zam-wesell#not-what-she-seems'],
                        spaceArena: ['alliance-xwing'],
                        hand: ['dagger-squadron-pilot'],
                        leader: { card: 'major-vonreg#red-baron', deployed: false }
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.majorVonreg);
                context.player1.clickPrompt('Deploy Major Vonreg as a Pilot');
                context.player1.clickCard(context.allianceXwing);

                expect(context.allianceXwing.isLeader()).toBeTrue();

                // First Order is Major Vonreg's own trait; Vehicle is the host unit's own printed trait,
                // gained because the host is now a leader unit via the EffectName.IsLeader designation
                expect(context.zamWesell.hasSomeTrait(Trait.FirstOrder)).toBeTrue();
                expect(context.zamWesell.hasSomeTrait(Trait.Vehicle)).toBeTrue();

                // Deploying the leader was player1's action for the turn; pass through player2's
                // turn so player1 can act again
                context.player2.passAction();

                // Prove the gained Vehicle trait through gameplay: Piloting can only attach to a
                // friendly Vehicle unit without a Pilot upgrade on it. Alliance X-Wing already has
                // Major Vonreg attached as a Pilot, so Zam is the only eligible target here, and
                // that is only possible because she now counts as a Vehicle unit.
                context.player1.clickCard(context.daggerSquadronPilot);
                context.player1.clickPrompt('Play Dagger Squadron Pilot with Piloting');
                expect(context.player1).toBeAbleToSelectExactly([context.zamWesell]);
                context.player1.clickCard(context.zamWesell);

                expect(context.zamWesell).toHaveExactUpgradeNames(['dagger-squadron-pilot']);
            });
        });

        describe('proving traits through game interactions', function() {
            it('is a valid target for Wing Leader\'s When Played ability as a friendly Rebel unit, gained from an undeployed leader while in play', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['zam-wesell#not-what-she-seems'],
                        hand: ['wing-leader'],
                        leader: { card: 'chirrut-imwe#one-with-the-force', deployed: false }
                    }
                });

                const { context } = contextRef;

                // Chirrut is undeployed, so Zam (via her gained Rebel trait) is the only
                // other friendly Rebel unit in play that Wing Leader can target
                context.player1.clickCard(context.wingLeader);
                expect(context.player1).toBeAbleToSelectExactly([context.zamWesell]);
                context.player1.clickCard(context.zamWesell);

                expect(context.zamWesell).toHaveExactUpgradeNames(['experience', 'experience']);
            });

            it('cannot be attached to by Bolstered Endurance, since her gained leader traits exclude Force', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['zam-wesell#not-what-she-seems'],
                        hand: ['bolstered-endurance'],
                        leader: { card: 'chirrut-imwe#one-with-the-force', deployed: true }
                    }
                });

                const { context } = contextRef;

                // Deployed Chirrut is a friendly leader unit with the Force trait; Zam gains his
                // Rebel trait but not Force, so only Chirrut himself is an eligible attach target
                context.player1.clickCard(context.bolsteredEndurance);
                expect(context.player1).toBeAbleToSelectExactly([context.chirrutImwe]);
                context.player1.clickCard(context.chirrutImwe);

                expect(context.bolsteredEndurance).toBeAttachedTo(context.chirrutImwe);
            });

            it('can be found by Psychometry for sharing her gained Rebel trait, even while she is in the discard pile', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['psychometry'],
                        discard: ['zam-wesell#not-what-she-seems'],
                        leader: { card: 'chirrut-imwe#one-with-the-force', deployed: false },
                        // Fleet Lieutenant shares only the granted Rebel trait with Zam (not Underworld
                        // or Bounty Hunter); the rest share no trait with her at all
                        deck: ['fleet-lieutenant', 'mystic-reflection', 'krayt-dragon', 'wampa', 'moisture-farmer']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.psychometry);
                expect(context.player1).toBeAbleToSelectExactly([context.zamWesell]);
                context.player1.clickCard(context.zamWesell);

                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.fleetLieutenant],
                    invalid: [context.mysticReflection, context.kraytDragon, context.wampa, context.moistureFarmer]
                });
                context.player1.clickCardInDisplayCardPrompt(context.fleetLieutenant);

                // P2 is prompted to see the revealed card
                expect(context.player2).toHaveExactViewableDisplayPromptCards([context.fleetLieutenant]);
                context.player2.clickDone();

                expect(context.fleetLieutenant).toBeInZone('hand');
            });

            it('gains the Hutt trait from a deployed Jabba the Hutt while in hand, and can attack the same phase when played with a Credit-granted Ambush', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['zam-wesell#not-what-she-seems'],
                        leader: { card: 'jabba-the-hutt#crime-boss', deployed: true },
                        credits: 1
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                // Hutt is not one of Zam's printed traits; she only has it because Jabba is a
                // friendly leader, and the constant ability grants it even while she's in hand
                expect(context.zamWesell).toBeInZone('hand');
                expect(context.zamWesell.hasSomeTrait(Trait.Hutt)).toBeTrue();

                // Zam's own printed Underworld trait qualifies her for Jabba's deployed unit-side
                // action ability, which plays an Underworld unit from hand
                context.player1.clickCard(context.jabbaTheHutt);
                context.player1.clickPrompt('Play an Underworld unit unit from your hand');
                context.player1.clickCard(context.zamWesell);

                // Pay her cost with the Credit token, which conditionally grants Ambush for the phase
                context.player1.clickPrompt('Use 1 Credit');
                expect(context.zamWesell).toBeInZone('groundArena', context.player1);

                // Resolve Ambush and prove it actually works by attacking the same phase, despite
                // Zam having entered play exhausted
                expect(context.player1).toHavePassAbilityPrompt('Ambush');
                context.player1.clickPrompt('Trigger');
                context.player1.clickCard(context.battlefieldMarine);

                // Combat damage was dealt on both sides, proving the attack actually resolved
                expect(context.battlefieldMarine.damage).toBe(2);
                expect(context.zamWesell.damage).toBe(3);
            });
        });
    });
});
