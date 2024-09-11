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

            it('can be passed, can only select space units & can damage itself', function () {
                // Play Imperial Interceptor
                this.player1.clickCard(this.imperialInterceptor);
                expect(this.player1).toBeAbleToSelectExactly([this.systemPatrolCraft, this.gladiatorStarDestroyer, this.imperialInterceptor]);
                expect(this.player1).toHavePassAbilityPrompt();

                // Select Itself to Target
                this.player1.clickCard(this.imperialInterceptor);
            });

            it('can select opponents units', function () {
                // Play Imperial Interceptor
                this.player1.clickCard(this.imperialInterceptor);

                // Choose Target
                expect(this.player1).toBeAbleToSelectExactly([this.systemPatrolCraft, this.gladiatorStarDestroyer, this.imperialInterceptor]);
                this.player1.clickCard(this.gladiatorStarDestroyer);
                expect(this.gladiatorStarDestroyer.damage).toEqual(3);
            });

            it('can select own units', function () {
                // Play Imperial Interceptor
                this.player1.clickCard(this.imperialInterceptor);

                // Choose Target
                expect(this.player1).toBeAbleToSelectExactly([this.systemPatrolCraft, this.gladiatorStarDestroyer, this.imperialInterceptor]);
                this.player1.clickCard(this.systemPatrolCraft);
                expect(this.systemPatrolCraft.damage).toEqual(3);
            });
        });
    });
});
