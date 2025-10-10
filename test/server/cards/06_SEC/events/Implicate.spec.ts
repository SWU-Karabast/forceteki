describe('Implicate', function () {
    integration(function (contextRef) {
        describe('Implicate\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['onyx-squadron-brute'],
                        groundArena: ['swoop-racer'],
                        hand: ['implicate']
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['patrolling-vwing', 'republic-ywing']
                    }
                });
            });

            it('should create a spy token when selected unit is attacked', function () {
                const { context } = contextRef;

                // Play Implicate selecting Onyx Squadron Brute as the sentinel
                context.player1.clickCard(context.implicate);
                expect(context.player1).toBeAbleToSelectExactly([context.onyxSquadronBrute,
                    context.swoopRacer,
                    context.battlefieldMarine,
                    context.patrollingVwing,
                    context.republicYwing]);
                context.player1.clickCard(context.onyxSquadronBrute);

                // Can still attack base on ground
                context.player2.clickCard(context.battlefieldMarine);
                context.player2.clickCard(context.p1Base);

                context.player1.passAction();

                // Can only attack the Brute showing sentinel is active
                context.player2.clickCard(context.patrollingVwing);
                expect(context.player2).toBeAbleToSelectExactly([context.onyxSquadronBrute]);
                context.player2.clickCard(context.onyxSquadronBrute);

                // check damage and check spy generation
                expect(context.onyxSquadronBrute.damage).toBe(1);
                let spies = context.player1.findCardsByName('spy');
                expect(spies.length).toBe(1);
                expect(spies).toAllBeInZone('groundArena');
                expect(spies[0].exhausted).toBeTrue();
                expect(context.patrollingVwing).toBeInZone('discard');

                context.player1.passAction();

                context.player2.clickCard(context.republicYwing);
                expect(context.player2).toBeAbleToSelectExactly([context.onyxSquadronBrute]);
                context.player2.clickCard(context.onyxSquadronBrute);

                // check second spy generation
                expect(context.onyxSquadronBrute.damage).toBe(2);
                spies = context.player1.findCardsByName('spy');
                expect(spies.length).toBe(2);
                expect(spies).toAllBeInZone('groundArena');
                expect(spies[0].exhausted).toBeTrue();
                expect(spies[1].exhausted).toBeTrue();
                expect(context.republicYwing.damage).toBe(2);

                // move to next phase and sentinel is gone on the Brute
                context.moveToNextActionPhase();
                context.player1.passAction();
                context.player2.clickCard(context.republicYwing);
                expect(context.player2).toBeAbleToSelectExactly([context.onyxSquadronBrute, context.p1Base]);
                context.player2.clickCard(context.p1Base);

                // No spy was generated this phase.
                spies = context.player1.findCardsByName('spy');
                expect(spies.length).toBe(2);
                expect(spies).toAllBeInZone('groundArena');
            });
        });
    });
});
