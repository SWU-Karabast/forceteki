describe('The Darksaber', function() {
    integration(function(contextRef) {
        describe('The Darksaber\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'battlefield-marine', upgrades: ['the-darksaber'] }, 'supercommando-squad', 'clan-wren-rescuer', 'pyke-sentinel'],
                        spaceArena: ['concord-dawn-interceptors']
                    },
                    player2: {
                        groundArena: ['follower-of-the-way']
                    }
                });
            });

            it('should give Experience to friendly Mandalorian units', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                // Check that only friendly Mandalorians were buffed
                expect(context.battlefieldMarine.getPower()).toBe(7);
                expect(context.battlefieldMarine.getHp()).toBe(6);

                expect(context.supercommandoSquad.getPower()).toBe(5);
                expect(context.supercommandoSquad.getHp()).toBe(5);

                expect(context.clanWrenRescuer.getPower()).toBe(2);
                expect(context.clanWrenRescuer.getHp()).toBe(3);

                expect(context.concordDawnInterceptors.getPower()).toBe(2);
                expect(context.concordDawnInterceptors.getHp()).toBe(5);

                expect(context.followerOfTheWay.getPower()).toBe(1);
                expect(context.followerOfTheWay.getHp()).toBe(3);
            });
        });

        describe('The Darksaber\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['the-darksaber'],
                        groundArena: ['supercommando-squad', 'clan-wren-rescuer', 'pyke-sentinel'],
                        spaceArena: ['concord-dawn-interceptors'],
                        base: 'kestro-city',
                        leader: 'bokatan-kryze#princess-in-exile'
                    },
                    player2: {
                        groundArena: ['follower-of-the-way']
                    }
                });
            });

            it('should ignore Aspect penalties when being attached to a friendly Mandalorian', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.theDarksaber);
                expect(context.player1).toBeAbleToSelectExactly([context.supercommandoSquad, context.clanWrenRescuer, context.pykeSentinel, context.followerOfTheWay]);
                context.player1.clickCard(context.clanWrenRescuer);
                expect(context.player1.exhaustedResourceCount).toBe(4);
            });

            it('should ignore Aspect penalties when being attached to an enemy Mandalorian', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.theDarksaber);
                expect(context.player1).toBeAbleToSelectExactly([context.supercommandoSquad, context.clanWrenRescuer, context.pykeSentinel, context.followerOfTheWay]);
                context.player1.clickCard(context.followerOfTheWay);
                expect(context.player1.exhaustedResourceCount).toBe(4);
            });

            it('should not ignore Aspect penalties when not being attached to a Mandalorian', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.theDarksaber);
                expect(context.player1).toBeAbleToSelectExactly([context.supercommandoSquad, context.clanWrenRescuer, context.pykeSentinel, context.followerOfTheWay]);
                context.player1.clickCard(context.pykeSentinel);
                expect(context.player1.exhaustedResourceCount).toBe(6);
            });
        });
    });
});
