describe('Coordinate keyword', function() {
    integration(function(contextRef) {
        describe('When a unit with the Coordinate keyword', function() {
            it('is in play with at least 2 other friendly units, its Coordinate ability is online', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['anakin-skywalker#maverick-mentor', 'clone-heavy-gunner'],
                        spaceArena: ['wing-leader'],
                        deck: ['wampa']
                    }
                });

                const { context } = contextRef;

                // constant Coordinate ability
                expect(context.cloneHeavyGunner.getPower()).toBe(3);

                // triggered Coordinate ability
                context.player1.clickCard(context.anakinSkywalker);

                expect(context.p2Base.damage).toBe(6);
                expect(context.player1.handSize).toBe(1);
                expect(context.wampa).toBeInZone('hand');
            });

            it('is in play with at fewer than 2 other friendly units, its Coordinate ability is offline', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['anakin-skywalker#maverick-mentor', 'clone-heavy-gunner'],
                        deck: ['wampa']
                    },
                    player2: {
                        groundArena: ['atst'],
                        spaceArena: ['tieln-fighter']
                    }
                });

                const { context } = contextRef;

                // constant Coordinate ability
                expect(context.cloneHeavyGunner.getPower()).toBe(1);

                // triggered Coordinate ability
                context.player1.clickCard(context.anakinSkywalker);
                context.player1.clickCard(context.p2Base);

                expect(context.p2Base.damage).toBe(6);
                expect(context.player1.handSize).toBe(0);
                expect(context.wampa).toBeInZone('deck');
            });

            it('is in play with a variable number of other friendly units, its Coordinate ability will correct go online / offline', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['anakin-skywalker#maverick-mentor', 'clone-heavy-gunner'],
                        hand: ['wing-leader'],
                        deck: ['wampa', 'atst']
                    },
                    player2: {
                        hand: ['waylay']
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });

                const { context } = contextRef;

                // Coordinate starts offline
                expect(context.cloneHeavyGunner.getPower()).toBe(1);
                context.player1.clickCard(context.anakinSkywalker);
                expect(context.p2Base.damage).toBe(6);
                expect(context.player1.handSize).toBe(1);
                expect(context.wampa).toBeInZone('deck');

                // turn Coordinate online
                context.player2.passAction();
                context.player1.clickCard(context.wingLeader);
                context.player2.passAction();
                context.anakinSkywalker.exhausted = false;

                expect(context.cloneHeavyGunner.getPower()).toBe(3);
                context.player1.clickCard(context.anakinSkywalker);
                expect(context.p2Base.damage).toBe(12);
                expect(context.player1.handSize).toBe(1);
                expect(context.wampa).toBeInZone('hand');

                // turn Coordinate offline again
                context.player2.clickCard(context.waylay);
                context.player2.clickCard(context.wingLeader);
                context.anakinSkywalker.exhausted = false;

                expect(context.cloneHeavyGunner.getPower()).toBe(1);
                context.player1.clickCard(context.anakinSkywalker);
                expect(context.p2Base.damage).toBe(18);
                expect(context.player1.handSize).toBe(2);
                expect(context.atst).toBeInZone('deck');
            });

            it('is returned to hand and played again, its Coordinate ability doesn\'t trigger twice', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['anakin-skywalker#maverick-mentor', 'clone-heavy-gunner'],
                        spaceArena: ['wing-leader'],
                        deck: ['wampa', 'atst'],
                        hand: ['waylay']
                    },
                    player2: {
                        hand: ['cantina-bouncer']
                    }
                });

                const { context } = contextRef;

                // confirm Coordinate online
                expect(context.cloneHeavyGunner.getPower()).toBe(3);
                context.player1.clickCard(context.anakinSkywalker);
                expect(context.p2Base.damage).toBe(6);
                expect(context.player1.handSize).toBe(2);
                expect(context.wampa).toBeInZone('hand');

                // return Coordinate units to hand
                context.player2.clickCard(context.cantinaBouncer);
                context.player2.clickCard(context.anakinSkywalker);
                context.player1.clickCard(context.waylay);
                context.player1.clickCard(context.cloneHeavyGunner);

                // play Coordinate units back out
                context.player2.passAction();
                context.player1.clickCard(context.anakinSkywalker);
                context.player2.passAction();
                context.player1.clickCard(context.cloneHeavyGunner);
                context.player2.passAction();

                // confirm Coordinate online and working normally
                expect(context.cloneHeavyGunner.getPower()).toBe(3);
                context.anakinSkywalker.exhausted = false;
                context.player1.clickCard(context.anakinSkywalker);
                context.player1.clickCard(context.p2Base);

                expect(context.p2Base.damage).toBe(12);
                expect(context.player1.handSize).toBe(2);
                expect(context.wampa).toBeInZone('hand');
                expect(context.atst).toBeInZone('hand');
            });
        });
    });
});
