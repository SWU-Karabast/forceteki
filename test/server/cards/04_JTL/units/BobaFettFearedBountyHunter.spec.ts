describe('Boba Fett, Feared Bounty Hunter', function() {
    integration(function(contextRef) {
        describe('Boba Fett\'s piloting ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['boba-fett#feared-bounty-hunter'],
                        groundArena: ['atst'],
                        spaceArena: ['desperado-freighter'],
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['cartel-spacer'],
                    }
                });
            });

            it('should allow to deal 2 damage to a unit when played as a pilot on a Transport unit', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.bobaFett);
                context.player1.clickPrompt('Play Boba Fett with Piloting');
                context.player1.clickCard(context.desperadoFreighter);

                expect(context.player1).toBeAbleToSelectExactly([context.desperadoFreighter, context.atst, context.cartelSpacer, context.battlefieldMarine]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine.damage).toBe(2);
            });

            it('should allow to deal 1 damage to a unit when played as a pilot on a non-Transport unit', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.bobaFett);
                context.player1.clickPrompt('Play Boba Fett with Piloting');
                context.player1.clickCard(context.atst);

                expect(context.player1).toBeAbleToSelectExactly([context.desperadoFreighter, context.atst, context.cartelSpacer, context.battlefieldMarine]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine.damage).toBe(1);
            });

            it('should not deal any damage when played as a unit', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.bobaFett);
                context.player1.clickPrompt('Play Boba Fett');

                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Boba Fett\'s piloting ability, with another copy of Boba already attached (uniqueness rule),', function() {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['boba-fett#feared-bounty-hunter'],
                        spaceArena: [{ card: 'tieln-fighter', upgrades: ['boba-fett#feared-bounty-hunter'] }, 'desperado-freighter'],
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                    }
                });

                const { context } = contextRef;
                const copies = context.player1.findCardsByName('boba-fett#feared-bounty-hunter');
                context.copyInHand = copies.find((copy) => copy.zoneName === 'hand');
                context.copyInPlay = copies.find((copy) => copy.zoneName === 'spaceArena');
            });

            it('should still deal 1 damage (the unconditional part of the text, and 1 because no unit is attached) when the copy just played on a Transport is the one defeated', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.copyInHand);
                context.player1.clickPrompt('Play Boba Fett with Piloting');
                context.player1.clickCard(context.desperadoFreighter);

                expect(context.player1).toBeAbleToSelectExactly([context.copyInHand, context.copyInPlay]);
                context.player1.clickCard(context.copyInHand);
                expect(context.copyInHand).toBeInZone('discard');
                expect(context.copyInPlay).toBeAttachedTo(context.tielnFighter);

                // "You may deal 1 damage to a unit. If attached unit is a Transport, you may deal 2 damage instead.": the first sentence needs no attached unit,
                // the second cannot be satisfied once the copy is attached to nothing (the ruling the Darth Maul's Lightsaber spec records for "If attached unit is ...")
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine.damage).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
