describe('Asajj Ventress, Bald and Beautiful', function () {
    integration(function (contextRef) {
        describe('Asajj\'s undeployed ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'asajj-ventress#bald-and-beautiful',
                        groundArena: ['sandtrooper-squad'],
                        resources: {
                            readyCount: 9,
                            exhaustedCount: 1
                        }
                    },
                    player2: {
                        groundArena: ['battlefield-marine', 'reinforcement-walker'],
                        resources: {
                            readyCount: 9,
                            exhaustedCount: 1
                        }
                    }
                });
            });

            it('should attack with a friendly unit (attacker survives) and ready a friendly exhausted resource', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.asajjVentress);
                context.player1.clickPrompt('Attack with a unit. After completing this attack, if the attacker survived, you may ready a resource.');
                expect(context.player1).not.toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([context.sandtrooperSquad]);
                context.player1.clickCard(context.sandtrooperSquad);

                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.reinforcementWalker, context.p2Base]);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.sandtrooperSquad.exhausted).toBe(true);
                expect(context.sandtrooperSquad.damage).toBe(3);
                expect(context.player2.discard).toContain(context.battlefieldMarine);

                // ready a resource
                expect(context.player1).toHavePrompt('Choose a player to ready a resource');
                expect(context.player1).toHaveExactPromptButtons(['You', 'Opponent', 'Pass']);
                context.player1.clickPrompt('You');

                expect(context.player1.exhaustedResourceCount).toBe(0);
                expect(context.player2.exhaustedResourceCount).toBe(1);
                expect(context.player2).toBeActivePlayer();
                expect(context.asajjVentress.exhausted).toBeTrue();
            });

            it('should attack with a friendly unit (attacker survives) and ready an exhausted enemy resource', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.asajjVentress);
                context.player1.clickPrompt('Attack with a unit. After completing this attack, if the attacker survived, you may ready a resource.');
                expect(context.player1).not.toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([context.sandtrooperSquad]);
                context.player1.clickCard(context.sandtrooperSquad);

                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.reinforcementWalker, context.p2Base]);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.sandtrooperSquad.exhausted).toBe(true);
                expect(context.sandtrooperSquad.damage).toBe(3);
                expect(context.player2.discard).toContain(context.battlefieldMarine);

                // ready a resource
                expect(context.player1).toHavePrompt('Choose a player to ready a resource');
                expect(context.player1).toHaveExactPromptButtons(['You', 'Opponent', 'Pass']);
                context.player1.clickPrompt('Opponent');

                expect(context.player1.exhaustedResourceCount).toBe(1);
                expect(context.player2.exhaustedResourceCount).toBe(0);
                expect(context.player2).toBeActivePlayer();
                expect(context.asajjVentress.exhausted).toBeTrue();
            });

            it('should attack with a friendly unit (attacker survives) and pass on readying an exhausted resource', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.asajjVentress);
                context.player1.clickPrompt('Attack with a unit. After completing this attack, if the attacker survived, you may ready a resource.');
                expect(context.player1).not.toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([context.sandtrooperSquad]);
                context.player1.clickCard(context.sandtrooperSquad);

                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.reinforcementWalker, context.p2Base]);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.sandtrooperSquad.exhausted).toBe(true);
                expect(context.sandtrooperSquad.damage).toBe(3);
                expect(context.player2.discard).toContain(context.battlefieldMarine);

                // ready a resource
                expect(context.player1).toHavePrompt('Choose a player to ready a resource');
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickPrompt('Pass');

                expect(context.player1.exhaustedResourceCount).toBe(1);
                expect(context.player2).toBeActivePlayer();
                expect(context.asajjVentress.exhausted).toBeTrue();
            });

            it('should attack with a friendly unit (attacker dies) so no exhausted resource is readied', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.asajjVentress);
                context.player1.clickPrompt('Attack with a unit. After completing this attack, if the attacker survived, you may ready a resource.');
                expect(context.player1).not.toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([context.sandtrooperSquad]);
                context.player1.clickCard(context.sandtrooperSquad);

                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.reinforcementWalker, context.p2Base]);
                context.player1.clickCard(context.reinforcementWalker);
                expect(context.player1.discard).toContain(context.sandtrooperSquad);
                expect(context.reinforcementWalker.damage).toBe(4);

                // not possible to ready a resource due to attacker getting defeated

                expect(context.player1.exhaustedResourceCount).toBe(1);
                expect(context.player2.exhaustedResourceCount).toBe(1);
                expect(context.player2).toBeActivePlayer();
                expect(context.asajjVentress.exhausted).toBeTrue();
            });
        });

        describe('Asajj\'s undeployed ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'asajj-ventress#bald-and-beautiful',
                        resources: {
                            readyCount: 9,
                            exhaustedCount: 1
                        }
                    }
                });
            });

            it('can be activated with no target', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.asajjVentress);
                context.player1.clickPrompt('(No effect) Attack with a unit. After completing this attack, if the attacker survived, you may ready a resource.');
                context.player1.clickPrompt('Use it anyway');
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Asajj\'s deployed ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'asajj-ventress#bald-and-beautiful', deployed: true },
                        resources: {
                            readyCount: 9,
                            exhaustedCount: 1
                        }
                    },
                    player2: {
                        groundArena: ['imperial-armored-commando'],
                        resources: {
                            readyCount: 9,
                            exhaustedCount: 1
                        }
                    },
                });
            });

            it('should allow attacking base and ready a friendly exhausted resource', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.asajjVentress);
                expect(context.player1).toBeAbleToSelectExactly([context.imperialArmoredCommando, context.p2Base]);
                context.player1.clickCard(context.p2Base);

                // ready a resource
                expect(context.player1).toHavePrompt('Choose a player to target for ability \'Ready a resource\'');
                expect(context.player1).toHaveExactPromptButtons(['You', 'Opponent', 'Pass']);
                context.player1.clickPrompt('You');

                expect(context.player1.exhaustedResourceCount).toBe(0);
                expect(context.player2.exhaustedResourceCount).toBe(1);
                expect(context.p2Base.damage).toBe(5);
                expect(context.player2).toBeActivePlayer();
                expect(context.asajjVentress.exhausted).toBeTrue();
            });

            it('should allow attacking a unit and ready an exhausted enemy resource', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.asajjVentress);
                expect(context.player1).toBeAbleToSelectExactly([context.imperialArmoredCommando, context.p2Base]);
                context.player1.clickCard(context.imperialArmoredCommando);

                // ready a resource
                context.player1.clickPrompt('Saboteur: defeat all shields');
                expect(context.player1).toHavePrompt('Choose a player to target for ability \'Ready a resource\'');
                expect(context.player1).toHaveExactPromptButtons(['You', 'Opponent', 'Pass']);
                context.player1.clickPrompt('Opponent');

                expect(context.player1.exhaustedResourceCount).toBe(1);
                expect(context.player2.exhaustedResourceCount).toBe(0);
                expect(context.player2.discard).toContain(context.imperialArmoredCommando);
                expect(context.player2).toBeActivePlayer();
                expect(context.asajjVentress.exhausted).toBeTrue();
            });

            it('should allow attacking base and pass on readying a friendly exhausted resource', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.asajjVentress);
                expect(context.player1).toBeAbleToSelectExactly([context.imperialArmoredCommando, context.p2Base]);
                context.player1.clickCard(context.p2Base);

                // ready a resource
                expect(context.player1).toHavePrompt('Choose a player to target for ability \'Ready a resource\'');
                expect(context.player1).toHaveExactPromptButtons(['You', 'Opponent', 'Pass']);
                context.player1.clickPrompt('Pass');

                expect(context.player1.exhaustedResourceCount).toBe(1);
                expect(context.player2.exhaustedResourceCount).toBe(1);
                expect(context.p2Base.damage).toBe(5);
                expect(context.player2).toBeActivePlayer();
                expect(context.asajjVentress.exhausted).toBeTrue();
            });
        });
    });
});
