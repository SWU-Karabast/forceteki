describe('Revered Bonsho', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['niten-pupil', 'solemn-scholar'],
                    hand: ['embrace-the-void'],
                    dynastyDiscard: ['revered-bonsho']
                },
                player2: {
                    inPlay: ['mirumoto-raitsugu'],
                    dynastyDiscard: ['revered-bonsho']
                }
            });

            this.bonsho = this.player1.placeCardInProvince('revered-bonsho', 'province 1');
            this.nitenPupil = this.player1.findCardByName('niten-pupil');
            this.mirumotoRaitsugu = this.player2.findCardByName('mirumoto-raitsugu');
            this.etv = this.player1.findCardByName('embrace-the-void');
            this.scholar = this.player1.findCardByName('solemn-scholar');
            this.bonsho2 = this.player2.placeCardInProvince('revered-bonsho', 'province 2');

            this.nitenPupil.fate = 5;
            this.scholar.fate = 5;
            this.mirumotoRaitsugu.fate = 5;
        });

        it('should prompt you to distribute fate', function() {
            this.advancePhases('fate');
            expect(this.player1).toHavePrompt('Choose a ring to receive fate');
            expect(this.player1).toBeAbleToSelectRing('air');
            expect(this.player1).toBeAbleToSelectRing('earth');
            expect(this.player1).toBeAbleToSelectRing('fire');
            expect(this.player1).toBeAbleToSelectRing('void');
            expect(this.player1).toBeAbleToSelectRing('water');

            this.player1.clickRing('earth');
            expect(this.player1).toHavePrompt('Choose a ring to receive fate');
            expect(this.player1).toBeAbleToSelectRing('air');
            expect(this.player1).not.toBeAbleToSelectRing('earth');
            expect(this.player1).toBeAbleToSelectRing('fire');
            expect(this.player1).toBeAbleToSelectRing('void');
            expect(this.player1).toBeAbleToSelectRing('water');

            this.player1.clickRing('void');
            expect(this.player1).toHavePrompt('Choose a ring to receive fate');
            expect(this.player1).toBeAbleToSelectRing('air');
            expect(this.player1).not.toBeAbleToSelectRing('earth');
            expect(this.player1).toBeAbleToSelectRing('fire');
            expect(this.player1).not.toBeAbleToSelectRing('void');
            expect(this.player1).toBeAbleToSelectRing('water');

            this.player1.clickRing('water');
            expect(this.player1).not.toHavePrompt('Choose a ring to receive fate');
            expect(this.game.rings.air.fate).toBe(1);
            expect(this.game.rings.earth.fate).toBe(2);
            expect(this.game.rings.fire.fate).toBe(1);
            expect(this.game.rings.void.fate).toBe(2);
            expect(this.game.rings.water.fate).toBe(2);

            expect(this.getChatLogs(10)).toContain('player1 places 1 fate on the Earth Ring due to the effects of Revered Bonshō');
            expect(this.getChatLogs(10)).toContain('player1 places 1 fate on the Void Ring due to the effects of Revered Bonshō');
            expect(this.getChatLogs(10)).toContain('player1 places 1 fate on the Water Ring due to the effects of Revered Bonshō');
        });

        it('should not prompt you to distribute fate if an equal amount can go on all rings', function() {
            this.player1.claimRing('air');
            this.player1.claimRing('earth');
            this.player2.claimRing('fire');
            this.player2.claimRing('water');

            this.advancePhases('fate');
            expect(this.player1).not.toHavePrompt('Choose a ring to receive fate');
            expect(this.game.rings.air.fate).toBe(0);
            expect(this.game.rings.earth.fate).toBe(0);
            expect(this.game.rings.fire.fate).toBe(0);
            expect(this.game.rings.void.fate).toBe(4);
            expect(this.game.rings.water.fate).toBe(0);

            expect(this.getChatLogs(10)).toContain('player1 places 3 fate on the Void Ring due to the effects of Revered Bonshō');
        });

        it('should only prompt you to distribute excess fate after an equal amount is placed on all rings', function() {
            this.player1.claimRing('air');
            this.player1.claimRing('earth');
            this.player2.claimRing('fire');

            this.advancePhases('fate');
            expect(this.player1).toHavePrompt('Choose a ring to receive fate');
            expect(this.player1).not.toBeAbleToSelectRing('air');
            expect(this.player1).not.toBeAbleToSelectRing('earth');
            expect(this.player1).not.toBeAbleToSelectRing('fire');
            expect(this.player1).toBeAbleToSelectRing('void');
            expect(this.player1).toBeAbleToSelectRing('water');
            this.player1.clickRing('void');


            expect(this.player1).not.toHavePrompt('Choose a ring to receive fate');
            expect(this.game.rings.air.fate).toBe(0);
            expect(this.game.rings.earth.fate).toBe(0);
            expect(this.game.rings.fire.fate).toBe(0);
            expect(this.game.rings.void.fate).toBe(3);
            expect(this.game.rings.water.fate).toBe(2);

            expect(this.getChatLogs(10)).toContain('player1 places 2 fate on the Void Ring due to the effects of Revered Bonshō');
            expect(this.getChatLogs(10)).toContain('player1 places 1 fate on the Water Ring due to the effects of Revered Bonshō');
        });

        it('should not get you to place fate taken by Embrace the Void', function() {
            this.player1.claimRing('air');
            this.player1.claimRing('earth');
            this.player2.claimRing('fire');
            this.player1.playAttachment(this.etv, this.nitenPupil);

            this.advancePhases('fate');
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.etv);
            this.player1.clickCard(this.etv);

            expect(this.player1).not.toHavePrompt('Choose a ring to receive fate');
            expect(this.getChatLogs(10)).toContain('player1 places 1 fate on the Void Ring due to the effects of Revered Bonshō');
            expect(this.getChatLogs(10)).toContain('player1 places 1 fate on the Water Ring due to the effects of Revered Bonshō');
        });

        it('player 2 Bonsho', function() {
            this.player2.placeCardInProvince(this.bonsho2, 'province 1');
            this.player1.moveCard(this.bonsho, 'dynasty discard pile');

            this.advancePhases('fate');
            expect(this.player2).toHavePrompt('Choose a ring to receive fate');
            expect(this.player2).toBeAbleToSelectRing('air');
            expect(this.player2).toBeAbleToSelectRing('earth');
            expect(this.player2).toBeAbleToSelectRing('fire');
            expect(this.player2).toBeAbleToSelectRing('void');
            expect(this.player2).toBeAbleToSelectRing('water');

            this.player2.clickRing('earth');
            expect(this.player2).toHavePrompt('Choose a ring to receive fate');
            expect(this.player2).toBeAbleToSelectRing('air');
            expect(this.player2).not.toBeAbleToSelectRing('earth');
            expect(this.player2).toBeAbleToSelectRing('fire');
            expect(this.player2).toBeAbleToSelectRing('void');
            expect(this.player2).toBeAbleToSelectRing('water');

            this.player2.clickRing('void');
            expect(this.player2).toHavePrompt('Choose a ring to receive fate');
            expect(this.player2).toBeAbleToSelectRing('air');
            expect(this.player2).not.toBeAbleToSelectRing('earth');
            expect(this.player2).toBeAbleToSelectRing('fire');
            expect(this.player2).not.toBeAbleToSelectRing('void');
            expect(this.player2).toBeAbleToSelectRing('water');

            this.player2.clickRing('water');
            expect(this.player2).not.toHavePrompt('Choose a ring to receive fate');
            expect(this.game.rings.air.fate).toBe(1);
            expect(this.game.rings.earth.fate).toBe(2);
            expect(this.game.rings.fire.fate).toBe(1);
            expect(this.game.rings.void.fate).toBe(2);
            expect(this.game.rings.water.fate).toBe(2);

            expect(this.getChatLogs(10)).toContain('player2 places 1 fate on the Earth Ring due to the effects of Revered Bonshō');
            expect(this.getChatLogs(10)).toContain('player2 places 1 fate on the Void Ring due to the effects of Revered Bonshō');
            expect(this.getChatLogs(10)).toContain('player2 places 1 fate on the Water Ring due to the effects of Revered Bonshō');
        });

        it('both players with a Bonsho', function() {
            this.player2.placeCardInProvince(this.bonsho2, 'province 1');

            this.advancePhases('fate');
            expect(this.player1).toHavePrompt('Choose a ring to receive fate');
            expect(this.player1).toBeAbleToSelectRing('air');
            expect(this.player1).toBeAbleToSelectRing('earth');
            expect(this.player1).toBeAbleToSelectRing('fire');
            expect(this.player1).toBeAbleToSelectRing('void');
            expect(this.player1).toBeAbleToSelectRing('water');

            this.player1.clickRing('earth');
            expect(this.player1).toHavePrompt('Choose a ring to receive fate');
            expect(this.player1).toBeAbleToSelectRing('air');
            expect(this.player1).not.toBeAbleToSelectRing('earth');
            expect(this.player1).toBeAbleToSelectRing('fire');
            expect(this.player1).toBeAbleToSelectRing('void');
            expect(this.player1).toBeAbleToSelectRing('water');

            this.player1.clickRing('void');
            expect(this.player1).toHavePrompt('Choose a ring to receive fate');
            expect(this.player1).toBeAbleToSelectRing('air');
            expect(this.player1).not.toBeAbleToSelectRing('earth');
            expect(this.player1).toBeAbleToSelectRing('fire');
            expect(this.player1).not.toBeAbleToSelectRing('void');
            expect(this.player1).toBeAbleToSelectRing('water');

            this.player1.clickRing('water');
            expect(this.player1).not.toHavePrompt('Choose a ring to receive fate');
            expect(this.game.rings.air.fate).toBe(1);
            expect(this.game.rings.earth.fate).toBe(2);
            expect(this.game.rings.fire.fate).toBe(1);
            expect(this.game.rings.void.fate).toBe(2);
            expect(this.game.rings.water.fate).toBe(2);

            expect(this.getChatLogs(10)).toContain('player1 places 1 fate on the Earth Ring due to the effects of Revered Bonshō');
            expect(this.getChatLogs(10)).toContain('player1 places 1 fate on the Void Ring due to the effects of Revered Bonshō');
            expect(this.getChatLogs(10)).toContain('player1 places 1 fate on the Water Ring due to the effects of Revered Bonshō');

            expect(this.player2).not.toHavePrompt('Choose a ring to receive fate');
        });
    });
});
