describe('The Darksaber, Only the Strongest Shall Rule', function() {
    integration(function(contextRef) {
        describe('The Darksaber\'s When played ability', function() {
            it('should ready the attached unit when played if there are four or more keywords among friendly units', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['the-darksaber#only-the-strongest-shall-rule'],
                        base: { card: 'dagobah-swamp', damage: 5 },
                        groundArena: [{ card: 'battlefield-marine', exhausted: true }, 'wampa'],
                        spaceArena: ['strikeship', 'restored-arc170']
                    },
                    player2: {
                        groundArena: ['wilderness-fighter'],
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.theDarksaber);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa, context.wildernessFighter]);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine.exhausted).toBe(false);
                expect(context.battlefieldMarine.hasSomeKeyword('sentinel')).toBe(true);

                context.player2.clickCard(context.wildernessFighter);
                expect(context.player2).toBeAbleToSelectExactly([context.battlefieldMarine]);
                context.player2.clickCard(context.battlefieldMarine);
            });

            it('should not ready the attached unit when played if there are four or more keywords among enemy units', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: { card: 'dagobah-swamp', damage: 5 },
                        groundArena: [{ card: 'battlefield-marine', exhausted: true }, 'wampa'],
                        spaceArena: ['strikeship', 'restored-arc170', 'pirate-snub-fighter']
                    },
                    player2: {
                        hand: ['the-darksaber#only-the-strongest-shall-rule'],
                        groundArena: [{ card: 'wilderness-fighter', exhausted: true }],
                        hasInitiative: true
                    }
                });
                const { context } = contextRef;

                context.player2.clickCard(context.theDarksaber);
                expect(context.player2).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa, context.wildernessFighter]);
                context.player2.clickCard(context.wildernessFighter);

                expect(context.wildernessFighter.exhausted).toBe(true);
                expect(context.wildernessFighter.hasSomeKeyword('sentinel')).toBe(true);

                context.player1.clickCard(context.wampa);
                expect(context.player1).toBeAbleToSelectExactly([context.wildernessFighter]);
                context.player1.clickCard(context.wildernessFighter);
            });

            it('should ready the attached unit when played if there are four or more keywords among friendly units even if the attached unit is an enemy', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['the-darksaber#only-the-strongest-shall-rule'],
                        base: { card: 'dagobah-swamp', damage: 5 },
                        groundArena: [{ card: 'battlefield-marine', exhausted: true }, 'grand-inquisitor#youre-right-to-be-afraid'],
                        spaceArena: ['strikeship', 'restored-arc170']
                    },
                    player2: {
                        groundArena: [{ card: 'wilderness-fighter', exhausted: true }],
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.theDarksaber);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.grandInquisitor, context.wildernessFighter]);
                context.player1.clickCard(context.wildernessFighter);

                expect(context.wildernessFighter.exhausted).toBe(false);
                expect(context.wildernessFighter.hasSomeKeyword('sentinel')).toBe(true);

                context.player2.passAction();

                context.player1.clickCard(context.grandInquisitor);
                expect(context.player1).toBeAbleToSelectExactly([context.wildernessFighter]);
                context.player1.clickCard(context.wildernessFighter);
            });
        });

        describe('The Darksaber\'s When played ability, with another copy already attached to a friendly unit (uniqueness rule),', function() {
            beforeEach(async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['the-darksaber#only-the-strongest-shall-rule'],
                        base: { card: 'dagobah-swamp', damage: 5 },
                        groundArena: [
                            { card: 'battlefield-marine', exhausted: true },
                            { card: 'wampa', upgrades: ['the-darksaber#only-the-strongest-shall-rule'] }
                        ],
                        spaceArena: ['strikeship', 'restored-arc170']
                    },
                    player2: {
                        groundArena: ['wilderness-fighter'],
                    }
                });

                const { context } = contextRef;
                const copies = context.player1.findCardsByName('the-darksaber#only-the-strongest-shall-rule');
                context.copyInHand = copies.find((copy) => copy.zoneName === 'hand');
                context.copyInPlay = copies.find((copy) => copy.zoneName === 'groundArena');
            });

            it('should not ready anything when the copy just played is the one defeated', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.copyInHand);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player1).toHavePrompt('Choose which copy of The Darksaber, Only the Strongest Shall Rule to defeat');
                expect(context.player1).toBeAbleToSelectExactly([context.copyInHand, context.copyInPlay]);
                context.player1.clickCard(context.copyInHand);

                // The attached unit is checked when the ability resolves (rulings of 2025-05-19 and 2025-09-29),
                // and by then the copy just played is attached to nothing
                expect(context.copyInHand).toBeInZone('discard');
                expect(context.copyInPlay).toBeAttachedTo(context.wampa);
                expect(context.battlefieldMarine.exhausted).toBe(true);
                expect(context.player2).toBeActivePlayer();
            });

            it('should ready the unit it was played on when the copy already in play is the one defeated', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.copyInHand);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player1).toHavePrompt('Choose which copy of The Darksaber, Only the Strongest Shall Rule to defeat');
                context.player1.clickCard(context.copyInPlay);

                expect(context.copyInPlay).toBeInZone('discard');
                expect(context.copyInHand).toBeAttachedTo(context.battlefieldMarine);
                expect(context.battlefieldMarine.exhausted).toBe(false);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});