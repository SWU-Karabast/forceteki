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

            it('can only select space units & can select itself', function () {
                // Play Imperial Interceptor
                this.player1.clickCard(this.imperialInterceptor);
                expect(this.player1).toBeAbleToSelectExactly([this.systemPatrolCraft, this.gladiatorStarDestroyer, this.imperialInterceptor]);

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
