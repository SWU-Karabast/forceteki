describe('Asako Kousuke', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: [
                        'asako-kousuke',
                        'adept-of-the-waves',
                        'solemn-scholar',
                        'keeper-initiate',
                        'seeker-initiate'
                    ]
                },
                player2: {
                    inPlay: ['bayushi-manipulator', 'bayushi-kachiko']
                }
            });
            this.kousukeHonored = this.player1.findCardByName('asako-kousuke');
            this.adeptHonored = this.player1.findCardByName('adept-of-the-waves');
            this.solemnDishonored = this.player1.findCardByName('solemn-scholar');
            this.keeperTainted = this.player1.findCardByName('keeper-initiate');
            this.seekerOrdinary = this.player1.findCardByName('seeker-initiate');

            this.manipulatorDishonored = this.player2.findCardByName('bayushi-manipulator');
            this.bayushiKachiko = this.player2.findCardByName('bayushi-kachiko');
            this.bayushiKachiko.honor();

            this.kousukeHonored.honor();
            this.adeptHonored.honor();
            this.solemnDishonored.dishonor();
            this.keeperTainted.taint();
            this.manipulatorDishonored.dishonor();

            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.adeptHonored, this.solemnDishonored, this.keeperTainted, this.seekerOrdinary],
                defenders: [this.manipulatorDishonored, this.bayushiKachiko]
            });
            this.player2.pass();
        });

        it('chooses participating characters with stats and lower glory', function () {
            this.player1.clickCard(this.kousukeHonored);
            expect(this.player1).toHavePrompt('Choose a character');
            expect(this.player1).not.toBeAbleToSelect(this.kousukeHonored);
            expect(this.player1).not.toBeAbleToSelect(this.seekerOrdinary);
            expect(this.player1).not.toBeAbleToSelect(this.bayushiKachiko);
            expect(this.player1).toBeAbleToSelect(this.adeptHonored);
            expect(this.player1).toBeAbleToSelect(this.solemnDishonored);
            expect(this.player1).toBeAbleToSelect(this.keeperTainted);
            expect(this.player1).toBeAbleToSelect(this.manipulatorDishonored);
        });

        it('can honor or taint the dishonorable', function () {
            this.player1.clickCard(this.kousukeHonored);
            this.player1.clickCard(this.solemnDishonored);
            expect(this.player1).toHavePrompt('Select one');
            expect(this.player1).toHavePromptButton('Turn it into Honored');
            expect(this.player1).not.toHavePromptButton('Turn it into Dishonored');
            expect(this.player1).toHavePromptButton('Turn it into Tainted');
        });

        it('can honor or dishonor the tainted', function () {
            this.player1.clickCard(this.kousukeHonored);
            this.player1.clickCard(this.keeperTainted);
            expect(this.player1).toHavePrompt('Select one');
            expect(this.player1).toHavePromptButton('Turn it into Honored');
            expect(this.player1).toHavePromptButton('Turn it into Dishonored');
            expect(this.player1).not.toHavePromptButton('Turn it into Tainted');
        });

        it('can dishonor or taint the honorable', function () {
            this.player1.clickCard(this.kousukeHonored);
            this.player1.clickCard(this.adeptHonored);
            expect(this.player1).toHavePrompt('Select one');
            expect(this.player1).not.toHavePromptButton('Turn it into Honored');
            expect(this.player1).toHavePromptButton('Turn it into Dishonored');
            expect(this.player1).toHavePromptButton('Turn it into Tainted');
        });

        it('changes status to honorable', function () {
            this.player1.clickCard(this.kousukeHonored);
            this.player1.clickCard(this.solemnDishonored);
            this.player1.clickPrompt('Turn it into Honored');
            expect(this.solemnDishonored.isDishonored).toBe(false);
            expect(this.solemnDishonored.isHonored).toBe(true);
            expect(this.getChatLogs(5)).toContain(
                'player1 uses Asako Kousuke to clarify what it means to be honored. The exposition reveals that Solemn Scholar is honored'
            );
        });

        it('changes status to dishonorable', function () {
            this.player1.clickCard(this.kousukeHonored);
            this.player1.clickCard(this.adeptHonored);
            this.player1.clickPrompt('Turn it into Dishonored');
            expect(this.adeptHonored.isHonored).toBe(false);
            expect(this.adeptHonored.isDishonored).toBe(true);
            expect(this.getChatLogs(5)).toContain(
                'player1 uses Asako Kousuke to clarify what it means to be dishonored. The exposition reveals that Adept of the Waves is dishonored'
            );
        });

        it('changes status to tainted', function () {
            this.player1.clickCard(this.kousukeHonored);
            this.player1.clickCard(this.adeptHonored);
            this.player1.clickPrompt('Turn it into Tainted');
            expect(this.adeptHonored.isHonored).toBe(false);
            expect(this.adeptHonored.isTainted).toBe(true);
            expect(this.getChatLogs(5)).toContain(
                'player1 uses Asako Kousuke to clarify what it means to be tainted. The exposition reveals that Adept of the Waves is tainted'
            );
        });

        it('status is not restored after the conflict', function () {
            this.player1.clickCard(this.kousukeHonored);
            this.player1.clickCard(this.adeptHonored);
            this.player1.clickPrompt('Turn it into Tainted');
            expect(this.adeptHonored.isHonored).toBe(false);
            expect(this.adeptHonored.isTainted).toBe(true);
            expect(this.getChatLogs(5)).toContain(
                'player1 uses Asako Kousuke to clarify what it means to be tainted. The exposition reveals that Adept of the Waves is tainted'
            );

            this.noMoreActions();
            this.player1.clickPrompt('Gain 2 honor');
            expect(this.adeptHonored.isHonored).toBe(false);
            expect(this.adeptHonored.isTainted).toBe(true);
        });
    });
});