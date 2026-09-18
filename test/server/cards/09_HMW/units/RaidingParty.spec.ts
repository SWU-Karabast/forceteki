describe('Raiding Party', function () {
    integration(function (contextRef) {
        describe('Raiding Party\'s when played ability', function () {
            it('should exhaust an enemy unit when you control a Tatooine base', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['raiding-party'],
                        base: 'dune-sea'
                    },
                    player2: {
                        groundArena: ['atst'],
                        spaceArena: ['awing']
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.raidingParty);

                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.raidingParty]);
                expect(context.player1).toBeAbleToSelect(context.atst);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.atst);

                expect(context.atst.exhausted).toBeTrue();
                expect(context.player2).toBeActivePlayer();
            });

            it('should exhaust an enemy unit when you control a Tusken unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['raiding-party'],
                        groundArena: ['tusken-tracker'],
                        base: 'colossus'
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['awing']
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.raidingParty);

                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.tuskenTracker, context.raidingParty]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.wampa);

                expect(context.player2).toBeActivePlayer();
                expect(context.wampa.exhausted).toBeTrue();
            });

            it('should not exhaust the target with no Tatooine base or other Tusken units', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['raiding-party'],
                        base: 'energy-conversion-lab'
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.raidingParty);

                expect(context.player2).toBeActivePlayer();
                expect(context.wampa.exhausted).toBeFalse();
            });
        });
    });
});
