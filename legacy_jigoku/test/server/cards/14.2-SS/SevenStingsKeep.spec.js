describe('Seven Stings Keep', function() {
    integration(function() {
        describe('Seven Stings Keep\'s triggering window', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['bayushi-liar'],
                        stronghold: ['seven-stings-keep']
                    },
                    player2: {
                        inPlay: ['kakita-toshimoko']
                    }
                });

                this.liar = this.player1.findCardByName('bayushi-liar');
                this.toshimoko = this.player2.findCardByName('kakita-toshimoko');
                this.keep = this.player1.findCardByName('seven-stings-keep');
            });

            it('should give the option to trigger when your conflict opportunity starts', function() {
                this.noMoreActions();
                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.keep);
            });

            it('should not give the option to trigger when you can\'t attack', function() {
                this.liar.bowed = true;
                this.noMoreActions();
                expect(this.player1).toHavePrompt('Action Window');
                expect(this.getChatLogs(1)).toContain('player1 passes their conflict opportunity as none of their characters can be declared as an attacker');
            });
        });

        describe('Seven Stings Keep\'s choice menu', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['bayushi-liar', 'alibi-artist', 'matsu-berserker', 'young-warrior', 'young-warrior'],
                        stronghold: ['seven-stings-keep']
                    },
                    player2: {
                        inPlay: ['kakita-toshimoko']
                    }
                });

                this.liar = this.player1.findCardByName('bayushi-liar');
                this.artist = this.player1.findCardByName('alibi-artist');
                this.berserker = this.player1.findCardByName('matsu-berserker');
                this.warrior1 = this.player1.filterCardsByName('young-warrior')[0];
                this.warrior2 = this.player1.filterCardsByName('young-warrior')[1];
                this.toshimoko = this.player2.findCardByName('kakita-toshimoko');
                this.keep = this.player1.findCardByName('seven-stings-keep');

                this.liar.bowed = true;
                this.artist.bowed = true;
                this.berserker.bowed = true;
                this.warrior1.bowed = true;
                this.warrior2.bowed = true;
            });

            it('checking maximum - mixed dashes', function() {
                this.liar.bowed = false;
                this.artist.bowed = false;
                this.berserker.bowed = false;

                this.noMoreActions();
                expect(this.player1).toHavePrompt('Triggered Abilities');
                this.player1.clickCard(this.keep);
                expect(this.getChatLogs(1)).toContain('player1 uses Seven Stings Keep, bowing Seven Stings Keep to force player2 to declare defenders before attackers are chosen this conflict');
                expect(this.player1).toHavePrompt('Choose how many characters will be attacking');
                expect(this.player1).not.toHavePromptButton('0');
                expect(this.player1).toHavePromptButton('1');
                expect(this.player1).toHavePromptButton('2');
                expect(this.player1).not.toHavePromptButton('3');
            });

            it('checking minimum - forced attackers', function() {
                this.warrior1.bowed = false;
                this.warrior2.bowed = false;
                this.artist.bowed = false;
                this.liar.bowed = false;

                this.noMoreActions();
                expect(this.player1).toHavePrompt('Triggered Abilities');
                this.player1.clickCard(this.keep);
                expect(this.player1).toHavePrompt('Choose how many characters will be attacking');
                expect(this.player1).not.toHavePromptButton('0');
                expect(this.player1).toHavePromptButton('1');
                expect(this.player1).toHavePromptButton('2');
                expect(this.player1).toHavePromptButton('3');
                expect(this.player1).toHavePromptButton('4');
                expect(this.player1).not.toHavePromptButton('5');
            });

            it('checking messaging', function() {
                this.liar.bowed = false;
                this.artist.bowed = false;
                this.berserker.bowed = false;

                this.noMoreActions();
                expect(this.player1).toHavePrompt('Triggered Abilities');
                this.player1.clickCard(this.keep);
                this.player1.clickPrompt('2');
                expect(this.getChatLogs(1)).toContain('player1 will attack with 2 characters');
            });
        });

        describe('Seven Stings Keep - Conflict Flow', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['bayushi-liar', 'alibi-artist', 'matsu-berserker'],
                        stronghold: ['seven-stings-keep']
                    },
                    player2: {
                        inPlay: ['kakita-toshimoko', 'asahina-takako', 'ashigaru-levy']
                    }
                });

                this.liar = this.player1.findCardByName('bayushi-liar');
                this.artist = this.player1.findCardByName('alibi-artist');
                this.berserker = this.player1.findCardByName('matsu-berserker');
                this.toshimoko = this.player2.findCardByName('kakita-toshimoko');
                this.takako = this.player2.findCardByName('asahina-takako');
                this.levy = this.player2.findCardByName('ashigaru-levy');
                this.keep = this.player1.findCardByName('seven-stings-keep');
                this.shamefulDisplay = this.player2.findCardByName('shameful-display', 'province 1');
            });

            it('should prompt opponent to choose defenders - testing with dashes', function() {
                this.noMoreActions();
                expect(this.player1).toHavePrompt('Triggered Abilities');
                this.player1.clickCard(this.keep);
                this.player1.clickPrompt('1');
                expect(this.player2).toHavePrompt('Choose Defenders');
                expect(this.player2).toHavePrompt('Declaring defenders before attackers');
                this.player2.clickCard(this.takako);
                this.player2.clickCard(this.levy);
                this.player2.clickCard(this.toshimoko);
                expect(this.game.currentConflict.defenders).toContain(this.takako);
                expect(this.game.currentConflict.defenders).toContain(this.levy);
                expect(this.game.currentConflict.defenders).toContain(this.toshimoko);
                expect(this.player2).toHavePromptButton('Done');
            });

            it('should then do normal conflict prompt', function() {
                this.noMoreActions();
                expect(this.player1).toHavePrompt('Triggered Abilities');
                this.player1.clickCard(this.keep);
                this.player1.clickPrompt('1');
                this.player2.clickCard(this.takako);
                this.player2.clickCard(this.levy);
                this.player2.clickCard(this.toshimoko);
                this.player2.clickPrompt('Done');
                expect(this.player1).toHavePrompt('Initiate Conflict');
            });

            it('should not eject dash defenders just by switching the conflict type', function() {
                this.noMoreActions();
                expect(this.player1).toHavePrompt('Triggered Abilities');
                this.player1.clickCard(this.keep);
                this.player1.clickPrompt('1');
                this.player2.clickCard(this.takako);
                this.player2.clickCard(this.levy);
                this.player2.clickCard(this.toshimoko);
                this.player2.clickPrompt('Done');
                expect(this.player1).toHavePrompt('Initiate Conflict');
                this.player1.clickRing('fire');
                expect(this.player1).toHavePrompt('Military Fire Conflict');
                this.player1.clickRing('fire');
                expect(this.player1).toHavePrompt('Political Fire Conflict');
                this.player1.clickRing('fire');
                expect(this.player1).toHavePrompt('Military Fire Conflict');

                expect(this.game.currentConflict.defenders).toContain(this.takako);
                expect(this.game.currentConflict.defenders).toContain(this.levy);
                expect(this.game.currentConflict.defenders).toContain(this.toshimoko);
            });

            it('should not let you pass the conflict', function() {
                this.noMoreActions();
                expect(this.player1).toHavePrompt('Triggered Abilities');
                this.player1.clickCard(this.keep);
                this.player1.clickPrompt('1');
                this.player2.clickCard(this.takako);
                this.player2.clickCard(this.levy);
                this.player2.clickCard(this.toshimoko);
                this.player2.clickPrompt('Done');
                expect(this.player1).toHavePrompt('Initiate Conflict');
                expect(this.player1).not.toHavePromptButton('Pass Conflict');
            });

            it('should only let you initiate the conflict if you select the right number of attackers', function() {
                this.noMoreActions();
                expect(this.player1).toHavePrompt('Triggered Abilities');
                this.player1.clickCard(this.keep);
                this.player1.clickPrompt('1');
                this.player2.clickCard(this.takako);
                this.player2.clickCard(this.levy);
                this.player2.clickCard(this.toshimoko);
                this.player2.clickPrompt('Done');
                expect(this.player1).toHavePrompt('Initiate Conflict');
                this.player1.clickRing('fire');
                this.player1.clickRing('fire');
                expect(this.player1).toHavePrompt('Political Fire Conflict');
                expect(this.player1).toHavePrompt('Choose province to attack');
                this.player1.clickCard(this.shamefulDisplay);
                expect(this.player1).toHavePrompt('Choose attackers');

                this.player1.clickCard(this.artist);
                expect(this.player1).toHavePromptButton('Initiate Conflict');

                this.player1.clickCard(this.liar);
                expect(this.player1).not.toHavePromptButton('Initiate Conflict');
            });

            it('should skip the select defenders stage and start the conflict', function() {
                this.noMoreActions();
                expect(this.player1).toHavePrompt('Triggered Abilities');
                this.player1.clickCard(this.keep);
                this.player1.clickPrompt('1');
                this.player2.clickCard(this.takako);
                this.player2.clickCard(this.levy);
                this.player2.clickCard(this.toshimoko);
                this.player2.clickPrompt('Done');
                expect(this.player1).toHavePrompt('Initiate Conflict');
                this.player1.clickRing('fire');
                this.player1.clickRing('fire');
                expect(this.player1).toHavePrompt('Political Fire Conflict');
                expect(this.player1).toHavePrompt('Choose province to attack');
                this.player1.clickCard(this.shamefulDisplay);
                this.player1.clickCard(this.artist);
                this.player1.clickPrompt('Initiate Conflict');
                expect(this.player2).toHavePrompt('Conflict Action Window');
                expect(this.getChatLogs(10)).toContain('Ashigaru Levy cannot participate in the conflict any more and is sent home bowed');
                expect(this.getChatLogs(10)).toContain('player1 is initiating a political conflict at province 1, contesting Fire Ring');
                expect(this.getChatLogs(10)).toContain('player1 reveals Shameful Display due to Framework effect');
                expect(this.getChatLogs(10)).toContain('player1 has initiated a political conflict with skill 2');
                expect(this.getChatLogs(10)).toContain('player2 has defended with skill 8');

                expect(this.levy.bowed).toBe(true);
                expect(this.game.currentConflict.defenders).not.toContain(this.levy);
            });
        });

        describe('Seven Stings Keep\'s - Young Warrior interaction', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['bayushi-liar', 'alibi-artist', 'matsu-berserker', 'young-warrior', 'young-warrior'],
                        stronghold: ['seven-stings-keep']
                    },
                    player2: {
                        inPlay: ['kakita-toshimoko']
                    }
                });

                this.liar = this.player1.findCardByName('bayushi-liar');
                this.artist = this.player1.findCardByName('alibi-artist');
                this.berserker = this.player1.findCardByName('matsu-berserker');
                this.warrior1 = this.player1.filterCardsByName('young-warrior')[0];
                this.warrior2 = this.player1.filterCardsByName('young-warrior')[1];
                this.toshimoko = this.player2.findCardByName('kakita-toshimoko');
                this.keep = this.player1.findCardByName('seven-stings-keep');
                this.shamefulDisplay = this.player2.findCardByName('shameful-display', 'province 1');
            });

            it('should automatically assign both the young warriors, and allow you to remove one (but not both)', function() {
                this.noMoreActions();
                expect(this.player1).toHavePrompt('Triggered Abilities');
                this.player1.clickCard(this.keep);
                expect(this.player1).toHavePrompt('Choose how many characters will be attacking');
                this.player1.clickPrompt('1');
                this.player2.clickCard(this.toshimoko);
                this.player2.clickPrompt('Done');
                expect(this.player1).toHavePrompt('Military Air Conflict');
                expect(this.game.currentConflict.attackers).toContain(this.warrior1);
                expect(this.game.currentConflict.attackers).toContain(this.warrior2);
                this.player1.clickCard(this.shamefulDisplay);
                expect(this.player1).not.toHavePromptButton('Initiate Conflict');

                this.player1.clickCard(this.warrior1);
                expect(this.game.currentConflict.attackers).not.toContain(this.warrior1);
                expect(this.player1).toHavePromptButton('Initiate Conflict');

                this.player1.clickCard(this.warrior2);
                expect(this.game.currentConflict.attackers).toContain(this.warrior2);
                expect(this.player1).toHavePromptButton('Initiate Conflict');

                this.player1.clickCard(this.berserker);
                expect(this.game.currentConflict.attackers).toContain(this.berserker);
                expect(this.player1).not.toHavePromptButton('Initiate Conflict');

                this.player1.clickCard(this.warrior2);
                expect(this.game.currentConflict.attackers).toContain(this.warrior2);
                expect(this.player1).not.toHavePromptButton('Initiate Conflict');

                this.player1.clickCard(this.berserker);
                expect(this.game.currentConflict.attackers).not.toContain(this.berserker);
                expect(this.player1).toHavePromptButton('Initiate Conflict');

                this.player1.clickCard(this.warrior1);
                expect(this.game.currentConflict.attackers).toContain(this.warrior1);
                expect(this.player1).not.toHavePromptButton('Initiate Conflict');

                this.player1.clickCard(this.warrior2);
                expect(this.game.currentConflict.attackers).not.toContain(this.warrior2);
                expect(this.player1).toHavePromptButton('Initiate Conflict');
            });
        });

        describe('Seven Stings Keep\'s - All out Assault interaction', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'draw',
                    player1: {
                        inPlay: ['bayushi-liar', 'alibi-artist', 'matsu-berserker', 'young-warrior', 'young-warrior'],
                        hand: ['all-out-assault'],
                        stronghold: ['seven-stings-keep']
                    },
                    player2: {
                        inPlay: ['kakita-toshimoko']
                    }
                });

                this.assault = this.player1.findCardByName('all-out-assault');
                this.liar = this.player1.findCardByName('bayushi-liar');
                this.artist = this.player1.findCardByName('alibi-artist');
                this.berserker = this.player1.findCardByName('matsu-berserker');
                this.warrior1 = this.player1.filterCardsByName('young-warrior')[0];
                this.warrior2 = this.player1.filterCardsByName('young-warrior')[1];
                this.toshimoko = this.player2.findCardByName('kakita-toshimoko');
                this.keep = this.player1.findCardByName('seven-stings-keep');
                this.shamefulDisplay = this.player2.findCardByName('shameful-display', 'province 1');

                this.player1.clickPrompt('1');
                this.player2.clickPrompt('1');

                this.noMoreActions();
                this.player1.clickCard(this.assault);
            });

            it('should change the default conflict selection but otherwise should do nothing (copied the same test as above)', function() {
                this.noMoreActions();
                expect(this.player1).toHavePrompt('Triggered Abilities');
                this.player1.clickCard(this.keep);
                expect(this.player1).toHavePrompt('Choose how many characters will be attacking');
                this.player1.clickPrompt('1');
                this.player2.clickCard(this.toshimoko);
                this.player2.clickPrompt('Done');
                expect(this.player1).toHavePrompt('Political Air Conflict');
                expect(this.game.currentConflict.attackers).not.toContain(this.liar);
                expect(this.game.currentConflict.attackers).not.toContain(this.artist);
                this.player1.clickRing('air');
                expect(this.player1).toHavePrompt('Military Air Conflict');
                expect(this.game.currentConflict.attackers).toContain(this.warrior1);
                expect(this.game.currentConflict.attackers).toContain(this.warrior2);
                this.player1.clickCard(this.shamefulDisplay);
                expect(this.player1).not.toHavePromptButton('Initiate Conflict');

                this.player1.clickCard(this.warrior1);
                expect(this.game.currentConflict.attackers).not.toContain(this.warrior1);
                expect(this.player1).toHavePromptButton('Initiate Conflict');

                this.player1.clickCard(this.warrior2);
                expect(this.game.currentConflict.attackers).toContain(this.warrior2);
                expect(this.player1).toHavePromptButton('Initiate Conflict');

                this.player1.clickCard(this.berserker);
                expect(this.game.currentConflict.attackers).toContain(this.berserker);
                expect(this.player1).not.toHavePromptButton('Initiate Conflict');

                this.player1.clickCard(this.warrior2);
                expect(this.game.currentConflict.attackers).toContain(this.warrior2);
                expect(this.player1).not.toHavePromptButton('Initiate Conflict');

                this.player1.clickCard(this.berserker);
                expect(this.game.currentConflict.attackers).not.toContain(this.berserker);
                expect(this.player1).toHavePromptButton('Initiate Conflict');

                this.player1.clickCard(this.warrior1);
                expect(this.game.currentConflict.attackers).toContain(this.warrior1);
                expect(this.player1).not.toHavePromptButton('Initiate Conflict');

                this.player1.clickCard(this.warrior2);
                expect(this.game.currentConflict.attackers).not.toContain(this.warrior2);
                expect(this.player1).toHavePromptButton('Initiate Conflict');
            });
        });

        describe('Seven Stings Keep - Caravan Guards', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        fate: 1,
                        inPlay: ['caravan-guard', 'caravan-guard', 'matsu-berserker'],
                        stronghold: ['seven-stings-keep']
                    },
                    player2: {
                        inPlay: ['kakita-toshimoko', 'asahina-takako', 'ashigaru-levy']
                    }
                });

                this.guard1 = this.player1.filterCardsByName('caravan-guard')[0];
                this.guard2 = this.player1.filterCardsByName('caravan-guard')[1];
                this.berserker = this.player1.findCardByName('matsu-berserker');
                this.toshimoko = this.player2.findCardByName('kakita-toshimoko');
                this.takako = this.player2.findCardByName('asahina-takako');
                this.levy = this.player2.findCardByName('ashigaru-levy');
                this.keep = this.player1.findCardByName('seven-stings-keep');
                this.shamefulDisplay = this.player2.findCardByName('shameful-display', 'province 1');
            });

            it('should not allow you to pick 3', function() {
                this.noMoreActions();
                expect(this.player1).toHavePrompt('Triggered Abilities');
                this.player1.clickCard(this.keep);
                expect(this.player1).toHavePrompt('Choose how many characters will be attacking');
                expect(this.player1).not.toHavePromptButton('0');
                expect(this.player1).toHavePromptButton('1');
                expect(this.player1).toHavePromptButton('2');
                expect(this.player1).not.toHavePromptButton('3');
            });
        });
    });
});
