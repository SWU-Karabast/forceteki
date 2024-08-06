describe('To Storm A Fortress', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['borderlands-defender', 'togashi-initiate', 'miya-mystic'],
                    hand: ['to-storm-a-fortress']
                },
                player2: {
                    inPlay: [],
                    dynastyDiscard: ['favorable-ground']
                }
            });
            this.toStormAFortress = this.player1.findCardByName('to-storm-a-fortress');
            this.borderlandsDefender = this.player1.findCardByName('borderlands-defender');
            this.togashiInitiate = this.player1.findCardByName('togashi-initiate');
            this.miyaMystic = this.player1.findCardByName('miya-mystic');

            this.favorableGround = this.player2.placeCardInProvince('favorable-ground', 'province 1');
        });

        it('cannot be used without monks or bushis', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.miyaMystic],
                defenders: []
            });
            this.player2.pass();

            this.player1.clickCard(this.toStormAFortress);
            expect(this.player1).not.toHavePrompt('Choose a character');
            expect(this.player1).not.toBeAbleToSelect(this.borderlandsDefender);
            expect(this.player1).not.toBeAbleToSelect(this.togashiInitiate);
            expect(this.player1).not.toBeAbleToSelect(this.miyaMystic);
        });

        it('gives a skill bonus and discards cards from attacked province', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.borderlandsDefender, this.togashiInitiate, this.miyaMystic],
                defenders: []
            });
            this.player2.pass();

            this.player1.clickCard(this.toStormAFortress);
            expect(this.player1).toHavePrompt('Choose a character');
            expect(this.player1).toBeAbleToSelect(this.borderlandsDefender);
            expect(this.player1).toBeAbleToSelect(this.togashiInitiate);
            expect(this.player1).not.toBeAbleToSelect(this.miyaMystic);

            this.player1.clickCard(this.togashiInitiate);
            expect(this.togashiInitiate.getMilitarySkill()).toBe(3);
            expect(this.getChatLogs(5)).toContain(
                'player1 plays To Storm a Fortress to grant +2military to Togashi Initiate'
            );

            expect(this.player1).toHavePrompt('Discard each card in the attacked province?');
            expect(this.player1).toHavePromptButton('Yes');
            expect(this.player1).toHavePromptButton('No');
            this.player1.clickPrompt('Yes');
            expect(this.favorableGround.location).toBe('dynasty discard pile');
            expect(this.getChatLogs(5)).toContain('player1\'s To Storm a Fortress discards Favorable Ground');
        });

        it('can be used without discarding the holding', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.borderlandsDefender, this.togashiInitiate, this.miyaMystic],
                defenders: []
            });
            this.player2.pass();

            this.player1.clickCard(this.toStormAFortress);
            expect(this.player1).toHavePrompt('Choose a character');
            expect(this.player1).toBeAbleToSelect(this.borderlandsDefender);
            expect(this.player1).toBeAbleToSelect(this.togashiInitiate);
            expect(this.player1).not.toBeAbleToSelect(this.miyaMystic);

            this.player1.clickCard(this.togashiInitiate);
            expect(this.togashiInitiate.getMilitarySkill()).toBe(3);
            expect(this.getChatLogs(5)).toContain(
                'player1 plays To Storm a Fortress to grant +2military to Togashi Initiate'
            );

            expect(this.player1).toHavePrompt('Discard each card in the attacked province?');
            expect(this.player1).toHavePromptButton('Yes');
            expect(this.player1).toHavePromptButton('No');

            this.player1.clickPrompt('No');
            expect(this.favorableGround.location).toBe('province 1');
            expect(this.getChatLogs(5)).not.toContain('player1\'s To Storm a Fortress discards Favorable Ground');
        });
    });
});
