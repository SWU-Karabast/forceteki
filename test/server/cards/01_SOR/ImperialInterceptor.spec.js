describe('Imperial Interceptor', function() {
    integration(function() {
        describe('Imperial Interceptor\'s When Played ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['imperial-interceptor'],
                        groundArena: ['pyke-sentinel'],
                        spaceArena: ['system-patrol-craft']
                    },
                    player2: {
                        groundArena: ['wampa', 'superlaser-technician'],
                        spaceArena: ['gladiator-star-destroyer']
                    }
                });
            });

            it('can only select space units, can be passed and can damage a target', function () {
                // Play Imperial Interceptor
                this.player1.clickCard(this.imperialInterceptor);
                expect(this.player1).toHaveEnabledPromptButtons('Pass ability');
                expect(this.player1).toBeAbleToSelectExactly([this.systemPatrolCraft, this.gladiatorStarDestroyer, this.imperialInterceptor]);

                // Select another target and apply damage
                this.player1.clickCard(this.systemPatrolCraft);
                expect(this.systemPatrolCraft.damage).toEqual(3);
            });

            it('can select itself and it is defeated', function () {
                // Play Imperial Interceptor
                this.player1.clickCard(this.imperialInterceptor);
                this.player1.clickCard(this.imperialInterceptor);
                expect(this.imperialInterceptor).toBeInLocation('discard');
            });

            it('should be able to be passed', function () {
                // Play Imperial Interceptor
                this.player1.clickCard(this.imperialInterceptor);

                // Pass the ability to damage another unit
                this.player1.clickPrompt('Pass ability');
                expect(this.imperialInterceptor.damage).toEqual(0);
                expect(this.gladiatorStarDestroyer.damage).toEqual(0);
                expect(this.systemPatrolCraft.damage).toEqual(0);
            });
        });
    });
});
