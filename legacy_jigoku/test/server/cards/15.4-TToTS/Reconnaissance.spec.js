describe('Reconnaissance', function() {
    integration(function() {
        describe('Honor condition off', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'draw',
                    player1: {
                        dynastyDiscard: ['kitsu-spiritcaller', 'master-tactician'],
                        hand: ['reconnaissance'],
                        provinces: ['midnight-revels', 'feast-or-famine']
                    },
                    player2: {
                        dynastyDiscard: ['aranat', 'daidoji-uji', 'imperial-storehouse', 'heavy-ballista', 'doji-whisperer', 'doji-challenger'],
                        provinces: ['manicured-garden', 'fertile-fields', 'upholding-authority', 'pilgrimage']
                    }
                });

                this.revels = this.player1.findCardByName('midnight-revels');
                this.feast = this.player1.findCardByName('feast-or-famine');
                this.reconnaissance = this.player1.findCardByName('reconnaissance');

                this.garden = this.player2.findCardByName('manicured-garden');
                this.fields = this.player2.findCardByName('fertile-fields');
                this.authority = this.player2.findCardByName('upholding-authority');
                this.pilgrimage = this.player2.findCardByName('pilgrimage');

                this.pilgrimage.facedown = false;
                this.authority.facedown = false;

                this.spiritcaller = this.player1.moveCard('kitsu-spiritcaller', this.revels.location);
                this.tactician = this.player1.moveCard('master-tactician', this.revels.location);

                this.aranat = this.player2.moveCard('aranat', this.garden.location);
                this.uji = this.player2.moveCard('daidoji-uji', this.garden.location);
                this.storehouse = this.player2.moveCard('imperial-storehouse', this.garden.location);
                this.ballista = this.player2.moveCard('heavy-ballista', this.fields.location);
                this.whisperer = this.player2.moveCard('doji-whisperer', this.authority.location);
                this.challenger = this.player2.moveCard('doji-challenger', this.authority.location);

                this.player1.clickPrompt('1');
                this.player2.clickPrompt('1');
                this.noMoreActions();
            });

            it('should react to the conflict phase beginning', function () {
                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.reconnaissance);
            });

            it('should let you select facedown provinces', function () {
                this.player1.clickCard(this.reconnaissance);
                expect(this.player1).toHavePrompt('Choose up to 3 provinces');
                expect(this.player1).toBeAbleToSelect(this.revels);
                expect(this.player1).toBeAbleToSelect(this.garden);
                expect(this.player1).toBeAbleToSelect(this.fields);
                expect(this.player1).toBeAbleToSelect(this.feast);
                expect(this.player1).not.toBeAbleToSelect(this.authority);
                expect(this.player1).not.toBeAbleToSelect(this.pilgrimage);
            });

            it('should let you choose 3 provinces', function () {
                this.player1.clickCard(this.reconnaissance);
                expect(this.player1).toHavePrompt('Choose up to 3 provinces');
                this.player1.clickCard(this.revels);
                this.player1.clickCard(this.garden);
                this.player1.clickCard(this.fields);
                this.player1.clickCard(this.feast);

                expect(this.player1.player.promptState.selectedCards).toContain(this.revels);
                expect(this.player1.player.promptState.selectedCards).toContain(this.garden);
                expect(this.player1.player.promptState.selectedCards).toContain(this.fields);
                expect(this.player1.player.promptState.selectedCards).not.toContain(this.feast);
            });

            it('should look at the chosen provinces (1 province)', function () {
                this.player1.clickCard(this.reconnaissance);
                this.player1.clickCard(this.garden);
                this.player1.clickPrompt('Done');
                expect(this.getChatLogs(5)).toContain('Reconnaissance sees Manicured Garden in province 1');
            });

            it('should look at the chosen provinces (2 provinces)', function () {
                this.player1.clickCard(this.reconnaissance);
                this.player1.clickCard(this.garden);
                this.player1.clickCard(this.fields);
                this.player1.clickPrompt('Done');
                expect(this.getChatLogs(5)).toContain('Reconnaissance sees Manicured Garden in province 1 and Fertile Fields in province 2');
            });

            it('should look at the chosen provinces (3 provinces)', function () {
                this.player1.clickCard(this.reconnaissance);
                this.player1.clickCard(this.garden);
                this.player1.clickCard(this.fields);
                this.player1.clickCard(this.revels);
                this.player1.clickPrompt('Done');
                expect(this.getChatLogs(5)).toContain('Reconnaissance sees Manicured Garden in province 1, Fertile Fields in province 2, and Midnight Revels in province 1');
            });
        });

        describe('Honor condition on', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'draw',
                    player1: {
                        honor: 20,
                        dynastyDiscard: ['kitsu-spiritcaller', 'master-tactician'],
                        hand: ['reconnaissance'],
                        provinces: ['midnight-revels', 'feast-or-famine']
                    },
                    player2: {
                        honor: 10,
                        dynastyDiscard: ['aranat', 'daidoji-uji', 'imperial-storehouse', 'heavy-ballista', 'doji-whisperer', 'doji-challenger'],
                        provinces: ['manicured-garden', 'fertile-fields', 'upholding-authority', 'pilgrimage']
                    }
                });

                this.revels = this.player1.findCardByName('midnight-revels');
                this.feast = this.player1.findCardByName('feast-or-famine');
                this.reconnaissance = this.player1.findCardByName('reconnaissance');

                this.garden = this.player2.findCardByName('manicured-garden');
                this.fields = this.player2.findCardByName('fertile-fields');
                this.authority = this.player2.findCardByName('upholding-authority');
                this.pilgrimage = this.player2.findCardByName('pilgrimage');

                this.pilgrimage.facedown = false;
                this.authority.facedown = false;

                this.spiritcaller = this.player1.moveCard('kitsu-spiritcaller', this.revels.location);
                this.tactician = this.player1.moveCard('master-tactician', this.revels.location);

                this.aranat = this.player2.moveCard('aranat', this.garden.location);
                this.uji = this.player2.moveCard('daidoji-uji', this.garden.location);
                this.storehouse = this.player2.moveCard('imperial-storehouse', this.garden.location);
                this.ballista = this.player2.moveCard('heavy-ballista', this.fields.location);
                this.whisperer = this.player2.moveCard('doji-whisperer', this.authority.location);
                this.challenger = this.player2.moveCard('doji-challenger', this.authority.location);

                this.player1.clickPrompt('1');
                this.player2.clickPrompt('1');
                this.noMoreActions();
            });

            it('should react to the conflict phase beginning', function () {
                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.reconnaissance);
            });

            it('should let you select facedown or faceup provinces', function () {
                this.player1.clickCard(this.reconnaissance);
                expect(this.player1).toHavePrompt('Choose up to 3 provinces');
                expect(this.player1).toBeAbleToSelect(this.revels);
                expect(this.player1).toBeAbleToSelect(this.garden);
                expect(this.player1).toBeAbleToSelect(this.fields);
                expect(this.player1).toBeAbleToSelect(this.feast);
                expect(this.player1).toBeAbleToSelect(this.authority);
                expect(this.player1).toBeAbleToSelect(this.pilgrimage);
            });

            it('should let you choose 3 provinces', function () {
                this.player1.clickCard(this.reconnaissance);
                expect(this.player1).toHavePrompt('Choose up to 3 provinces');
                this.player1.clickCard(this.revels);
                this.player1.clickCard(this.garden);
                this.player1.clickCard(this.fields);
                this.player1.clickCard(this.feast);

                expect(this.player1.player.promptState.selectedCards).toContain(this.revels);
                expect(this.player1.player.promptState.selectedCards).toContain(this.garden);
                expect(this.player1.player.promptState.selectedCards).toContain(this.fields);
                expect(this.player1.player.promptState.selectedCards).not.toContain(this.feast);
            });

            it('should look at the chosen provinces (3 provinces)', function () {
                this.player1.clickCard(this.reconnaissance);
                this.player1.clickCard(this.garden);
                this.player1.clickCard(this.fields);
                this.player1.clickCard(this.pilgrimage);
                this.player1.clickPrompt('Done');
                expect(this.getChatLogs(5)).toContain('Reconnaissance sees Manicured Garden in province 1, Fertile Fields in province 2, and Pilgrimage in province 4');
            });

            it('should let ou choose cards to discard in the selected provinces', function () {
                this.player1.clickCard(this.reconnaissance);
                this.player1.clickCard(this.garden);
                this.player1.clickCard(this.fields);
                this.player1.clickCard(this.revels);
                this.player1.clickPrompt('Done');
                expect(this.player1).toHavePrompt('Choose cards to discard');
                expect(this.player1).toHavePromptButton('Done');

                expect(this.player1).toBeAbleToSelect(this.spiritcaller);
                expect(this.player1).toBeAbleToSelect(this.tactician);
                expect(this.player1).toBeAbleToSelect(this.aranat);
                expect(this.player1).toBeAbleToSelect(this.uji);
                expect(this.player1).toBeAbleToSelect(this.storehouse);
                expect(this.player1).toBeAbleToSelect(this.ballista);
                expect(this.player1).not.toBeAbleToSelect(this.whisperer);
                expect(this.player1).not.toBeAbleToSelect(this.challenger);
            });
        });
    });
});
