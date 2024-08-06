describe('To Show the Path', function () {
    integration(function () {
        describe('it when you do not control a monk or shugenja', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['ikoma-prodigy'],
                        hand: ['to-show-the-path']
                    }
                });

                this.prodigy = this.player1.findCardByName('ikoma-prodigy');

                this.toShowThePath = this.player1.findCardByName('to-show-the-path');
            });

            it('should not trigger', function () {
                this.player1.clickCard(this.toShowThePath);
                expect(this.player1).toHavePrompt('Action Window');
            });
        });

        describe('when there is no non-monk or non-shugenja to target', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['doomed-shugenja'],
                        hand: ['to-show-the-path']
                    }
                });

                this.doomedShugenja = this.player1.findCardByName('doomed-shugenja');

                this.toShowThePath = this.player1.findCardByName('to-show-the-path');
            });

            it('it should not trigger', function () {
                this.player1.clickCard(this.toShowThePath);
                expect(this.player1).toHavePrompt('Action Window');
            });
        });

        describe('when you control a monk or shugenja and there is a valid target', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['doomed-shugenja', 'togashi-mitsu', 'ikoma-prodigy', 'moto-youth'],
                        hand: ['to-show-the-path', 'a-perfect-cut', 'a-new-name', 'duelist-training']
                    },
                    player2: {
                        inPlay: ['togashi-ichi', 'isawa-kaede', 'matsu-berserker'],
                        hand: ['a-perfect-cut', 'let-go', 'let-go']
                    }
                });

                this.doomedShugenja = this.player1.findCardByName('doomed-shugenja');
                this.togashiMitsu = this.player1.findCardByName('togashi-mitsu');
                this.prodigy = this.player1.findCardByName('ikoma-prodigy');
                this.motoYouth = this.player1.findCardByName('moto-youth');

                this.togashiIchi = this.player2.findCardByName('togashi-ichi');
                this.isawaKaede = this.player2.findCardByName('isawa-kaede');
                this.matsuBerserker = this.player2.findCardByName('matsu-berserker');

                this.toShowThePath = this.player1.findCardByName('to-show-the-path');
                this.aPerfectCut1 = this.player1.findCardByName('a-perfect-cut');

                this.aPerfectCut2 = this.player2.findCardByName('a-perfect-cut');

                this.letgo = this.player2.filterCardsByName('let-go')[0];
                this.letgo2 = this.player2.filterCardsByName('let-go')[1];

                this.ann = this.player1.findCardByName('a-new-name');
                this.duelist = this.player1.findCardByName('duelist-training');
            });

            it('it should allow to target a non-monk, non-shugenja owned by either player', function () {
                this.player1.clickCard(this.toShowThePath);
                expect(this.player1).toHavePrompt('Choose a character');

                expect(this.player1).toBeAbleToSelect(this.prodigy);
                expect(this.player1).toBeAbleToSelect(this.motoYouth);
                expect(this.player1).toBeAbleToSelect(this.matsuBerserker);
                expect(this.player1).not.toBeAbleToSelect(this.togashiIchi);
                expect(this.player1).not.toBeAbleToSelect(this.isawaKaede);
                expect(this.player1).not.toBeAbleToSelect(this.togashiMitsu);
                expect(this.player1).not.toBeAbleToSelect(this.doomedShugenja);

                this.player1.clickCard(this.prodigy);
                expect(this.getChatLogs(3)).toContain(
                    'player1 plays To Show the Path to make player2 pay 1 additional fate as a cost whenever they target Ikoma Prodigy or its attachments with a card ability until the end of the phase'
                );
            });

            it('taxes targets on character', function () {
                this.player1.clickCard(this.toShowThePath);
                expect(this.player1).toHavePrompt('Choose a character');

                this.player1.clickCard(this.motoYouth);

                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.prodigy, this.motoYouth],
                    defenders: [],
                    type: 'military'
                });

                const player1InitialFate = this.player1.fate;
                const player2InitialFate = this.player2.fate;

                this.player2.clickCard(this.aPerfectCut2);
                this.player2.clickCard(this.motoYouth);

                this.player1.clickCard(this.aPerfectCut1);
                this.player1.clickCard(this.motoYouth);

                expect(this.player1.fate).toBe(player1InitialFate); // no cost increase for the player of To Show the Path
                expect(this.player2.fate).toBe(player2InitialFate - 1); // cost increase for the opponent
            });

            it('taxes attachments that are on the character when the event is played', function () {
                this.player1.playAttachment(this.duelist, this.motoYouth);
                this.player2.pass();
                this.player1.clickCard(this.toShowThePath);
                this.player1.clickCard(this.motoYouth);
                expect(this.getChatLogs(3)).toContain(
                    'player1 plays To Show the Path to make player2 pay 1 additional fate as a cost whenever they target Moto Youth or its attachments with a card ability until the end of the phase'
                );

                this.player2.pass();
                this.player1.playAttachment(this.ann, this.motoYouth);

                const fate = this.player2.fate;
                this.player2.clickCard(this.letgo);
                this.player2.clickCard(this.duelist);
                expect(this.player2.fate).toBe(fate - 1); // cost increase for the opponent
                expect(this.duelist.location).toBe('conflict discard pile');
            });

            it('taxes attachments played on the character after Show the Path', function () {
                this.player1.playAttachment(this.duelist, this.motoYouth);

                this.player2.pass();
                this.player1.clickCard(this.toShowThePath);
                this.player1.clickCard(this.motoYouth);

                this.player2.pass();
                expect(this.ann.location).toBe('hand');
                this.player1.playAttachment(this.ann, this.motoYouth);
                expect(this.ann.location).toBe('play area');

                const fate = this.player2.fate;
                this.player2.clickCard(this.letgo);
                this.player2.clickCard(this.duelist);
                expect(this.player2.fate).toBe(fate - 1); // cost increase for the opponent
                expect(this.duelist.location).toBe('conflict discard pile');

                this.player1.pass();
                this.player2.clickCard(this.letgo2);
                this.player2.clickCard(this.ann);
                expect(this.player2.fate).toBe(fate - 2); // cost increase for the opponent
                expect(this.ann.location).toBe('conflict discard pile');
            });
        });
    });
});
