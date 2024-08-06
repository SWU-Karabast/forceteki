describe('Ikoma Ujiaki', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['ikoma-ujiaki', 'doji-challenger'],
                    dynastyDiscard: ['a-season-of-war', 'ikoma-tsanuri-2', 'fushicho', 'tainted-hero', 'isawa-ujina', 'kakita-toshimoko']
                },
                player2: {
                }
            });

            this.season = this.player1.placeCardInProvince('a-season-of-war', 'province 1');
            this.tsanuri = this.player1.placeCardInProvince('ikoma-tsanuri-2', 'province 2');
            this.fushicho = this.player1.placeCardInProvince('fushicho', 'province 3');
            this.hero = this.player1.placeCardInProvince('tainted-hero', 'province 4');
            this.challenger = this.player1.findCardByName('doji-challenger');

            this.player1.reduceDeckToNumber('dynasty deck', 0);
            this.ujiaki = this.player1.findCardByName('ikoma-ujiaki');
            this.ujina = this.player1.moveCard('isawa-ujina', 'dynasty deck');
            this.toshimoko = this.player1.moveCard('kakita-toshimoko', 'dynasty deck');

            this.season.facedown = true;
            this.fushicho.facedown = true;
            this.tsanuri.facedown = true;
            this.hero.facedown = true;
        });

        it('should need the favor', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.ujiaki],
                defenders: []
            });

            this.player2.pass();
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.ujiaki);
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });

        it('should not work while not participating', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.challenger],
                defenders: []
            });
            this.player1.player.imperialFavor = 'military';

            this.player2.pass();
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.ujiaki);
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });

        it('should not work outside of a conflict', function() {
            this.player1.player.imperialFavor = 'military';
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.ujiaki);
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should discard the favor', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.ujiaki],
                defenders: []
            });
            this.player1.player.imperialFavor = 'military';

            this.player2.pass();
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.ujiaki);
            expect(this.player1.player.imperialFavor).toBe('');
            expect(this.player1).toHavePrompt('Choose up to two characters');
        });

        it('should work without any facedown', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.ujiaki],
                defenders: []
            });
            this.player1.player.imperialFavor = 'military';
            this.season.facedown = false;
            this.fushicho.facedown = false;
            this.tsanuri.facedown = false;
            this.hero.facedown = false;

            this.player2.pass();
            expect(this.player1).toHavePrompt('Conflict Action Window');

            expect(this.season.facedown).toBe(false);
            expect(this.fushicho.facedown).toBe(false);
            expect(this.tsanuri.facedown).toBe(false);
            expect(this.hero.facedown).toBe(false);

            this.player1.clickCard(this.ujiaki);
            expect(this.player1).toHavePrompt('Choose up to two characters');
            expect(this.player1).toHavePromptButton('Done');
            expect(this.player1).toBeAbleToSelect(this.fushicho);
            this.player1.clickCard(this.fushicho);
            this.player1.clickPrompt('Done');
            expect(this.fushicho.location).toBe('play area');
            expect(this.game.currentConflict.attackers).toContain(this.fushicho);
        });

        it('should reveal and trigger rally before character selection', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.ujiaki],
                defenders: []
            });
            this.player1.player.imperialFavor = 'military';
            this.player2.pass();

            expect(this.season.facedown).toBe(true);
            expect(this.fushicho.facedown).toBe(true);
            expect(this.tsanuri.facedown).toBe(true);
            expect(this.hero.facedown).toBe(true);
            expect(this.toshimoko.location).toBe('dynasty deck');
            expect(this.ujina.location).toBe('dynasty deck');

            this.player1.clickCard(this.ujiaki);
            expect(this.season.facedown).toBe(false);
            expect(this.fushicho.facedown).toBe(false);
            expect(this.tsanuri.facedown).toBe(false);
            expect(this.hero.facedown).toBe(false);
            expect(this.toshimoko.location).toBe('province 1');
            expect(this.ujina.location).toBe('province 2');

            expect(this.player1).toHavePrompt('Choose up to two characters');
        });
    });
});
