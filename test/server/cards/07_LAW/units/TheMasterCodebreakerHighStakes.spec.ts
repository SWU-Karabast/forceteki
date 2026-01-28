describe('The Master Codebreaker, High Stakes', function () {
    integration(function (contextRef) {
        describe('The Master Codebreaker\'s When Played ability', function () {
            it('should search the top 8 cards of the deck and allow selecting and drawing a Gambit card', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['the-master-codebreaker#high-stakes'],
                        deck: [
                            'battlefield-marine',
                            'wampa',
                            'second-chance',
                            'protector',
                            'inferno-four#unforgetting',
                            'devotion',
                            'consular-security-force',
                            'final-showdown',
                            'superlaser-technician'
                        ]
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.theMasterCodebreaker);

                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.secondChance, context.finalShowdown],
                    invalid: [context.battlefieldMarine, context.wampa, context.protector, context.infernoFour, context.devotion, context.consularSecurityForce]
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                context.player1.clickCardInDisplayCardPrompt(context.secondChance);

                expect(context.secondChance).toBeInZone('hand');

                expect([context.battlefieldMarine, context.wampa, context.protector, context.infernoFour, context.devotion, context.consularSecurityForce, context.finalShowdown]).toAllBeInBottomOfDeck(context.player1, 7);

                expect(context.player2).toBeActivePlayer();
            });

            it('should allow taking nothing if no Gambit cards are in the top 8', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['the-master-codebreaker#high-stakes'],
                        deck: [
                            'battlefield-marine',
                            'wampa',
                            'sabine-wren#explosives-artist',
                            'protector',
                            'inferno-four#unforgetting',
                            'devotion',
                            'consular-security-force',
                            'echo-base-defender'
                        ]
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.theMasterCodebreaker);

                expect(context.player1).toHaveExactDisplayPromptCards({
                    invalid: [context.battlefieldMarine, context.wampa, context.sabineWren, context.protector, context.infernoFour, context.devotion, context.consularSecurityForce, context.echoBaseDefender]
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');
                context.player1.clickPrompt('Take nothing');

                expect(context.theMasterCodebreaker).toBeInZone('groundArena');
                expect(context.player2).toBeActivePlayer();
            });

            it('should do nothing when the deck is empty', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['the-master-codebreaker#high-stakes'],
                        deck: []
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.theMasterCodebreaker);
                expect(context.player2).toBeActivePlayer();
            });

            it('should work correctly when the deck has fewer than 8 cards', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['the-master-codebreaker#high-stakes'],
                        deck: ['final-showdown', 'wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.theMasterCodebreaker);

                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.finalShowdown],
                    invalid: [context.wampa]
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                context.player1.clickCardInDisplayCardPrompt(context.finalShowdown);

                expect(context.player2).toBeActivePlayer();
                expect(context.finalShowdown).toBeInZone('hand');
            });
        });

        describe('The Master Codebreaker\'s constant ability', function () {
            it('should reduce the cost of the first Gambit card you play by 1', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['the-master-codebreaker#high-stakes'],
                        hand: ['second-chance', 'youre-all-clear-kid'],
                        leader: 'chewbacca#walking-carpet',
                        base: 'colossus'
                    },
                    player2: {
                        hand: ['diversion'],
                        spaceArena: ['green-squadron-awing', 'awing'],
                        hasInitiative: true,
                        base: 'jabbas-palace'
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.diversion);
                context.player2.clickCard(context.awing);

                expect(context.player2.exhaustedResourceCount).toBe(1);

                context.player1.clickCard(context.secondChance);
                context.player1.clickCard(context.theMasterCodebreaker);

                expect(context.player1.exhaustedResourceCount).toBe(3);

                context.player2.passAction();

                context.player1.clickCard(context.youreAllClearKid);
                context.player1.clickCard(context.awing);

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(5); // 3 + 2
            });

            it('should reset the cost reduction each phase', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['the-master-codebreaker#high-stakes'],
                        hand: ['second-chance', 'youre-all-clear-kid'],
                        leader: 'chewbacca#walking-carpet',
                        base: 'colossus'
                    },
                    player2: {
                        spaceArena: ['green-squadron-awing', 'awing'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.secondChance);
                context.player1.clickCard(context.theMasterCodebreaker);

                expect(context.player1.exhaustedResourceCount).toBe(3);

                context.moveToNextActionPhase();

                context.player1.clickCard(context.youreAllClearKid);
                context.player1.clickCard(context.awing);

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(1);
            });

            it('should reduce the cost of the first Gambit card you play by 1 (event)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['the-master-codebreaker#high-stakes'],
                        hand: ['second-chance', 'youre-all-clear-kid'],
                        leader: 'chewbacca#walking-carpet',
                        base: 'colossus'
                    },
                    player2: {
                        spaceArena: ['green-squadron-awing', 'awing'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.youreAllClearKid);
                context.player1.clickCard(context.awing);

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(1);
            });

            it('should not reduce the cost of non-Gambit cards', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['the-master-codebreaker#high-stakes'],
                        hand: ['battlefield-marine'],
                        leader: 'captain-rex#fighting-for-his-brothers'
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player1.exhaustedResourceCount).toBe(2);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
