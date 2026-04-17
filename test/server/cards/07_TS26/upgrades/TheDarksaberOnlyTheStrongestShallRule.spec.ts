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
                        spaceArena: ['strikeship', 'restored-arc170']
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
                        groundArena: [{ card: 'battlefield-marine', exhausted: true }, 'wampa'],
                        spaceArena: ['strikeship', 'restored-arc170']
                    },
                    player2: {
                        groundArena: [{ card: 'wilderness-fighter', exhausted: true }],
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.theDarksaber);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa, context.wildernessFighter]);
                context.player1.clickCard(context.wildernessFighter);

                expect(context.wildernessFighter.exhausted).toBe(false);
                expect(context.wildernessFighter.hasSomeKeyword('sentinel')).toBe(true);

                context.player2.passAction();

                context.player1.clickCard(context.wampa);
                expect(context.player1).toBeAbleToSelectExactly([context.wildernessFighter]);
                context.player1.clickCard(context.wildernessFighter);
            });
        });
    });
});