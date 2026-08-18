describe('C-3PO, Captivating Storyteller', function () {
    integration(function (contextRef) {
        describe('C-3PO\'s when played ability', function () {
            it('should give an Ewok unit +2/+2 and a Rebel unit +2/+2 for this phase', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['c3po#captivating-storyteller'],
                        groundArena: ['bossk#join-our-merry-band', 'battlefield-marine'],
                        spaceArena: ['green-squadron-awing'],
                    },
                    player2: {
                        groundArena: ['ewok-warrior', 'atst'],
                        spaceArena: ['cartel-spacer'],
                        leader: { card: 'luke-skywalker#faithful-friend', deployed: true },
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.c3po);
                expect(context.player1).toHavePrompt('Give an Ewok unit +2/+2 for this phase');
                expect(context.player1).toHaveChooseNothingButton();
                expect(context.player1).toBeAbleToSelectExactly([context.ewokWarrior]);

                // Give +2/+2 to Ewok Warrior
                context.player1.clickCard(context.ewokWarrior);

                expect(context.player1).toHavePrompt('Give a Rebel unit +2/+2 for this phase');
                expect(context.player1).toHaveChooseNothingButton();
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.greenSquadronAwing, context.lukeSkywalker, context.c3po]);

                // Give +2/+2 to Battlefield Marine
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.ewokWarrior.getPower()).toBe(5);
                expect(context.ewokWarrior.getHp()).toBe(4);
                expect(context.battlefieldMarine.getPower()).toBe(5);
                expect(context.battlefieldMarine.getHp()).toBe(5);

                // Ensure that the effect is only for this phase
                context.moveToRegroupPhase();

                expect(context.ewokWarrior.getPower()).toBe(3);
                expect(context.ewokWarrior.getHp()).toBe(2);

                expect(context.battlefieldMarine.getPower()).toBe(3);
                expect(context.battlefieldMarine.getHp()).toBe(3);
            });

            it('should pass only the Ewok part of the ability', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['c3po#captivating-storyteller'],
                        groundArena: ['bossk#join-our-merry-band', 'battlefield-marine'],
                        spaceArena: ['green-squadron-awing'],
                    },
                    player2: {
                        groundArena: ['ewok-warrior', 'atst'],
                        spaceArena: ['cartel-spacer'],
                        leader: { card: 'luke-skywalker#faithful-friend', deployed: true },
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.c3po);
                expect(context.player1).toHavePrompt('Give an Ewok unit +2/+2 for this phase');
                expect(context.player1).toHaveChooseNothingButton();
                expect(context.player1).toBeAbleToSelectExactly([context.ewokWarrior]);

                context.player1.clickPrompt('Choose Nothing');

                expect(context.player1).toHavePrompt('Give a Rebel unit +2/+2 for this phase');
                expect(context.player1).toHaveChooseNothingButton();
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.greenSquadronAwing, context.lukeSkywalker, context.c3po]);

                // Give +2/+2 to Battlefield Marine
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.ewokWarrior.getPower()).toBe(3);
                expect(context.ewokWarrior.getHp()).toBe(2);
                expect(context.battlefieldMarine.getPower()).toBe(5);
                expect(context.battlefieldMarine.getHp()).toBe(5);

                // Ensure that the effect is only for this phase
                context.moveToRegroupPhase();

                expect(context.ewokWarrior.getPower()).toBe(3);
                expect(context.ewokWarrior.getHp()).toBe(2);

                expect(context.battlefieldMarine.getPower()).toBe(3);
                expect(context.battlefieldMarine.getHp()).toBe(3);
            });

            it('should pass only the Rebel part of the ability', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['c3po#captivating-storyteller'],
                        groundArena: ['bossk#join-our-merry-band', 'battlefield-marine'],
                        spaceArena: ['green-squadron-awing'],
                    },
                    player2: {
                        groundArena: ['ewok-warrior', 'atst'],
                        spaceArena: ['cartel-spacer'],
                        leader: { card: 'luke-skywalker#faithful-friend', deployed: true },
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.c3po);
                expect(context.player1).toHavePrompt('Give an Ewok unit +2/+2 for this phase');
                expect(context.player1).toHaveChooseNothingButton();
                expect(context.player1).toBeAbleToSelectExactly([context.ewokWarrior]);

                context.player1.clickCard(context.ewokWarrior);

                expect(context.player1).toHavePrompt('Give a Rebel unit +2/+2 for this phase');
                expect(context.player1).toHaveChooseNothingButton();
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.greenSquadronAwing, context.lukeSkywalker, context.c3po]);

                context.player1.clickPrompt('Choose Nothing');

                expect(context.ewokWarrior.getPower()).toBe(5);
                expect(context.ewokWarrior.getHp()).toBe(4);
                expect(context.battlefieldMarine.getPower()).toBe(3);
                expect(context.battlefieldMarine.getHp()).toBe(3);

                // Ensure that the effect is only for this phase
                context.moveToRegroupPhase();

                expect(context.ewokWarrior.getPower()).toBe(3);
                expect(context.ewokWarrior.getHp()).toBe(2);

                expect(context.battlefieldMarine.getPower()).toBe(3);
                expect(context.battlefieldMarine.getHp()).toBe(3);
            });

            it('should pass both parts of the ability', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['c3po#captivating-storyteller'],
                        groundArena: ['bossk#join-our-merry-band', 'battlefield-marine'],
                        spaceArena: ['green-squadron-awing'],
                    },
                    player2: {
                        groundArena: ['ewok-warrior', 'atst'],
                        spaceArena: ['cartel-spacer'],
                        leader: { card: 'luke-skywalker#faithful-friend', deployed: true },
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.c3po);
                expect(context.player1).toHavePrompt('Give an Ewok unit +2/+2 for this phase');
                expect(context.player1).toHaveChooseNothingButton();
                expect(context.player1).toBeAbleToSelectExactly([context.ewokWarrior]);

                context.player1.clickPrompt('Choose Nothing');

                expect(context.player1).toHavePrompt('Give a Rebel unit +2/+2 for this phase');
                expect(context.player1).toHaveChooseNothingButton();
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.greenSquadronAwing, context.lukeSkywalker, context.c3po]);

                context.player1.clickPrompt('Choose Nothing');

                expect(context.ewokWarrior.getPower()).toBe(3);
                expect(context.ewokWarrior.getHp()).toBe(2);
                expect(context.battlefieldMarine.getPower()).toBe(3);
                expect(context.battlefieldMarine.getHp()).toBe(3);

                // Ensure that the effect is only for this phase
                context.moveToRegroupPhase();

                expect(context.ewokWarrior.getPower()).toBe(3);
                expect(context.ewokWarrior.getHp()).toBe(2);

                expect(context.battlefieldMarine.getPower()).toBe(3);
                expect(context.battlefieldMarine.getHp()).toBe(3);
            });

            it('should work if there are no Ewoks', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['c3po#captivating-storyteller'],
                        groundArena: ['bossk#join-our-merry-band', 'battlefield-marine'],
                        spaceArena: ['green-squadron-awing'],
                    },
                    player2: {
                        groundArena: ['atst'],
                        spaceArena: ['cartel-spacer'],
                        leader: { card: 'luke-skywalker#faithful-friend', deployed: true },
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.c3po);

                expect(context.player1).toHavePrompt('Give a Rebel unit +2/+2 for this phase');
                expect(context.player1).toHaveChooseNothingButton();
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.greenSquadronAwing, context.lukeSkywalker, context.c3po]);

                // Give +2/+2 to Battlefield Marine
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine.getPower()).toBe(5);
                expect(context.battlefieldMarine.getHp()).toBe(5);

                expect(context.player2).toBeActivePlayer();

                // Ensure that the effect is only for this phase
                context.moveToRegroupPhase();

                expect(context.battlefieldMarine.getPower()).toBe(3);
                expect(context.battlefieldMarine.getHp()).toBe(3);
            });
        });
    });
});