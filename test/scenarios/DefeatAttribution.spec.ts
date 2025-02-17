describe('Defeat attribution', function () {
    integration(function (contextRef) {
        describe('When a unit has not been defeated by a player,', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'battlefield-marine', exhausted: true }],
                        hand: ['bravado'],
                    },
                    player2: {
                        groundArena: ['rebel-pathfinder']
                    }
                });
            });

            it('"If you\'ve defeated an enemy unit this phase" effects will not trigger', function () {
                const { context } = contextRef;

                expect(context.battlefieldMarine.exhausted).toBe(true);

                context.player1.clickCard(context.bravado);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player1.exhaustedResourceCount).toBe(5);
                expect(context.battlefieldMarine.exhausted).toBe(false);
            });
        });

        describe('When a unit has been defeated by a player through attacking,', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['battlefield-marine'],
                        hand: ['bravado'],
                    },
                    player2: {
                        groundArena: ['rebel-pathfinder']
                    }
                });
            });

            it('"If you\'ve defeated an enemy unit this phase" effects will trigger', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.rebelPathfinder);

                context.player2.passAction();

                context.player1.clickCard(context.bravado);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player1.exhaustedResourceCount).toBe(3);
                expect(context.battlefieldMarine.exhausted).toBe(false);
            });
        });

        describe('When a unit has been defeated by a player through being attacked,', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'battlefield-marine', exhausted: true }],
                        hand: ['bravado'],
                    },
                    player2: {
                        groundArena: ['rebel-pathfinder']
                    }
                });
            });

            it('"If you\'ve defeated an enemy unit this phase" effects will trigger', function () {
                const { context } = contextRef;

                context.player1.passAction();

                context.player2.clickCard(context.rebelPathfinder);
                context.player2.clickCard(context.battlefieldMarine);

                context.player1.clickCard(context.bravado);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player1.exhaustedResourceCount).toBe(3);
                expect(context.battlefieldMarine.exhausted).toBe(false);
            });
        });

        describe('When a unit has been defeated by a player through an event,', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'battlefield-marine', exhausted: true }],
                        hand: ['bravado', 'takedown'],
                    },
                    player2: {
                        groundArena: ['rebel-pathfinder']
                    }
                });
            });

            it('"If you\'ve defeated an enemy unit this phase" effects will trigger', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.takedown);
                context.player1.clickCard(context.rebelPathfinder);

                context.player2.passAction();
                context.player1.readyResources(10);

                expect(context.battlefieldMarine.exhausted).toBe(true);
                context.player1.clickCard(context.bravado);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player1.exhaustedResourceCount).toBe(3);
                expect(context.battlefieldMarine.exhausted).toBe(false);
            });
        });

        describe('When a unit has been defeated by an opponent through an event,', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'battlefield-marine', exhausted: true }],
                        hand: ['bravado'],
                    },
                    player2: {
                        groundArena: ['rebel-pathfinder'],
                        hand: ['takedown'],
                    }
                });
            });

            it('"If you\'ve defeated an enemy unit this phase" effects will not trigger', function () {
                const { context } = contextRef;

                context.player1.passAction();

                context.player2.clickCard(context.takedown);
                context.player2.clickCard(context.rebelPathfinder);

                expect(context.battlefieldMarine.exhausted).toBe(true);
                context.player1.clickCard(context.bravado);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player1.exhaustedResourceCount).toBe(5);
                expect(context.battlefieldMarine.exhausted).toBe(false);
            });
        });

        describe('When a unit has been defeated by a player through an event even opponent chose unit,', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'battlefield-marine', exhausted: true }],
                        hand: ['bravado', 'power-of-the-dark-side'],
                    },
                    player2: {
                        groundArena: ['rebel-pathfinder']
                    }
                });
            });

            it('"If you\'ve defeated an enemy unit this phase" effects will trigger', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.powerOfTheDarkSide);
                context.player2.clickCard(context.rebelPathfinder);

                context.player2.passAction();
                context.player1.readyResources(10);

                expect(context.battlefieldMarine.exhausted).toBe(true);
                context.player1.clickCard(context.bravado);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player1.exhaustedResourceCount).toBe(3);
                expect(context.battlefieldMarine.exhausted).toBe(false);
            });
        });

        describe('When a unit has been defeated by a player through an event that deals damage,', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'battlefield-marine', exhausted: true }],
                        hand: ['bravado', 'open-fire'],
                    },
                    player2: {
                        groundArena: ['rebel-pathfinder']
                    }
                });
            });

            it('"If you\'ve defeated an enemy unit this phase" effects will trigger', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.openFire);
                context.player1.clickCard(context.rebelPathfinder);

                context.player2.passAction();
                context.player1.readyResources(10);

                expect(context.battlefieldMarine.exhausted).toBe(true);
                context.player1.clickCard(context.bravado);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player1.exhaustedResourceCount).toBe(3);
                expect(context.battlefieldMarine.exhausted).toBe(false);
            });
        });

        describe('When a unit has been defeated by a player through an event that has a unit deal damage,', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'battlefield-marine', exhausted: true }],
                        hand: ['bravado', 'strike-true'],
                    },
                    player2: {
                        groundArena: ['rebel-pathfinder']
                    }
                });
            });

            it('"If you\'ve defeated an enemy unit this phase" effects will trigger', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.strikeTrue);
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.rebelPathfinder);

                context.player2.passAction();
                context.player1.readyResources(10);

                expect(context.battlefieldMarine.exhausted).toBe(true);
                context.player1.clickCard(context.bravado);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player1.exhaustedResourceCount).toBe(3);
                expect(context.battlefieldMarine.exhausted).toBe(false);
            });
        });

        describe('When a unit has been defeated by a player through an upgrade that applies a negative HP modifier,', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'battlefield-marine', exhausted: true }],
                        hand: ['bravado', 'perilous-position'],
                    },
                    player2: {
                        groundArena: [{ card: 'rebel-pathfinder', damage: 1 }]
                    }
                });
            });

            it('"If you\'ve defeated an enemy unit this phase" effects will trigger', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.perilousPosition);
                context.player1.clickCard(context.rebelPathfinder);

                context.player2.passAction();
                context.player1.readyResources(10);

                expect(context.battlefieldMarine.exhausted).toBe(true);
                context.player1.clickCard(context.bravado);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player1.exhaustedResourceCount).toBe(3);
                expect(context.battlefieldMarine.exhausted).toBe(false);
            });
        });

        describe('When a unit has been defeated by an opponet through an upgrade that applies a negative HP modifier,', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'battlefield-marine', exhausted: true }],
                        hand: ['bravado'],
                    },
                    player2: {
                        groundArena: [{ card: 'rebel-pathfinder', damage: 1 }],
                        hand: ['perilous-position'],
                    }
                });
            });

            it('"If you\'ve defeated an enemy unit this phase" effects will not trigger', function () {
                const { context } = contextRef;

                context.player1.passAction();

                context.player2.clickCard(context.perilousPosition);
                context.player2.clickCard(context.rebelPathfinder);

                expect(context.battlefieldMarine.exhausted).toBe(true);
                context.player1.clickCard(context.bravado);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player1.exhaustedResourceCount).toBe(5);
                expect(context.battlefieldMarine.exhausted).toBe(false);
            });
        });

        describe('When a unit has been defeated by a player through a unit that applies a negative HP modifier,', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'battlefield-marine', exhausted: true }],
                        hand: ['bravado', 'supreme-leader-snoke#shadow-ruler'],
                    },
                    player2: {
                        groundArena: [{ card: 'rebel-pathfinder', damage: 1 }]
                    }
                });
            });

            it('"If you\'ve defeated an enemy unit this phase" effects will trigger', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.supremeLeaderSnoke);

                context.player2.passAction();
                context.player1.readyResources(10);

                expect(context.battlefieldMarine.exhausted).toBe(true);
                context.player1.clickCard(context.bravado);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player1.exhaustedResourceCount).toBe(3);
                expect(context.battlefieldMarine.exhausted).toBe(false);
            });
        });

        describe('When a unit has been defeated by a player through an event that applies a negative HP modifier,', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'battlefield-marine', exhausted: true }],
                        hand: ['bravado', 'make-an-opening'],
                    },
                    player2: {
                        groundArena: [{ card: 'rebel-pathfinder', damage: 1 }]
                    }
                });
            });

            it('"If you\'ve defeated an enemy unit this phase" effects will trigger', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.makeAnOpening);
                context.player1.clickCard(context.rebelPathfinder);

                context.player2.passAction();
                context.player1.readyResources(10);

                expect(context.battlefieldMarine.exhausted).toBe(true);
                context.player1.clickCard(context.bravado);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player1.exhaustedResourceCount).toBe(3);
                expect(context.battlefieldMarine.exhausted).toBe(false);
            });
        });

        describe('When a unit has been defeated by a player through bouncing enemy unit that applied positive HP modifier,', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'battlefield-marine', exhausted: true }],
                        hand: ['bravado', 'waylay'],
                    },
                    player2: {
                        groundArena: [{ card: 'rebel-pathfinder', damage: 3 }, 'general-dodonna#massassi-group-commander']
                    }
                });
            });

            it('"If you\'ve defeated an enemy unit this phase" effects will trigger', function () {
                // TODO this is currently leveraging active player, not player that removed the buff
                const { context } = contextRef;

                expect(context.rebelPathfinder).toBeInZone('groundArena');

                context.player1.clickCard(context.waylay);
                context.player1.clickCard(context.generalDodonna);
                expect(context.generalDodonna).toBeInZone('hand');
                expect(context.rebelPathfinder).toBeInZone('discard');

                context.player2.passAction();
                context.player1.readyResources(10);

                expect(context.battlefieldMarine.exhausted).toBe(true);
                context.player1.clickCard(context.bravado);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player1.exhaustedResourceCount).toBe(3);
                expect(context.battlefieldMarine.exhausted).toBe(false);
            });
        });

        describe('When a unit has been defeated by an opponent through bouncing their own unit that applied positive HP modifier,', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'battlefield-marine', exhausted: true }],
                        hand: ['bravado'],
                    },
                    player2: {
                        groundArena: [{ card: 'rebel-pathfinder', damage: 3 }, 'general-dodonna#massassi-group-commander'],
                        hand: ['waylay']
                    }
                });
            });

            it('"If you\'ve defeated an enemy unit this phase" effects will not trigger', function () {
                // TODO this is currently leveraging active player, not player that removed the buff
                const { context } = contextRef;

                context.player1.passAction();

                context.player2.clickCard(context.waylay);
                context.player2.clickCard(context.generalDodonna);
                expect(context.generalDodonna).toBeInZone('hand');
                expect(context.rebelPathfinder).toBeInZone('discard');

                expect(context.battlefieldMarine.exhausted).toBe(true);
                context.player1.clickCard(context.bravado);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player1.exhaustedResourceCount).toBe(5);
                expect(context.battlefieldMarine.exhausted).toBe(false);
            });
        });

        describe('When a unit has been defeated by a player through defeating an enemy upgrade that applied positive HP modifier,', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'battlefield-marine', exhausted: true }],
                        hand: ['bravado', 'confiscate'],
                    },
                    player2: {
                        groundArena: [{ card: 'rebel-pathfinder', upgrades: ['jedi-lightsaber'], damage: 3 }]
                    }
                });
            });

            it('"If you\'ve defeated an enemy unit this phase" effects will trigger', function () {
                // TODO this is currently leveraging active player, not player that removed the buff
                const { context } = contextRef;

                context.player1.clickCard(context.confiscate);
                context.player1.clickCard(context.jediLightsaber);
                expect(context.jediLightsaber).toBeInZone('discard');
                expect(context.rebelPathfinder).toBeInZone('discard');

                context.player2.passAction();
                context.player1.readyResources(10);

                expect(context.battlefieldMarine.exhausted).toBe(true);
                context.player1.clickCard(context.bravado);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player1.exhaustedResourceCount).toBe(3);
                expect(context.battlefieldMarine.exhausted).toBe(false);
            });
        });

        describe('When a unit has been defeated by an opponent through defeating their own upgrade that applied positive HP modifier,', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'battlefield-marine', exhausted: true }],
                        hand: ['bravado'],
                    },
                    player2: {
                        groundArena: [{ card: 'rebel-pathfinder', upgrades: ['jedi-lightsaber'], damage: 3 }],
                        hand: ['confiscate']
                    }
                });
            });

            it('"If you\'ve defeated an enemy unit this phase" effects will not trigger', function () {
                // TODO this is currently leveraging active player, not player that removed the buff
                const { context } = contextRef;

                context.player1.passAction();

                context.player2.clickCard(context.confiscate);
                context.player2.clickCard(context.jediLightsaber);
                expect(context.jediLightsaber).toBeInZone('discard');
                expect(context.rebelPathfinder).toBeInZone('discard');

                expect(context.battlefieldMarine.exhausted).toBe(true);
                context.player1.clickCard(context.bravado);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player1.exhaustedResourceCount).toBe(5);
                expect(context.battlefieldMarine.exhausted).toBe(false);
            });
        });

        // TODO add test for 'A Fine Addition'
        // TODO Add test case for Huyang
    });
});