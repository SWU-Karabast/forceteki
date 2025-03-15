describe('IG-88, Murderous Phlutdroid', function() {
    integration(function(contextRef) {
        describe('IG-88\'s ability,', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['ig88#murderous-phlutdroid', 'survivors-gauntlet'],
                        groundArena: ['atst'],
                        spaceArena: ['tieln-fighter']
                    },
                    player2: {
                        groundArena: [{ card: 'wampa', damage: 1 }],
                        hand: ['bamboozle']
                    }
                });
            });

            it('when attached as a pilot, should grant +3/+0 if the opponent has a damaged unit', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.ig88);
                context.player1.clickPrompt('Play IG-88 with Piloting');
                context.player1.clickCard(context.atst);

                expect(context.atst.getPower()).toBe(9);
                expect(context.atst.getHp()).toBe(10);

                context.player2.passAction();

                // defeat wampa to remove it, disabling the IG-88 ability
                context.player1.clickCard(context.atst);
                context.player1.clickCard(context.wampa);
                expect(context.atst.getPower()).toBe(6);
                expect(context.atst.getHp()).toBe(10);
            });

            it('when played as a unit, should grant +3/+0 if the opponent has a damaged unit', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.ig88);
                context.player1.clickPrompt('Play IG-88');

                expect(context.ig88.getPower()).toBe(7);
                expect(context.ig88.getHp()).toBe(5);

                context.player2.passAction();

                // defeat wampa to remove it, disabling the IG-88 ability
                context.ig88.exhausted = false;
                context.player1.clickCard(context.ig88);
                context.player1.clickCard(context.wampa);
                expect(context.ig88.getPower()).toBe(4);
                expect(context.ig88.getHp()).toBe(5);
            });

            it('when attached as a pilot, should correctly unregister and re-register constant abilities when leaving and re-entering the arena', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.ig88);
                context.player1.clickPrompt('Play IG-88 with Piloting');
                context.player1.clickCard(context.atst);

                expect(context.atst.getPower()).toBe(9);
                expect(context.atst.getHp()).toBe(10);

                context.player2.clickCard(context.bamboozle);
                context.player2.clickCard(context.atst);
                expect(context.ig88).toBeInZone('hand');

                context.player1.clickCard(context.ig88);
                context.player1.clickPrompt('Play IG-88 with Piloting');
                context.player1.clickCard(context.tielnFighter);

                expect(context.atst.getPower()).toBe(6);
                expect(context.atst.getHp()).toBe(7);
                expect(context.tielnFighter.getPower()).toBe(5);
                expect(context.tielnFighter.getHp()).toBe(4);
            });

            it('when attached as a pilot, should grant +3/+0 when moved to another vehicle', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.ig88);
                context.player1.clickPrompt('Play IG-88 with Piloting');
                context.player1.clickCard(context.atst);

                expect(context.atst.getPower()).toBe(9);
                expect(context.atst.getHp()).toBe(10);

                context.player2.passAction();

                context.player1.clickCard(context.survivorsGauntlet);
                expect(context.player1).toBeAbleToSelectExactly([context.ig88]);
                context.player1.clickCard(context.ig88);
                expect(context.player1).toBeAbleToSelectExactly([context.survivorsGauntlet, context.tielnFighter]);
                context.player1.clickCard(context.survivorsGauntlet);

                expect(context.atst.getPower()).toBe(6);
                expect(context.atst.getHp()).toBe(7);
                expect(context.survivorsGauntlet.getPower()).toBe(7);
                expect(context.survivorsGauntlet.getHp()).toBe(9);
            });
        });

        describe('IG-88\'s ability,', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['ig88#murderous-phlutdroid', 'daring-raid'],
                        groundArena: [{ card: 'atst', damage: 1 }]
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });
            });

            it('when attached as a pilot, should do nothing if the opponent does not have a damaged unit', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.ig88);
                context.player1.clickPrompt('Play IG-88 with Piloting');
                context.player1.clickCard(context.atst);

                expect(context.atst.getPower()).toBe(6);
                expect(context.atst.getHp()).toBe(10);

                context.player2.passAction();

                // damage wampa, enabling IG-88 ability
                context.player1.clickCard(context.daringRaid);
                context.player1.clickCard(context.wampa);
                expect(context.atst.getPower()).toBe(9);
                expect(context.atst.getHp()).toBe(10);
            });

            it('when played as a unit, should do nothing if the opponent does not have a damaged unit', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.ig88);
                context.player1.clickPrompt('Play IG-88');

                expect(context.ig88.getPower()).toBe(4);
                expect(context.ig88.getHp()).toBe(5);

                context.player2.passAction();

                // damage wampa, enabling IG-88 ability
                context.player1.clickCard(context.daringRaid);
                context.player1.clickCard(context.wampa);
                expect(context.ig88.getPower()).toBe(7);
                expect(context.ig88.getHp()).toBe(5);
            });
        });
    });
});