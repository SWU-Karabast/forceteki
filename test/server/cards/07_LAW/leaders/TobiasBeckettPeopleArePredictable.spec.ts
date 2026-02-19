describe('Tobias Beckett, People are Predictable', function() {
    integration(function(contextRef) {
        describe('Tobias Beckett\'s undeployed ability', function() {
            it('should exhaust him to choose an friendly unit. Opponent take controls of it and you create a Credit token', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'tobias-beckett#people-are-predictable',
                        groundArena: ['wampa', 'yoda#old-master'],
                        spaceArena: ['awing'],
                        resources: 4
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.tobiasBeckett);

                expect(context.player1).toHavePrompt('Give control of a friendly unit to create a Credit token');
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.yoda, context.awing]);
                context.player1.clickCard(context.yoda);

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.credits).toBe(1);
                expect(context.tobiasBeckett.exhausted).toBeTrue();
                expect(context.yoda).toBeInZone('groundArena', context.player2);
            });

            it('should exhaust him to choose an friendly unit. Opponent cannot take control of it. You do not create a Credit token', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'tobias-beckett#people-are-predictable',
                        groundArena: ['wampa', 'rey#skywalker'],
                        spaceArena: ['awing'],
                        resources: 4
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.tobiasBeckett);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.rey, context.awing]);
                context.player1.clickCard(context.rey);

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.credits).toBe(0);
                expect(context.tobiasBeckett.exhausted).toBeTrue();
                expect(context.rey).toBeInZone('groundArena', context.player1);
            });
        });

        describe('Tobias Beckett\'s deployed ability', function () {
            it('should defeat any number of unit you own but do not control. For each of defeated unit, create Credit token and draw a card', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'tobias-beckett#people-are-predictable',
                        groundArena: ['wampa', 'gungi#finding-himself', 'atst', 'rey#skywalker'],
                        spaceArena: ['awing'],
                        deck: ['superlaser-technician', 'yoda#old-master', 'consular-security-force', 'echo-base-defender']
                    },
                    player2: {
                        hand: ['choose-sides', 'unrefusable-offer'],
                        groundArena: ['battlefield-marine'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.tobiasBeckett);
                context.player1.clickPrompt('Give control of a friendly unit to create a Credit token');
                context.player1.clickCard(context.wampa);

                context.player2.clickCard(context.chooseSides);
                context.player2.clickCard(context.battlefieldMarine);
                context.player2.clickCard(context.atst);

                context.player1.passAction();

                context.player2.clickCard(context.unrefusableOffer);
                context.player2.clickCard(context.gungi);

                context.player1.passAction();

                context.player2.clickCard(context.atst);
                context.player2.clickCard(context.gungi);
                context.player2.clickPrompt('Trigger');

                expect(context.wampa).toBeInZone('groundArena', context.player2);
                expect(context.gungi).toBeInZone('groundArena', context.player2);
                expect(context.atst).toBeInZone('groundArena', context.player2);
                expect(context.battlefieldMarine).toBeInZone('groundArena', context.player1);

                context.player1.clickCard(context.tobiasBeckett);
                context.player1.clickPrompt('Deploy Tobias Beckett');

                expect(context.player1).toHavePrompt('Defeat any number of units you own but don\'t control. For each unit defeated this way, create a Credit token and draw a card.');
                // cannot select rey & awing (own & control) or battlefield marine (control but do not own)
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.gungi, context.atst]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.wampa);
                expect(context.player1).toHaveEnabledPromptButton('Done');
                context.player1.clickCard(context.gungi);
                expect(context.player1).toHaveEnabledPromptButton('Done');
                context.player1.clickCard(context.atst);
                context.player1.clickPrompt('Done');

                expect(context.player2).toBeActivePlayer();

                expect(context.player1.credits).toBe(4); // 1 was generated at beginning

                expect(context.wampa).toBeInZone('discard', context.player1);
                expect(context.gungi).toBeInZone('discard', context.player1);
                expect(context.atst).toBeInZone('discard', context.player1);

                expect(context.superlaserTechnician).toBeInZone('hand', context.player1);
                expect(context.yoda).toBeInZone('hand', context.player1);
                expect(context.consularSecurityForce).toBeInZone('hand', context.player1);
            });

            it('should defeat any number of unit you own but do not control. For each of defeated unit, create Credit token and draw a card (can choose less than maximum units)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'tobias-beckett#people-are-predictable',
                        groundArena: ['wampa', 'gungi#finding-himself', 'atst', 'rey#skywalker'],
                        spaceArena: ['awing'],
                        deck: ['superlaser-technician', 'yoda#old-master', 'consular-security-force', 'echo-base-defender']
                    },
                    player2: {
                        hand: ['choose-sides', 'unrefusable-offer'],
                        groundArena: ['battlefield-marine'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.tobiasBeckett);
                context.player1.clickPrompt('Give control of a friendly unit to create a Credit token');
                context.player1.clickCard(context.wampa);

                context.player2.clickCard(context.chooseSides);
                context.player2.clickCard(context.battlefieldMarine);
                context.player2.clickCard(context.atst);

                context.player1.passAction();

                context.player2.clickCard(context.unrefusableOffer);
                context.player2.clickCard(context.gungi);

                context.player1.passAction();

                context.player2.clickCard(context.atst);
                context.player2.clickCard(context.gungi);
                context.player2.clickPrompt('Trigger');

                expect(context.wampa).toBeInZone('groundArena', context.player2);
                expect(context.gungi).toBeInZone('groundArena', context.player2);
                expect(context.atst).toBeInZone('groundArena', context.player2);
                expect(context.battlefieldMarine).toBeInZone('groundArena', context.player1);

                context.player1.clickCard(context.tobiasBeckett);
                context.player1.clickPrompt('Deploy Tobias Beckett');

                expect(context.player1).toHavePrompt('Defeat any number of units you own but don\'t control. For each unit defeated this way, create a Credit token and draw a card.');
                // cannot select rey & awing (own & control) or battlefield marine (control but do not own)
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.gungi, context.atst]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.gungi);
                context.player1.clickPrompt('Done');

                expect(context.player2).toBeActivePlayer();

                expect(context.player1.credits).toBe(3); // 1 was generated at beginning

                expect(context.wampa).toBeInZone('discard', context.player1);
                expect(context.gungi).toBeInZone('discard', context.player1);
                expect(context.atst).toBeInZone('groundArena', context.player2);

                expect(context.superlaserTechnician).toBeInZone('hand', context.player1);
                expect(context.yoda).toBeInZone('hand', context.player1);
                expect(context.consularSecurityForce).toBeInZone('deck', context.player1);
            });

            it('should defeat any number of unit you own but do not control. For each of defeated unit, create Credit token and draw a card (if deck is empty, there is 3 damage per card)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'tobias-beckett#people-are-predictable',
                        groundArena: ['wampa', 'gungi#finding-himself', 'atst', 'rey#skywalker'],
                        spaceArena: ['awing'],
                        deck: []
                    },
                    player2: {
                        hand: ['choose-sides', 'unrefusable-offer'],
                        groundArena: ['battlefield-marine'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.tobiasBeckett);
                context.player1.clickPrompt('Give control of a friendly unit to create a Credit token');
                context.player1.clickCard(context.wampa);

                context.player2.clickCard(context.chooseSides);
                context.player2.clickCard(context.battlefieldMarine);
                context.player2.clickCard(context.atst);

                context.player1.passAction();

                context.player2.clickCard(context.unrefusableOffer);
                context.player2.clickCard(context.gungi);

                context.player1.passAction();

                context.player2.clickCard(context.atst);
                context.player2.clickCard(context.gungi);
                context.player2.clickPrompt('Trigger');

                expect(context.wampa).toBeInZone('groundArena', context.player2);
                expect(context.gungi).toBeInZone('groundArena', context.player2);
                expect(context.atst).toBeInZone('groundArena', context.player2);
                expect(context.battlefieldMarine).toBeInZone('groundArena', context.player1);

                context.player1.clickCard(context.tobiasBeckett);
                context.player1.clickPrompt('Deploy Tobias Beckett');

                expect(context.player1).toHavePrompt('Defeat any number of units you own but don\'t control. For each unit defeated this way, create a Credit token and draw a card.');
                // cannot select rey & awing (own & control) or battlefield marine (control but do not own)
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.gungi, context.atst]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.wampa);
                expect(context.player1).toHaveEnabledPromptButton('Done');
                context.player1.clickCard(context.gungi);
                expect(context.player1).toHaveEnabledPromptButton('Done');
                context.player1.clickCard(context.atst);
                context.player1.clickPrompt('Done');

                expect(context.player2).toBeActivePlayer();

                expect(context.player1.credits).toBe(4); // 1 was generated at beginning

                expect(context.wampa).toBeInZone('discard', context.player1);
                expect(context.gungi).toBeInZone('discard', context.player1);
                expect(context.atst).toBeInZone('discard', context.player1);

                expect(context.p1Base.damage).toBe(10); // atst did 1 damage from overwhelm
            });

            it('should defeat any number of unit you own but do not control. For each of defeated unit, create Credit token and draw a card (undefeatable unit)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'tobias-beckett#people-are-predictable',
                        spaceArena: ['lurking-tie-phantom'],
                        deck: ['superlaser-technician', 'yoda#old-master', 'consular-security-force', 'echo-base-defender']
                    },
                    player2: {
                        hand: ['choose-sides'],
                        groundArena: ['battlefield-marine'],
                        hasInitiative: true,
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.chooseSides);
                context.player2.clickCard(context.battlefieldMarine);
                context.player2.clickCard(context.lurkingTiePhantom);

                context.player1.clickCard(context.tobiasBeckett);
                context.player1.clickPrompt('Deploy Tobias Beckett');

                expect(context.player1).toHavePrompt('Defeat any number of units you own but don\'t control. For each unit defeated this way, create a Credit token and draw a card.');
                // cannot select rey & awing (own & control) or battlefield marine (control but do not own)
                expect(context.player1).toBeAbleToSelectExactly([context.lurkingTiePhantom]);
                context.player1.clickCard(context.lurkingTiePhantom);
                context.player1.clickPrompt('Done');

                expect(context.player2).toBeActivePlayer();

                expect(context.player1.credits).toBe(0);

                expect(context.lurkingTiePhantom).toBeInZone('spaceArena', context.player2);

                expect(context.superlaserTechnician).toBeInZone('deck', context.player1);
                expect(context.yoda).toBeInZone('deck', context.player1);
                expect(context.consularSecurityForce).toBeInZone('deck', context.player1);
            });

            it('should defeat any number of unit you own but do not control. For each of defeated unit, create Credit token and draw a card (no unit you own but do not control)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'tobias-beckett#people-are-predictable',
                        spaceArena: ['lurking-tie-phantom'],
                        deck: ['superlaser-technician', 'yoda#old-master', 'consular-security-force', 'echo-base-defender']
                    },
                    player2: {
                        hand: ['choose-sides'],
                        groundArena: ['battlefield-marine'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.tobiasBeckett);
                context.player1.clickPrompt('Deploy Tobias Beckett');

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.credits).toBe(0);
                expect(context.superlaserTechnician).toBeInZone('deck', context.player1);
                expect(context.yoda).toBeInZone('deck', context.player1);
                expect(context.consularSecurityForce).toBeInZone('deck', context.player1);
            });

            it('should defeat any number of unit you own but do not control. For each of defeated unit, create Credit token and draw a card (not unit at all)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'tobias-beckett#people-are-predictable',
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.tobiasBeckett);
                context.player1.clickPrompt('Deploy Tobias Beckett');

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.credits).toBe(0);
            });

            it('should defeat any number of unit you own but do not control. For each of defeated unit, create Credit token and draw a card (no friendly unit)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'tobias-beckett#people-are-predictable',
                    },
                    player2: {
                        groundArena: ['wampa'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.tobiasBeckett);
                context.player1.clickPrompt('Deploy Tobias Beckett');

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.credits).toBe(0);
            });
        });
    });
});