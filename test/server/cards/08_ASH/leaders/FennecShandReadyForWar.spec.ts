describe('Fennec Shand, Ready for War', function () {
    integration(function (contextRef) {
        describe('leader side ability', function () {
            it('exhausts Fennec and a friendly unit to play a unit from hand ready', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'fennec-shand#ready-for-war',
                        groundArena: ['battlefield-marine', { card: 'atst', exhausted: true }],
                        hand: ['wampa'],
                        resources: 5
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.fennecShand);
                context.player1.clickPrompt('Play a unit from your hand. It enters play ready');

                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
                context.player1.clickCard(context.wampa);

                expect(context.fennecShand.exhausted).toBeTrue();
                expect(context.battlefieldMarine.exhausted).toBeTrue();
                expect(context.atst.exhausted).toBeTrue();
                expect(context.wampa).toBeInZone('groundArena');
                expect(context.wampa.exhausted).toBeFalse();
                expect(context.player1.exhaustedResourceCount).toBe(5);
                expect(context.player2).toBeActivePlayer();
            });

            it('does not allow units that cannot be paid for after the action resource cost', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'fennec-shand#ready-for-war',
                        groundArena: ['battlefield-marine'],
                        hand: ['underworld-thug', 'wampa'],
                        resources: 4
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.fennecShand);
                context.player1.clickPrompt('Play a unit from your hand. It enters play ready');
                context.player1.clickCard(context.battlefieldMarine);

                const underworldThug = context.player1.findCardByName('underworld-thug', 'hand');
                expect(context.player1).toBeAbleToSelectExactly([underworldThug]);
                context.player1.clickCard(underworldThug);

                expect(underworldThug).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(3);
            });
        });

        describe('leader unit side ability', function () {
            it('can exhaust Fennec as the friendly unit cost to play a unit from hand ready', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'fennec-shand#ready-for-war', deployed: true },
                        groundArena: ['battlefield-marine'],
                        hand: ['wampa'],
                        resources: 5
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.fennecShand);
                context.player1.clickPrompt('Play a unit from your hand. It enters play ready');

                expect(context.player1).toBeAbleToSelectExactly([context.fennecShand, context.battlefieldMarine]);
                context.player1.clickCard(context.fennecShand);

                expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
                context.player1.clickCard(context.wampa);

                expect(context.fennecShand.exhausted).toBeTrue();
                expect(context.battlefieldMarine.exhausted).toBeFalse();
                expect(context.wampa).toBeInZone('groundArena');
                expect(context.wampa.exhausted).toBeFalse();
                expect(context.player1.exhaustedResourceCount).toBe(5);
                expect(context.player2).toBeActivePlayer();
            });

            it('has Saboteur when deployed', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'fennec-shand#ready-for-war', deployed: true },
                    },
                    player2: {
                        groundArena: ['echo-base-defender']
                    }
                });

                const { context } = contextRef;

                expect(context.fennecShand.hasSomeKeyword('saboteur')).toBeTrue();

                context.player1.clickCard(context.fennecShand);
                context.player1.clickPrompt('Attack');
                expect(context.player1).toBeAbleToSelectExactly([context.p2Base, context.echoBaseDefender]);
                context.player1.clickCard(context.p2Base);

                expect(context.p2Base.damage).toBe(3);
                expect(context.echoBaseDefender).toBeInZone('groundArena');
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Epic Action', function () {
            it('can deploy with 4 resources', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'fennec-shand#ready-for-war',
                        resources: 4
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.fennecShand);
                expect(context.player1).toHaveEnabledPromptButton('Deploy Fennec Shand');
                context.player1.clickPrompt('Deploy Fennec Shand');

                expect(context.fennecShand).toBeInZone('groundArena');
                expect(context.player2).toBeActivePlayer();
            });

            it('cannot deploy with fewer than 4 resources', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'fennec-shand#ready-for-war',
                        groundArena: ['battlefield-marine'],
                        hand: ['underworld-thug'],
                        resources: 3
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.fennecShand);

                expect(context.player1).not.toHaveEnabledPromptButton('Deploy Fennec Shand');
                context.player1.clickPrompt('Cancel');
            });
        });
    });
});
