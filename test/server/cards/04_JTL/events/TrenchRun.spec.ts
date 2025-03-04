
describe('Trench Run', function() {
    integration(function(contextRef) {
        describe('Trench Run\'s ability should attack with a fighter unit, give it +4/+0, and activate discard + damage ability', function() {
            beforeEach(function() {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['trench-run'],
                        spaceArena: ['headhunter-squadron', 'lurking-tie-phantom']
                    },
                    player2: {
                        spaceArena: ['auzituck-liberator-gunship'],
                        deck: ['vanquish', 'takedown']
                    }

                });
            });

            it('Trench Run\'s ability should attack with a fighter unit, give it +4/+0, and activate discard + damage ability', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.trenchRun);

                expect(context.player1).toBeAbleToSelectExactly([context.headhunterSquadron, context.lurkingTiePhantom]);
                context.player1.clickCard(context.headhunterSquadron);
                expect(context.player1).toBeAbleToSelectExactly([context.auzituckLiberatorGunship, context.p2Base]);
                context.player1.clickCard(context.p2Base);

                expect(context.p2Base.damage).toBe(5);
                expect([context.vanquish, context.takedown]).toAllBeInZone('discard');
                expect(context.headhunterSquadron.damage).toBe(1);
            });
        });
    });
});
