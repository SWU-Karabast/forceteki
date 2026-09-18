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

            it('should gain traits from both a pilot leader deployed as an upgrade and its host Vehicle unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['zam-wesell#not-what-she-seems'],
                        spaceArena: ['alliance-xwing'],
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
            });
        });
    });
});
