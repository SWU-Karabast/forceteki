describe('Outspoken Representative', function () {
    integration(function (contextRef) {
        describe('ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['duchesss-champion']
                    },
                    player2: {
                        groundArena: ['specforce-soldier'],
                    },
                });
            });

            it('test Name', function () {
                const { context } = contextRef;
            });
        });
    });
});