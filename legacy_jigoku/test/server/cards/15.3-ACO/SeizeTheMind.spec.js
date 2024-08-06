describe('Seize The Mind', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    honor: 10,
                    inPlay: ['miya-mystic', 'bayushi-manipulator'],
                    hand: ['shadow-steed', 'seize-the-mind'],
                    dynastyDiscard: ['daidoji-kageyu']
                },
                player2: {
                    inPlay: ['alibi-artist', 'miya-mystic', 'kakita-toshimoko', 'honored-general', 'khanbulak-benefactor'],
                    hand: ['finger-of-jade', 'tactical-ingenuity']
                }
            });
            this.miyaMystic = this.player1.findCardByName('miya-mystic');
            this.manipulator = this.player1.findCardByName('bayushi-manipulator');
            this.steed = this.player1.findCardByName('shadow-steed');
            this.seize = this.player1.findCardByName('seize-the-mind');
            this.alibi = this.player2.findCardByName('alibi-artist');
            this.general = this.player2.findCardByName('honored-general');
            this.toshimoko = this.player2.findCardByName('kakita-toshimoko');
            this.jade = this.player2.findCardByName('finger-of-jade');
            this.tactical = this.player2.findCardByName('tactical-ingenuity');
            this.mystic2 = this.player2.findCardByName('miya-mystic');
            this.khanbulak = this.player2.findCardByName('khanbulak-benefactor');

            this.miyaMystic.fate = 0;
            this.manipulator.fate = 4;
            this.alibi.fate = 4;

            this.kageyu = this.player1.placeCardInProvince('daidoji-kageyu', 'province 1');
            this.kageyu.facedown = false;

            this.player1.pass();
            this.player2.playAttachment(this.tactical, this.general);
            this.player1.pass();
            this.player2.playAttachment(this.jade, this.alibi);
        });

        it('should not be playable outside of a conflict', function() {
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.seize);
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should allow choosing a non unique character', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.manipulator],
                defenders: [this.general]
            });
            this.player2.pass();
            this.player1.clickCard(this.seize);
            expect(this.player1).toBeAbleToSelect(this.general);
            expect(this.player1).toBeAbleToSelect(this.alibi);
            expect(this.player1).toBeAbleToSelect(this.mystic2);
            expect(this.player1).not.toBeAbleToSelect(this.toshimoko);
            expect(this.player1).not.toBeAbleToSelect(this.miyaMystic);
            expect(this.player1).not.toBeAbleToSelect(this.manipulator);
        });

        it('should take control of the character', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.manipulator],
                defenders: [this.general]
            });

            expect(this.game.currentConflict.attackers).not.toContain(this.general);
            expect(this.game.currentConflict.defenders).toContain(this.general);

            this.player2.pass();
            this.player1.clickCard(this.seize);
            this.player1.clickCard(this.general);
            this.player1.clickCard(this.manipulator);
            this.player1.clickPrompt('3');

            expect(this.game.currentConflict.attackers).toContain(this.general);
            expect(this.game.currentConflict.defenders).not.toContain(this.general);

            expect(this.getChatLogs(5)).toContain('player1 plays Seize the Mind to take control of Honored General');
        });

        it('should gain control of the characters gained abilities', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.manipulator],
                defenders: [this.general]
            });

            this.player2.pass();
            this.player1.clickCard(this.seize);
            this.player1.clickCard(this.general);
            this.player1.clickCard(this.manipulator);
            this.player1.clickPrompt('3');

            this.player2.pass();
            this.player1.clickCard(this.general);
            expect(this.player1).toHavePrompt('Select a card to reveal');
        });

        it('should lose honor equal to the fate on the character', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.manipulator],
                defenders: [this.general]
            });

            let honor = this.player1.honor;

            this.player2.pass();
            this.player1.clickCard(this.seize);
            this.player1.clickCard(this.alibi);
            this.player1.clickCard(this.manipulator);
            this.player1.clickPrompt('3');

            this.player2.pass();

            expect(this.player1.honor).toBe(honor - this.alibi.fate);
            expect(this.getChatLogs(5)).toContain('player1 plays Seize the Mind to take control of Alibi Artist and lose 4 honor');
        });

        it('should not take control of attachments', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.manipulator],
                defenders: [this.general]
            });

            this.player2.pass();
            this.player1.clickCard(this.seize);
            this.player1.clickCard(this.alibi);
            this.player1.clickCard(this.manipulator);
            this.player1.clickPrompt('3');

            this.player2.pass();
            expect(this.jade.location).toBe('conflict discard pile');
            expect(this.getChatLogs(5)).toContain('Finger of Jade is discarded from Alibi Artist as it is no longer legally attached');
        });

        it('should be able to trigger abilities of stolen characters', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.manipulator],
                defenders: [this.general]
            });

            this.player2.pass();
            this.player1.clickCard(this.seize);
            this.player1.clickCard(this.alibi);
            this.player1.clickCard(this.manipulator);
            this.player1.clickPrompt('3');
            this.player2.pass();

            this.player2.pass();
            this.player1.clickCard(this.alibi);
            expect(this.player1).toHavePrompt('Alibi Artist');
        });

        it('should be able to disguise over stolen characters', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.manipulator],
                defenders: [this.general]
            });

            this.player2.pass();
            this.player1.clickCard(this.seize);
            this.player1.clickCard(this.alibi);
            this.player1.clickCard(this.manipulator);
            this.player1.clickPrompt('3');
            this.player2.pass();

            this.player2.pass();
            this.player1.clickCard(this.kageyu);
            this.player1.clickCard(this.alibi);
            expect(this.kageyu.location).toBe('play area');
            expect(this.alibi.location).toBe('dynasty discard pile');
        });

        it('should be able to use stolen character fate to pay for maho', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.manipulator],
                defenders: [this.general]
            });

            this.player2.pass();
            this.player1.clickCard(this.seize);
            this.player1.clickCard(this.alibi);
            this.player1.clickCard(this.manipulator);
            this.player1.clickPrompt('3');
            this.player2.pass();

            this.player2.pass();
            this.player1.clickCard(this.steed);
            this.player1.clickCard(this.manipulator);
            this.player1.clickCard(this.alibi);
            this.player1.clickPrompt('1');
            expect(this.steed.location).toBe('play area');
        });

        it('bug report - khanbulak', function() {
            this.noMoreActions();
            this.player1.passConflict();
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.khanbulak],
                defenders: []
            });

            this.player1.clickCard(this.seize);
            this.player1.clickCard(this.khanbulak);
            this.player1.clickCard(this.manipulator);
            this.player1.clickPrompt('3');

            expect(this.game.currentConflict.attackers).not.toContain(this.khanbulak);
            expect(this.game.currentConflict.defenders).toContain(this.khanbulak);
            expect(this.khanbulak.controller).toBe(this.player1.player);
            this.player2.pass();
            this.player1.clickCard(this.steed);
            this.player1.clickCard(this.manipulator);
            expect(this.steed.location).toBe('play area');
            this.noMoreActions();
            expect(this.khanbulak.controller).toBe(this.player2.player);
        });
    });
});
