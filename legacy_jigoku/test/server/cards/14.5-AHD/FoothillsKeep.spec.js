describe('Foothills Keep', function() {
    integration(function() {
        describe('Basic Functionality', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        provinces: ['fertile-fields', 'pilgrimage'],
                        inPlay: ['caravan-guard', 'dazzling-duelist']
                    },
                    player2: {
                        provinces: ['midnight-revels', 'manicured-garden', 'foothills-keep', 'meditations-on-the-tao'],
                        inPlay: ['brash-samurai']
                    }
                });

                this.revels = this.player2.findCardByName('midnight-revels');
                this.manicured = this.player2.findCardByName('manicured-garden');
                this.foothills = this.player2.findCardByName('foothills-keep');
                this.meditations = this.player2.findCardByName('meditations-on-the-tao');

                this.fertileFields = this.player1.findCardByName('fertile-fields');
                this.pilgrimage = this.player1.findCardByName('pilgrimage');

                this.guard = this.player1.findCardByName('caravan-guard');
                this.dazzling = this.player1.findCardByName('dazzling-duelist');
                this.brash = this.player2.findCardByName('brash-samurai');

                this.foothills.facedown = false;
            });

            it('should not let your opponent attack another province if they have no fate', function() {
                this.player1.fate = 0;
                this.noMoreActions();

                this.player1.clickCard(this.dazzling);
                this.player1.clickRing('air');
                expect(this.player1).toHavePrompt('Choose Province to attack');
                expect(this.player1).not.toHavePromptButton('Initiate Conflict');
                this.player1.clickCard(this.revels);
                expect(this.player1).toHavePrompt('Choose Province to attack');
                expect(this.player1).not.toHavePromptButton('Initiate Conflict');
                this.player1.clickCard(this.revels);
                this.player1.clickCard(this.manicured);
                expect(this.player1).toHavePrompt('Choose Province to attack');
                expect(this.player1).not.toHavePromptButton('Initiate Conflict');
                this.player1.clickCard(this.manicured);
                this.player1.clickCard(this.meditations);
                expect(this.player1).toHavePrompt('Choose Province to attack');
                expect(this.player1).not.toHavePromptButton('Initiate Conflict');
                this.player1.clickCard(this.meditations);
                this.player1.clickCard(this.foothills);
                expect(this.player1).not.toHavePrompt('Choose province to attack');
                expect(this.player1).toHavePromptButton('Initiate Conflict');
            });

            it('should let your opponent attack another province if they have fate', function() {
                this.player1.fate = 1;
                this.noMoreActions();

                this.player1.clickCard(this.dazzling);
                this.player1.clickRing('air');
                expect(this.player1).toHavePrompt('Choose Province to attack');
                expect(this.player1).not.toHavePromptButton('Initiate Conflict');
                this.player1.clickCard(this.revels);
                expect(this.player1).toHavePromptButton('Initiate Conflict');
                this.player1.clickCard(this.revels);
                this.player1.clickCard(this.manicured);
                expect(this.player1).toHavePromptButton('Initiate Conflict');
                this.player1.clickCard(this.manicured);
                this.player1.clickCard(this.meditations);
                expect(this.player1).toHavePromptButton('Initiate Conflict');
                this.player1.clickCard(this.meditations);
                this.player1.clickCard(this.foothills);
                expect(this.player1).toHavePromptButton('Initiate Conflict');
            });

            it('should not let your opponent attack another province if they have fate, but need to pay it to attack', function() {
                this.player1.fate = 1;
                this.noMoreActions();

                this.player1.clickCard(this.guard);
                this.player1.clickRing('air');
                expect(this.player1).toHavePrompt('Choose Province to attack');
                expect(this.player1).not.toHavePromptButton('Initiate Conflict');
                this.player1.clickCard(this.revels);
                expect(this.player1).toHavePrompt('Choose Province to attack');
                expect(this.player1).not.toHavePromptButton('Initiate Conflict');
                this.player1.clickCard(this.revels);
                this.player1.clickCard(this.manicured);
                expect(this.player1).toHavePrompt('Choose Province to attack');
                expect(this.player1).not.toHavePromptButton('Initiate Conflict');
                this.player1.clickCard(this.manicured);
                this.player1.clickCard(this.meditations);
                expect(this.player1).toHavePrompt('Choose Province to attack');
                expect(this.player1).not.toHavePromptButton('Initiate Conflict');
                this.player1.clickCard(this.meditations);
                this.player1.clickCard(this.foothills);
                expect(this.player1).not.toHavePrompt('Choose province to attack');
                expect(this.player1).toHavePromptButton('Initiate Conflict');
            });

            it('should not let your opponent attack with a Caravan Guard if they choose another province', function() {
                this.player1.fate = 1;
                this.noMoreActions();

                this.player1.clickCard(this.dazzling);
                this.player1.clickRing('air');
                this.player1.clickCard(this.revels);
                expect(this.player1).toHavePromptButton('Initiate Conflict');

                this.player1.clickCard(this.guard);
                expect(this.game.currentConflict.attackers).not.toContain(this.guard);
            });

            it('should deduct the fate to declare the attack', function() {
                this.player1.fate = 1;
                this.noMoreActions();

                this.player1.clickCard(this.dazzling);
                this.player1.clickRing('air');
                this.player1.clickCard(this.manicured);
                expect(this.player1).toHavePromptButton('Initiate Conflict');
                this.player1.clickPrompt('Initiate Conflict');
                expect(this.player1).toHavePrompt('Select a ring to place fate on');
                expect(this.player1).not.toBeAbleToSelectRing('air');
                expect(this.player1).toBeAbleToSelectRing('earth');
                expect(this.player1).toBeAbleToSelectRing('fire');
                expect(this.player1).toBeAbleToSelectRing('void');
                expect(this.player1).toBeAbleToSelectRing('water');
                this.player1.clickRing('fire');
                expect(this.player1.fate).toBe(0);
                expect(this.game.rings.fire.fate).toBe(1);
                expect(this.getChatLogs(10)).toContain('player1 places 1 fate on the Fire Ring');
            });
        });

        describe('Interactions with All out Assault', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'draw',
                    player1: {
                        provinces: ['fertile-fields', 'pilgrimage'],
                        inPlay: ['caravan-guard', 'alibi-artist'],
                        hand: ['all-out-assault']
                    },
                    player2: {
                        provinces: ['midnight-revels', 'manicured-garden', 'foothills-keep', 'meditations-on-the-tao'],
                        inPlay: ['brash-samurai'],
                        dynastyDiscard: ['hito-district']
                    }
                });

                this.revels = this.player2.findCardByName('midnight-revels');
                this.manicured = this.player2.findCardByName('manicured-garden');
                this.foothills = this.player2.findCardByName('foothills-keep');
                this.meditations = this.player2.findCardByName('meditations-on-the-tao');

                this.fertileFields = this.player1.findCardByName('fertile-fields');
                this.pilgrimage = this.player1.findCardByName('pilgrimage');

                this.guard = this.player1.findCardByName('caravan-guard');
                this.alibi = this.player1.findCardByName('alibi-artist');
                this.assault = this.player1.findCardByName('all-out-assault');
                this.brash = this.player2.findCardByName('brash-samurai');
                this.hito = this.player2.moveCard('hito-district', this.foothills.location);

                this.foothills.facedown = false;
                this.player1.clickPrompt('1');
                this.player2.clickPrompt('1');
                this.noMoreActions();
                this.player1.clickCard(this.assault);
            });

            it('a lot of fate, should force you to spend it', function() {
                this.player1.fate = 10;
                this.noMoreActions();

                expect(this.player1).toHavePrompt('Political Air Conflict');
                expect(this.player1).toHavePrompt('Choose Province to attack');

                this.player1.clickCard(this.guard);
                expect(this.game.currentConflict.attackers).toContain(this.guard);
                this.player1.clickRing('air');
                expect(this.player1).toHavePrompt('Political Air Conflict');
                this.player1.clickCard(this.foothills);
                expect(this.player1).toHavePrompt('Choose Province to attack');
                expect(this.player1).not.toHavePromptButton('Initiate Conflict');

                this.player1.clickCard(this.revels);
                expect(this.player1).not.toHavePrompt('Choose province to attack');
                expect(this.player1).toHavePromptButton('Initiate Conflict');
            });

            it('1 fate, should let you either attack mil at Foothills or Pol at something else', function() {
                this.player1.fate = 1;
                this.noMoreActions();

                expect(this.player1).toHavePrompt('Military Air Conflict');
                expect(this.player1).toHavePrompt('Choose Province to attack');

                this.player1.clickCard(this.guard);
                expect(this.game.currentConflict.attackers).toContain(this.guard);
                expect(this.game.currentConflict.attackers).not.toContain(this.alibi);

                this.player1.clickCard(this.revels);
                expect(this.player1).toHavePrompt('Choose province to attack');
                expect(this.player1).not.toHavePromptButton('Initiate Conflict');
                this.player1.clickCard(this.foothills);
                expect(this.player1).not.toHavePrompt('Choose Province to attack');
                expect(this.player1).toHavePromptButton('Initiate Conflict');
                this.player1.clickCard(this.foothills);
                expect(this.player1).toHavePrompt('Choose province to attack');

                this.player1.clickRing('air');
                expect(this.player1).toHavePrompt('Political Air Conflict');
                expect(this.game.currentConflict.attackers).toContain(this.alibi);
                expect(this.game.currentConflict.attackers).not.toContain(this.guard);
                this.player1.clickCard(this.foothills);
                expect(this.player1).toHavePrompt('Choose Province to attack');
                expect(this.player1).not.toHavePromptButton('Initiate Conflict');

                this.player1.clickCard(this.revels);
                expect(this.player1).not.toHavePrompt('Choose province to attack');
                expect(this.player1).toHavePromptButton('Initiate Conflict');
            });
        });

        describe('Interactions with Seven Stings Keep', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        stronghold: ['seven-stings-keep'],
                        provinces: ['fertile-fields', 'pilgrimage'],
                        inPlay: ['caravan-guard', 'alibi-artist']
                    },
                    player2: {
                        provinces: ['midnight-revels', 'manicured-garden', 'foothills-keep', 'meditations-on-the-tao'],
                        inPlay: ['brash-samurai'],
                        dynastyDiscard: ['hito-district']
                    }
                });

                this.revels = this.player2.findCardByName('midnight-revels');
                this.manicured = this.player2.findCardByName('manicured-garden');
                this.foothills = this.player2.findCardByName('foothills-keep');
                this.meditations = this.player2.findCardByName('meditations-on-the-tao');

                this.stings = this.player1.findCardByName('seven-stings-keep');
                this.fertileFields = this.player1.findCardByName('fertile-fields');
                this.pilgrimage = this.player1.findCardByName('pilgrimage');

                this.guard = this.player1.findCardByName('caravan-guard');
                this.alibi = this.player1.findCardByName('alibi-artist');
                this.brash = this.player2.findCardByName('brash-samurai');
                this.hito = this.player2.moveCard('hito-district', this.foothills.location);

                this.foothills.facedown = false;
            });

            it('1 fate, should only let you choose 1', function() {
                this.player1.fate = 1;
                this.noMoreActions();

                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.stings);
                this.player1.clickCard(this.stings);
                expect(this.getChatLogs(3)).toContain('player1 will attack with 1 character');
            });
        });
    });
});
