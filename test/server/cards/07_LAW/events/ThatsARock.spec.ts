describe('Thats A Rock', function() {
    integration(function(contextRef) {
        describe('Thats A Rock\'s ability', function() {
            it('can deal damage to a unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['thats-a-rock'],
                        groundArena: ['pyke-sentinel'],
                        spaceArena: ['cartel-spacer']
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['imperial-interceptor']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.thatsARock);
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.cartelSpacer, context.wampa, context.imperialInterceptor]);

                context.player1.clickCard(context.wampa);
                expect(context.wampa.damage).toBe(1);
            });

            it('can deal damage to a unit when discarded from hand', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['thats-a-rock'],
                        groundArena: ['pyke-sentinel'],
                        spaceArena: ['cartel-spacer']
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['imperial-interceptor'],
                        hand: ['spark-of-rebellion']
                    }
                });

                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.sparkOfRebellion);
                context.player2.clickCardInDisplayCardPrompt(context.thatsARock);
                expect(context.thatsARock).toBeInZone('discard');

                expect(context.player1).toHavePrompt('Deal 1 damage to a unit.');
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.cartelSpacer, context.wampa, context.imperialInterceptor]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.wampa);
                expect(context.wampa.damage).toBe(1);
                expect(context.player1).toBeActivePlayer();
            });

            it('when discarded from hand, can interact with other prompts', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'padme-amidala#what-do-you-have-to-hide',
                        hand: ['thats-a-rock'],
                        groundArena: ['furtive-handmaiden']
                    },
                    player2: {
                        groundArena: ['consular-security-force'],
                    }
                });

                const { context } = contextRef;

                // Attack with Furtive Handmaiden to discard a card from hand
                context.player1.clickCard(context.furtiveHandmaiden);
                context.player1.clickCard(context.p2Base);

                // Discard That's a Rock from hand
                expect(context.player1).toHavePassAbilityPrompt('Discard a card from your hand. If you do, draw a card.');
                context.player1.clickPrompt('Trigger');
                context.player1.clickCard(context.thatsARock);

                // Padmé's ability triggered
                expect(context.player1).toHaveExactPromptButtons(['Exhaust Padmé Amidala to deal 1 damage to a unit', 'Deal 1 damage to a unit.']);

                // Choose to use Padmé's ability
                context.player1.clickPrompt('Exhaust Padmé Amidala to deal 1 damage to a unit');
                context.player1.clickPrompt('Trigger');

                // All units are valid targets
                expect(context.player1).toHavePrompt('Deal 1 damage to a unit');
                expect(context.player1).toBeAbleToSelectExactly([
                    context.furtiveHandmaiden,
                    context.consularSecurityForce
                ]);

                context.player1.clickCard(context.consularSecurityForce);

                expect(context.consularSecurityForce.damage).toBe(1);
                expect(context.padmeAmidala.exhausted).toBe(true);

                expect(context.player1).toHavePrompt('Deal 1 damage to a unit.');
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.consularSecurityForce);
                expect(context.consularSecurityForce.damage).toBe(2);
            });

            it('can deal damage to a unit when discarded from deck', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        deck: ['thats-a-rock'],
                        groundArena: ['pyke-sentinel'],
                        spaceArena: ['cartel-spacer']
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['imperial-interceptor'],
                        hand: ['vigilance']
                    }
                });

                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.vigilance);
                context.player2.clickPrompt('Discard 6 cards from an opponent\'s deck.');
                context.player2.clickPrompt('Give a shield token to a unit.');
                context.player2.clickCard(context.imperialInterceptor);

                expect(context.thatsARock).toBeInZone('discard');

                expect(context.player1).toHavePrompt('Deal 1 damage to a unit.');
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.cartelSpacer, context.wampa, context.imperialInterceptor]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.wampa);
                expect(context.wampa.damage).toBe(1);
                expect(context.player1).toBeActivePlayer();
            });

            it('can deal damage to a unit when discarded from deck and returned to hand', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['boshek#charismatic-smuggler'],
                        spaceArena: ['strafing-gunship'],
                        deck: ['battlefield-marine', 'thats-a-rock', 'atst']
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.boshek);
                context.player1.clickPrompt('Play BoShek with Piloting');
                context.player1.clickCard(context.strafingGunship);

                expect(context.thatsARock).toBeInZone('hand');
                expect(context.battlefieldMarine).toBeInZone('discard');

                expect(context.atst).toBeInZone('deck');

                expect(context.player1).toHavePrompt('Deal 1 damage to a unit.');
                expect(context.player1).toBeAbleToSelectExactly([context.strafingGunship]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickPrompt('Pass');

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
