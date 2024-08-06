describe('Ikoma Master Hunter', function () {
    integration(function () {
        describe('Ikoma Master Hunter reaction ability', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'draw',
                    player1: {
                        inPlay: ['ikoma-master-hunter']
                    },
                    player2: {
                        inPlay: ['solemn-scholar', 'shinjo-outrider']
                    }
                });

                this.ikomaMasterHunter = this.player1.findCardByName('ikoma-master-hunter');
                this.scholar = this.player2.findCardByName('solemn-scholar');
                this.outrider = this.player2.findCardByName('shinjo-outrider');
                this.ikomaMasterHunter.bow();

                this.player1.clickPrompt('1');
                this.player2.clickPrompt('1');
            });

            it('should trigger on conflict phase start and let you select a opponent character', function () {
                this.noMoreActions();

                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.ikomaMasterHunter);

                this.player1.clickCard(this.ikomaMasterHunter);

                expect(this.player1).not.toBeAbleToSelect(this.ikomaMasterHunter);
                expect(this.player1).toBeAbleToSelect(this.scholar);
                expect(this.player1).toBeAbleToSelect(this.outrider);

                this.player1.clickCard(this.scholar);
                expect(this.getChatLogs(3)).toContain('player1 uses Ikoma Master Hunter to track Solemn Scholar');
            });


            it('should move in and ready the master hunter when the targeted character commits to a conflict', function () {
                this.noMoreActions();

                this.player1.clickCard(this.ikomaMasterHunter);
                this.player1.clickCard(this.scholar);

                this.noMoreActions();
                this.noMoreActions();

                this.initiateConflict({
                    type: 'political',
                    attackers: [this.scholar],
                    defenders: []
                });

                expect(this.player1).toHavePrompt('conflict action window');
                expect(this.ikomaMasterHunter.isParticipating()).toBe(true);
                expect(this.ikomaMasterHunter.bowed).toBe(false);
            });

            it('should move in and ready the master hunter when the targeted character moves to a conflict', function () {
                this.noMoreActions();

                this.player1.clickCard(this.ikomaMasterHunter);
                this.player1.clickCard(this.outrider);

                this.noMoreActions();
                this.noMoreActions();

                this.initiateConflict({
                    type: 'political',
                    attackers: [this.scholar],
                    defenders: []
                });

                expect(this.ikomaMasterHunter.isParticipating()).toBe(false);
                expect(this.ikomaMasterHunter.bowed).toBe(true);

                this.player1.pass();
                this.player2.clickCard(this.outrider);

                expect(this.outrider.isParticipating()).toBe(true);
                expect(this.outrider.bowed).toBe(false);

                expect(this.player1).toHavePrompt('conflict action window');
                expect(this.ikomaMasterHunter.isParticipating()).toBe(true);
                expect(this.ikomaMasterHunter.bowed).toBe(false);
            });

            it('should activate multiple times per turn', function () {
                this.noMoreActions();

                this.player1.clickCard(this.ikomaMasterHunter);
                this.player1.clickCard(this.scholar);

                this.noMoreActions();
                this.noMoreActions();

                this.initiateConflict({
                    type: 'political',
                    ring: 'air',
                    attackers: [this.scholar],
                    defenders: []
                });

                expect(this.player1).toHavePrompt('conflict action window');
                expect(this.ikomaMasterHunter.isParticipating()).toBe(true);
                expect(this.ikomaMasterHunter.bowed).toBe(false);

                this.player1.pass();
                this.player2.pass();

                this.scholar.ready();
                this.game.checkGameState(true);
                this.noMoreActions();
                this.noMoreActions();

                this.initiateConflict({
                    type: 'military',
                    ring: 'fire',
                    attackers: [this.scholar],
                    defenders: []
                });

                expect(this.player1).toHavePrompt('conflict action window');
                expect(this.ikomaMasterHunter.isParticipating()).toBe(true);
                expect(this.ikomaMasterHunter.bowed).toBe(false);
            });
        });
    });
});
