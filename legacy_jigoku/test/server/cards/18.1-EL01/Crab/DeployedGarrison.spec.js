describe('Deployed Garrison', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['daidoji-ahma', 'brash-samurai', 'daidoji-strategist']
                },
                player2: {
                    dynastyDiscard: ['imperial-storehouse'],
                    inPlay: ['deployed-garrison', 'kaiu-envoy'],
                    provinces: ['manicured-garden']
                }
            });

            this.ahma = this.player1.findCardByName('daidoji-ahma');
            this.brash = this.player1.findCardByName('brash-samurai');
            this.daidojiStrategist = this.player1.findCardByName('daidoji-strategist');

            this.storehouse = this.player2.moveCard('imperial-storehouse', 'province 1');
            this.garrison = this.player2.findCardByName('deployed-garrison');
            this.envoy = this.player2.findCardByName('kaiu-envoy');
            this.garden = this.player2.findCardByName('manicured-garden');
        });

        it('should not allow being chosen by covert', function () {
            this.noMoreActions();
            this.player1.clickRing('air');
            this.player1.clickCard(this.garden);
            this.player1.clickCard(this.ahma);
            this.player1.clickPrompt('Initiate Conflict');
            expect(this.player1).toHavePrompt('Choose covert target for Daidōji Ahma');
            expect(this.player1).not.toBeAbleToSelect(this.garrison);
            expect(this.player1).toBeAbleToSelect(this.envoy);
        });

        it('does not bow when win defending a holding', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.brash],
                defenders: [this.garrison],
                type: 'military'
            });

            this.noMoreActions();
            expect(this.player2).toHavePrompt('Any reactions?');
            this.player2.clickCard(this.garrison);

            expect(this.brash.bowed).toBe(true);
            expect(this.garrison.bowed).toBe(false);
            expect(this.getChatLogs(5)).toContain(
                'player2 uses Deployed Garrison to not bow during the conflict resolution'
            );
        });

        it('does not bow when win defending next to a holding', function () {
            this.player2.moveCard(this.storehouse, 'province 2');

            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.brash],
                defenders: [this.garrison],
                type: 'military'
            });

            this.noMoreActions();
            expect(this.player2).toHavePrompt('Any reactions?');
            this.player2.clickCard(this.garrison);

            expect(this.brash.bowed).toBe(true);
            expect(this.garrison.bowed).toBe(false);
            expect(this.getChatLogs(5)).toContain(
                'player2 uses Deployed Garrison to not bow during the conflict resolution'
            );
        });

        it('bows when win defending far from a holding', function () {
            this.player2.moveCard(this.storehouse, 'province 3');

            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.brash],
                defenders: [this.garrison],
                type: 'military'
            });

            this.noMoreActions();
            expect(this.player2).not.toHavePrompt('Any reactions?');

            expect(this.brash.bowed).toBe(true);
            expect(this.garrison.bowed).toBe(true);
            expect(this.getChatLogs(5)).not.toContain(
                'player2 uses Deployed Garrison to not bow during the conflict resolution'
            );
        });

        it('bows when lose defending a holding', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.daidojiStrategist],
                defenders: [this.garrison],
                type: 'military',
                ring: 'void'
            });

            this.noMoreActions();
            expect(this.player2).not.toHavePrompt('Any reactions?');

            expect(this.daidojiStrategist.bowed).toBe(true);
            expect(this.garrison.bowed).toBe(true);
            expect(this.getChatLogs(5)).not.toContain(
                'player2 uses Deployed Garrison to not bow during the conflict resolution'
            );
        });
    });
});
