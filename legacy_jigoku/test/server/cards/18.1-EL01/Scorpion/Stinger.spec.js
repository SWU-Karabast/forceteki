describe('Stinger', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    honor: 10,
                    inPlay: ['isawa-tadaka-2', 'border-rider'],
                    hand: ['against-the-waves']
                },
                player2: {
                    honor: 10,
                    inPlay: ['kakita-yoshi'],
                    hand: ['stinger']
                }
            });

            this.yoshi = this.player2.findCardByName('kakita-yoshi');
            this.stinger = this.player2.findCardByName('stinger');
            this.tadaka = this.player1.findCardByName('isawa-tadaka-2');
            this.rider = this.player1.findCardByName('border-rider');
            this.atw = this.player1.findCardByName('against-the-waves');
        });

        it('should let you attach to an attacking character', function () {
            let honor = this.player2.honor;
            this.yoshi.honor();
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.tadaka],
                defenders: [this.yoshi]
            });
            this.player2.clickCard(this.stinger);
            expect(this.player2).toBeAbleToSelect(this.tadaka);
            expect(this.player2).not.toBeAbleToSelect(this.yoshi);
            expect(this.player2).not.toBeAbleToSelect(this.rider);
            this.player2.clickCard(this.tadaka);
            expect(this.tadaka.attachments).toContain(this.stinger);
            expect(this.player2.honor).toBe(honor - 1);
            expect(this.getChatLogs(5)).toContain(
                'player2 uses Stinger, losing 1 honor to attach Stinger to Isawa Tadaka'
            );
        });

        it('should not let you ready the attached character', function () {
            this.yoshi.honor();
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.tadaka],
                defenders: [this.yoshi]
            });
            this.player2.clickCard(this.stinger);
            this.player2.clickCard(this.tadaka);
            this.noMoreActions();

            expect(this.player1).toHavePrompt('Action Window');
            expect(this.tadaka.bowed).toBe(true);
            this.player1.clickCard(this.atw);
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should let the attached character ready in the fate phase', function () {
            this.tadaka.fate = 5;
            this.yoshi.fate = 5;
            this.rider.fate = 5;

            this.yoshi.honor();
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.tadaka],
                defenders: [this.yoshi]
            });
            this.player2.clickCard(this.stinger);
            this.player2.clickCard(this.tadaka);
            this.noMoreActions();
            expect(this.tadaka.bowed).toBe(true);
            this.advancePhases('fate');
            expect(this.tadaka.bowed).toBe(false);
        });
    });
});
