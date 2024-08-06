describe('All Out Assault', function() {
    integration(function() {
        describe('Base Case (no dash, no element dependant, no Tadakatsu)', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'draw',
                    player1: {
                        inPlay: ['kakita-yoshi', 'doji-fumiki', 'maker-of-keepsakes'],
                        hand: ['all-out-assault']
                    },
                    player2: {
                        inPlay: ['doji-whisperer', 'doji-challenger']
                    }
                });

                this.yoshi = this.player1.findCardByName('kakita-yoshi');
                this.fumiki = this.player1.findCardByName('doji-fumiki');
                this.keepsakes = this.player1.findCardByName('maker-of-keepsakes');
                this.dojiWhisperer = this.player2.findCardByName('doji-whisperer');
                this.challenger = this.player2.findCardByName('doji-challenger');
                this.assault = this.player1.findCardByName('all-out-assault');

                this.shamefulDisplay1 = this.player1.findCardByName('shameful-display', 'province 1');
                this.shamefulDisplay2 = this.player2.findCardByName('shameful-display', 'province 1');

                this.player1.clickPrompt('1');
                this.player2.clickPrompt('1');
                this.noMoreActions();
            });

            it('should trigger at the start of the conflict phase', function() {
                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.assault);
                this.player1.clickCard(this.assault);
                expect(this.getChatLogs(1)).toContain('player1 plays All Out Assault to force each player to attack with as many characters as they can each conflict!');
            });

            it('should not allow passing conflicts', function() {
                this.player1.clickCard(this.assault);

                this.noMoreActions();
                expect(this.player1).toHavePrompt('Choose province to attack');
                expect(this.player1).toHavePrompt('Military Air Conflict');
                expect(this.player1).not.toHavePromptButton('Pass Conflict');
            });

            it('should force assigning all characters and not let you unassign', function() {
                this.player1.clickCard(this.assault);
                this.noMoreActions();

                expect(this.game.currentConflict.attackers).toContain(this.yoshi);
                expect(this.game.currentConflict.attackers).toContain(this.fumiki);
                expect(this.game.currentConflict.attackers).toContain(this.keepsakes);

                this.player1.clickCard(this.yoshi);
                this.player1.clickCard(this.fumiki);
                this.player1.clickCard(this.keepsakes);

                expect(this.game.currentConflict.attackers).toContain(this.yoshi);
                expect(this.game.currentConflict.attackers).toContain(this.fumiki);
                expect(this.game.currentConflict.attackers).toContain(this.keepsakes);
            });

            it('should let you switch the ring and the conflict type', function() {
                this.player1.clickCard(this.assault);
                this.noMoreActions();
                expect(this.player1).toHavePrompt('Military Air Conflict');
                this.player1.clickRing('air');
                expect(this.player1).toHavePrompt('Political Air Conflict');
                this.player1.clickRing('earth');
                expect(this.player1).toHavePrompt('Political Earth Conflict');
                this.player1.clickRing('earth');
                expect(this.player1).toHavePrompt('Military Earth Conflict');
            });

            it('should not assign bowed characters and should still let you attack', function() {
                this.player1.clickCard(this.assault);
                this.yoshi.bowed = true;
                this.noMoreActions();

                expect(this.game.currentConflict.attackers).not.toContain(this.yoshi);
                expect(this.game.currentConflict.attackers).toContain(this.fumiki);
                expect(this.game.currentConflict.attackers).toContain(this.keepsakes);
            });

            it('should effect both players', function() {
                this.player1.clickCard(this.assault);
                this.noMoreActions();
                this.player1.clickCard(this.shamefulDisplay2);
                this.player1.clickPrompt('Initiate Conflict');
                this.player2.clickPrompt('Done'); //no defenders
                this.noMoreActions();
                this.player1.clickPrompt('No');
                this.player1.clickPrompt('Don\'t Resolve');

                this.noMoreActions();
                expect(this.player2).toHavePrompt('Choose province to attack');
                expect(this.player2).toHavePrompt('Military Earth Conflict');
                expect(this.player2).not.toHavePromptButton('Pass Conflict');
            });
        });

        describe('Dashes and Element Dependent Characters', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'draw',
                    player1: {
                        inPlay: ['bayushi-liar', 'matsu-berserker', 'alibi-artist', 'fire-tensai-acolyte'],
                        hand: ['all-out-assault']
                    },
                    player2: {
                    }
                });

                this.liar = this.player1.findCardByName('bayushi-liar');
                this.alibi = this.player1.findCardByName('alibi-artist');
                this.acolyte = this.player1.findCardByName('fire-tensai-acolyte');
                this.berserker = this.player1.findCardByName('matsu-berserker');
                this.assault = this.player1.findCardByName('all-out-assault');

                this.shamefulDisplay1 = this.player1.findCardByName('shameful-display', 'province 1');
                this.shamefulDisplay2 = this.player2.findCardByName('shameful-display', 'province 1');

                this.player1.clickPrompt('1');
                this.player2.clickPrompt('1');
                this.noMoreActions();
                this.player1.clickCard(this.assault);
            });

            it('should force you to assign the type you have more dashes on - political', function() {
                this.noMoreActions();

                expect(this.player1).toHavePrompt('Political Fire Conflict');
                this.player1.clickRing('fire');
                expect(this.player1).toHavePrompt('Political Fire Conflict');
            });

            it('should force you to pick a legal element', function() {
                this.noMoreActions();
                expect(this.player1).toHavePrompt('Political Fire Conflict');
                this.player1.clickRing('earth');
                expect(this.player1).toHavePrompt('Political Fire Conflict');
            });

            it('should let you switch conflict type with an equal number of dashes', function() {
                this.liar.bowed = true;
                this.noMoreActions();

                expect(this.player1).toHavePrompt('Military Fire Conflict');
                expect(this.game.currentConflict.attackers).not.toContain(this.alibi);
                expect(this.game.currentConflict.attackers).toContain(this.berserker);
                this.player1.clickRing('fire');
                expect(this.player1).toHavePrompt('Political Fire Conflict');
                expect(this.game.currentConflict.attackers).not.toContain(this.berserker);
                expect(this.game.currentConflict.attackers).toContain(this.alibi);
            });

            it('should force you to assign the type you have more dashes on - military', function() {
                this.liar.bowed = true;
                this.alibi.bowed = true;
                this.noMoreActions();

                expect(this.player1).toHavePrompt('Military Fire Conflict');
                this.player1.clickRing('fire');
                expect(this.player1).toHavePrompt('Military Fire Conflict');
            });

            it('should let you pick any element if the forced element is already claimed', function() {
                this.player2.claimRing('fire');
                this.noMoreActions();
                expect(this.game.currentConflict.attackers).not.toContain(this.acolyte);
                expect(this.player1).toHavePrompt('Political Air Conflict');
                this.player1.clickRing('earth');
                expect(this.player1).toHavePrompt('Political Earth Conflict');
            });
        });

        describe('Tadakatsu', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'draw',
                    player1: {
                        inPlay: ['bayushi-liar', 'matsu-berserker', 'alibi-artist', 'fire-tensai-acolyte', 'young-warrior'],
                        hand: ['all-out-assault']
                    },
                    player2: {
                        inPlay: ['togashi-tadakatsu']
                    }
                });

                this.liar = this.player1.findCardByName('bayushi-liar');
                this.alibi = this.player1.findCardByName('alibi-artist');
                this.acolyte = this.player1.findCardByName('fire-tensai-acolyte');
                this.assault = this.player1.findCardByName('all-out-assault');

                this.shamefulDisplay1 = this.player1.findCardByName('shameful-display', 'province 1');
                this.shamefulDisplay2 = this.player2.findCardByName('shameful-display', 'province 1');

                this.player1.clickPrompt('1');
                this.player2.clickPrompt('1');
                this.noMoreActions();
                this.player1.clickCard(this.assault);
            });

            it('Should force you to pick the fire ring for your opponent due to Fire Tensai Acolyte', function() {
                this.noMoreActions();

                expect(this.player2).toHavePrompt('Choose a ring for player1\'s conflict');
                expect(this.player2).not.toBeAbleToSelectRing('air');
                expect(this.player2).not.toBeAbleToSelectRing('earth');
                expect(this.player2).toBeAbleToSelectRing('fire');
                expect(this.player2).not.toBeAbleToSelectRing('void');
                expect(this.player2).not.toBeAbleToSelectRing('water');
            });
        });

        describe('Caravan Guards', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'draw',
                    player1: {
                        fate: 3,
                        inPlay: ['caravan-guard', 'caravan-guard', 'caravan-guard'],
                        hand: ['all-out-assault']
                    },
                    player2: {
                    }
                });

                this.guard1 = this.player1.filterCardsByName('caravan-guard')[0];
                this.guard2 = this.player1.filterCardsByName('caravan-guard')[1];
                this.guard3 = this.player1.filterCardsByName('caravan-guard')[2];
                this.assault = this.player1.findCardByName('all-out-assault');

                this.shamefulDisplay1 = this.player1.findCardByName('shameful-display', 'province 1');
                this.shamefulDisplay2 = this.player2.findCardByName('shameful-display', 'province 1');

                this.player1.clickPrompt('1');
                this.player2.clickPrompt('1');
                this.noMoreActions();
                this.player1.clickCard(this.assault);
            });

            it('should force you to assign as many caravan guards as you have fate', function() {
                this.noMoreActions();

                expect(this.game.currentConflict.attackers).toContain(this.guard1);
                expect(this.game.currentConflict.attackers).toContain(this.guard2);
                expect(this.game.currentConflict.attackers).not.toContain(this.guard3);
            });
        });
    });
});
