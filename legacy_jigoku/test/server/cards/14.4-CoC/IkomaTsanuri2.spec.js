describe('Ikoma Tsanuri 2', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['countryside-trader', 'ikoma-tsanuri-2'],
                    provinces: ['kenson-no-gakka', 'abandoning-honor', 'brother-s-gift-dojo'],
                    hand: ['cloud-the-mind', 'fine-katana', 'ornate-fan', 'forebearer-s-echoes'],
                    dynastyDiscard: ['iuchi-farseer']
                },
                player2: {
                    inPlay: ['countryside-trader', 'cunning-negotiator'],
                    provinces: ['midnight-revels', 'upholding-authority', 'manicured-garden', 'temple-of-the-dragons'],
                    dynastyDiscard: ['daidoji-marketplace']
                }
            });

            this.trader = this.player1.findCardByName('countryside-trader');
            this.kensonNoGakka = this.player1.findCardByName('kenson-no-gakka', 'province 1');
            this.upholding = this.player2.findCardByName('upholding-authority', 'province 2');
            this.brothersGiftDojo = this.player1.findCardByName('brother-s-gift-dojo', 'province 3');

            this.trader2 = this.player2.findCardByName('countryside-trader');
            this.revels = this.player2.findCardByName('midnight-revels', 'province 1');
            this.abandoning = this.player1.findCardByName('abandoning-honor', 'province 2');
            this.manicuredGarden = this.player2.findCardByName('manicured-garden', 'province 3');
            this.templeOfDragons = this.player2.findCardByName('temple-of-the-dragons', 'province 4');

            this.tsanuri = this.player1.findCardByName('ikoma-tsanuri-2');
            this.negotiator = this.player2.findCardByName('cunning-negotiator');
            this.marketPlace = this.player2.findCardByName('daidoji-marketplace');
            this.player2.placeCardInProvince(this.marketPlace, 'province 4');

            this.farseer = this.player1.findCardByName('iuchi-farseer');
            this.echoes = this.player1.findCardByName('forebearer-s-echoes');

            this.revels.facedown = false;
            this.manicuredGarden.facedown = false;
            this.templeOfDragons.facedown = true;

            this.trader.fate = 1;
            this.trader2.fate = 1;

            this.game.checkGameState(true);
        });

        it('should prevent triggering reactions', function() {
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.tsanuri],
                type: 'military',
                province: this.revels
            });
            expect(this.player2).toHavePrompt('Choose Defenders');
            this.player2.clickPrompt('Done');
            expect(this.player2).toHavePrompt('Conflict Action Window');
        });

        it('should prevent triggering actions', function() {
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.tsanuri],
                defenders: [this.negotiator],
                type: 'military',
                province: this.manicuredGarden
            });
            expect(this.player2).toHavePrompt('Conflict Action Window');
            this.player2.clickCard(this.manicuredGarden);
            expect(this.player2).toHavePrompt('Conflict Action Window');
        });

        it('should prevent triggering interrupts', function() {
            this.tsanuri.honor();
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.tsanuri],
                defenders: [],
                type: 'military',
                province: this.upholding
            });
            this.noMoreActions();
            expect(this.upholding.isBroken).toBe(true);
            expect(this.player2).not.toHavePrompt('Triggered Abilities');
            this.player1.clickPrompt('No');
            this.player1.clickPrompt('Don\'t Resolve');
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should prevent abilities that trigger the province', function() {
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.tsanuri],
                defenders: [this.negotiator],
                type: 'military',
                province: this.manicuredGarden
            });
            let fate = this.player2.fate;
            expect(this.player2).toHavePrompt('Conflict Action Window');
            this.player2.clickCard(this.negotiator);
            this.player1.clickCard(this.tsanuri);
            this.player1.clickPrompt('1');
            this.player2.clickPrompt('1');
            expect(this.player2.fate).toBe(fate);
            expect(this.player1).toHavePrompt('Conflict Action Window');
            expect(this.getChatLogs(10)).toContain('The duel has no effect');
        });

        it('should not prevent Tsanuri\'s controller from using abilities that trigger the province', function() {
            this.noMoreActions();
            this.tsanuri.honor();

            this.initiateConflict({
                attackers: [this.tsanuri],
                defenders: [this.negotiator],
                type: 'military',
                province: this.manicuredGarden
            });
            let fate = this.player1.fate;
            expect(this.player2).toHavePrompt('Conflict Action Window');
            this.player2.clickCard(this.negotiator);
            this.player1.clickCard(this.tsanuri);
            this.player1.clickPrompt('5');
            this.player2.clickPrompt('1');
            expect(this.getChatLogs(10)).toContain('Duel Effect: resolve the action ability of an attacked province');
            expect(this.player1).toHavePrompt('Do you want to trigger a province ability?');
            this.player1.clickPrompt('Yes');
            expect(this.player1.fate).toBe(fate + 1);
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });

        it('should not prevent abilities that resolve the province', function() {
            this.noMoreActions();
            this.player1.passConflict();
            this.negotiator.dishonor();
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.trader2],
                defenders: [this.tsanuri],
                type: 'military',
                province: this.abandoning
            });
            this.player1.pass();
            expect(this.player2).toHavePrompt('Conflict Action Window');
            this.player2.clickCard(this.trader2);
            this.player2.clickCard(this.abandoning);
            expect(this.player2).toHavePrompt('Choose a character');
            expect(this.player2).toBeAbleToSelect(this.negotiator);
            this.player2.clickCard(this.negotiator);
            expect(this.negotiator.location).toBe('dynasty discard pile');
        });

        it('should prevent abilities that trigger the province when Tsanuri is defending', function() {
            this.noMoreActions();
            this.player1.passConflict();
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.negotiator],
                defenders: [this.tsanuri],
                type: 'military',
                province: this.brothersGiftDojo
            });
            this.player1.pass();
            expect(this.player2).toHavePrompt('Conflict Action Window');
            this.player2.clickCard(this.negotiator);
            this.player1.clickCard(this.tsanuri);
            this.player1.clickPrompt('1');
            this.player2.clickPrompt('1');
            expect(this.player1).toHavePrompt('Conflict Action Window');
            expect(this.getChatLogs(10)).toContain('The duel has no effect');
        });

        it('should not prevent triggering reactions on not the attacked province', function() {
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.tsanuri],
                type: 'military',
                province: this.revels
            });
            expect(this.player2).toHavePrompt('Choose Defenders');
            this.player2.clickPrompt('Done');
            expect(this.player2).toHavePrompt('Conflict Action Window');

            expect(this.templeOfDragons.facedown).toBe(true);
            this.player2.pass();
            this.player1.clickCard(this.echoes);
            this.player1.clickCard(this.farseer);
            this.player1.clickCard(this.farseer);
            this.player1.clickCard(this.templeOfDragons);

            expect(this.templeOfDragons.facedown).toBe(false);
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.templeOfDragons);
        });
    });
});

describe('Ikoma Tsanuri 2 with Forced Abilities', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['ikoma-tsanuri-2']
                },
                player2: {
                    provinces: ['temple-of-daikoku']
                }
            });

            this.tsanuri = this.player1.findCardByName('ikoma-tsanuri-2');
            this.temple = this.player2.findCardByName('temple-of-daikoku');
        });

        it('should not prevent triggering forced reactions', function() {
            this.noMoreActions();
            let fate = this.game.rings.water.fate;

            this.initiateConflict({
                attackers: [this.tsanuri],
                type: 'military',
                province: this.daikoku
            });

            expect(this.game.rings.water.fate).toBe(fate + 1);
            expect(this.getChatLogs(5)).toContain('player2 uses Temple of Daikoku to place 1 fate on Water Ring');
        });
    });
});
