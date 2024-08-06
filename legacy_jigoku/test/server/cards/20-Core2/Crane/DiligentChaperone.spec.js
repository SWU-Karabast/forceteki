describe('Diligent Chaperone', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['diligent-chaperone', 'doji-whisperer', 'brash-samurai'],
                    hand: ['resourcefulness']
                },
                player2: {
                    inPlay: ['bayushi-dairu'],
                    hand: ['way-of-the-scorpion']
                }
            });
            this.yojimbo = this.player1.findCardByName('diligent-chaperone');
            this.brash = this.player1.findCardByName('brash-samurai');
            this.whisperer = this.player1.findCardByName('doji-whisperer');
            this.dairu = this.player2.findCardByName('bayushi-dairu');
            this.scorp = this.player2.findCardByName('way-of-the-scorpion');
            this.resourcefulness = this.player1.findCardByName('resourcefulness');

            this.brash.honor();
        });

        it('should cancel trying to dishonor an honored character', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.whisperer, this.brash],
                defenders: [this.dairu]
            });

            this.player2.clickCard(this.scorp);
            this.player2.clickCard(this.brash);
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.yojimbo);
            this.player1.clickCard(this.yojimbo);
            expect(this.player1).toHavePrompt('Conflict Action Window');
            expect(this.brash.isHonored).toBe(true);
            expect(this.scorp.location).toBe('conflict discard pile');
            expect(this.yojimbo.bowed).toBe(false);

            expect(this.getChatLogs(5)).toContain(
                'player1 uses Diligent Chaperone to prevent Brash Samurai from losing their status token'
            );
        });

        it('should not cancel if bowed', function () {
            this.yojimbo.bow();

            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.whisperer, this.brash],
                defenders: [this.dairu]
            });

            expect(this.brash.isHonored).toBe(true);
            this.player2.clickCard(this.scorp);
            this.player2.clickCard(this.brash);
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
            expect(this.brash.isHonored).toBe(false);
        });

        it('should not cancel trying to dishonor a normal character', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.whisperer, this.brash],
                defenders: [this.dairu]
            });

            this.player2.clickCard(this.scorp);
            this.player2.clickCard(this.whisperer);
            expect(this.whisperer.isDishonored).toBe(true);
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });

        it('should cancel trying to move an honored status token off a character', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.whisperer, this.brash],
                defenders: [this.dairu]
            });

            expect(this.dairu.isHonored).toBe(false);
            this.player2.clickCard(this.dairu);
            this.player2.clickCard(this.brash);
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.yojimbo);
            this.player1.clickCard(this.yojimbo);
            expect(this.player1).toHavePrompt('Conflict Action Window');
            expect(this.brash.isHonored).toBe(true);
            expect(this.dairu.isHonored).toBe(false);
            expect(this.yojimbo.bowed).toBe(false);

            expect(this.getChatLogs(5)).toContain(
                'player1 uses Diligent Chaperone to prevent Brash Samurai from losing their status token'
            );
        });

        it('should cancel dishonoring via fire ring', function () {
            this.noMoreActions();
            this.player1.passConflict();
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.dairu],
                defenders: [],
                ring: 'fire'
            });

            this.noMoreActions();

            this.player2.clickCard(this.brash);
            this.player2.clickPrompt('Dishonor Brash Samurai');
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.yojimbo);
            this.player1.clickCard(this.yojimbo);
            expect(this.player1).toHavePrompt('Action Window');
            expect(this.brash.isHonored).toBe(true);
            expect(this.yojimbo.bowed).toBe(false);

            expect(this.getChatLogs(5)).toContain(
                'player1 uses Diligent Chaperone to prevent Brash Samurai from losing their status token'
            );
        });

        it('should cancel dishonoring via cost', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.whisperer, this.brash],
                defenders: [this.dairu]
            });

            this.player2.pass();
            this.player1.clickCard(this.resourcefulness);
            this.player1.clickCard(this.whisperer);
            this.player1.clickCard(this.brash);

            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.yojimbo);
            this.player1.clickCard(this.yojimbo);
            expect(this.player2).toHavePrompt('Conflict Action Window');
            expect(this.brash.isHonored).toBe(true);
            expect(this.whisperer.isHonored).toBe(true);

            expect(this.getChatLogs(10)).toContain(
                'player1 uses Diligent Chaperone to prevent Brash Samurai from losing their status token'
            );
            expect(this.getChatLogs(10)).toContain('player1 plays Resourcefulness, dishonoring Brash Samurai to honor Doji Whisperer')
        });

        it('cannot attack', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.whisperer, this.brash, this.yojimbo],
                defenders: [this.dairu]
            });

            expect(this.player2).toHavePrompt('Conflict Action Window');
            expect(this.yojimbo.isParticipating()).toBe(false);
        });
    });
});
