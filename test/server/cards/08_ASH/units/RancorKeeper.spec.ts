describe('Rancor Keeper', function() {
    integration(function(contextRef) {
        it('deals 1 damage to any number of bases when a friendly unit is dealt damage and survives', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['daring-raid'],
                    groundArena: ['rancor-keeper', 'wampa']
                },
                player2: {
                    groundArena: ['battlefield-marine']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.daringRaid);
            context.player1.clickCard(context.wampa);

            expect(context.player1).toHavePrompt('Choose bases to deal 1 damage to');
            expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);

            context.player1.clickCard(context.p1Base);
            context.player1.clickCard(context.p2Base);
            context.player1.clickPrompt('Done');

            expect(context.wampa.damage).toBe(2);
            expect(context.p1Base.damage).toBe(1);
            expect(context.p2Base.damage).toBe(1);
            expect(context.player2).toBeActivePlayer();
        });

        it('can choose no bases', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['daring-raid'],
                    groundArena: ['rancor-keeper', 'wampa']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.daringRaid);
            context.player1.clickCard(context.wampa);
            context.player1.clickPrompt('Choose nothing');

            expect(context.wampa.damage).toBe(2);
            expect(context.p1Base.damage).toBe(0);
            expect(context.p2Base.damage).toBe(0);
            expect(context.player2).toBeActivePlayer();
        });

        it('can trigger when Rancor Keeper is dealt damage and survives', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['daring-raid'],
                    groundArena: ['rancor-keeper']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.daringRaid);
            context.player1.clickCard(context.rancorKeeper);

            expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
            context.player1.clickCard(context.p2Base);
            context.player1.clickPrompt('Done');

            expect(context.rancorKeeper.damage).toBe(2);
            expect(context.p2Base.damage).toBe(1);
        });

        it('does not trigger if the damaged friendly unit is defeated', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['open-fire'],
                    groundArena: ['rancor-keeper', 'battlefield-marine']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.openFire);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.battlefieldMarine).toBeInZone('discard', context.player1);
            expect(context.p1Base.damage).toBe(0);
            expect(context.p2Base.damage).toBe(0);
            expect(context.player2).toBeActivePlayer();
        });

        it('does not trigger when an enemy unit is dealt damage', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['daring-raid'],
                    groundArena: ['rancor-keeper']
                },
                player2: {
                    groundArena: ['wampa']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.daringRaid);
            context.player1.clickCard(context.wampa);

            expect(context.wampa.damage).toBe(2);
            expect(context.p1Base.damage).toBe(0);
            expect(context.p2Base.damage).toBe(0);
            expect(context.player2).toBeActivePlayer();
        });

        it('uses the ability only once each round', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['daring-raid', 'daring-raid', 'daring-raid'],
                    groundArena: ['rancor-keeper', 'wampa', 'atst']
                }
            });
            const { context } = contextRef;
            const daringRaids = context.player1.findCardsByName('daring-raid', 'hand');

            context.player1.clickCard(daringRaids[0]);
            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.p2Base);
            context.player1.clickPrompt('Done');

            expect(context.p2Base.damage).toBe(1);
            expect(context.player2).toBeActivePlayer();

            context.player2.passAction();
            context.player1.clickCard(daringRaids[1]);
            context.player1.clickCard(context.atst);

            expect(context.atst.damage).toBe(2);
            expect(context.p2Base.damage).toBe(1);
            expect(context.player2).toBeActivePlayer();

            context.moveToNextActionPhase();

            context.player1.clickCard(daringRaids[2]);
            context.player1.clickCard(context.atst);

            expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
            context.player1.clickCard(context.p2Base);
            context.player1.clickPrompt('Done');

            expect(context.atst.damage).toBe(4);
            expect(context.p2Base.damage).toBe(2);
            expect(context.player2).toBeActivePlayer();
        });
    });
});
