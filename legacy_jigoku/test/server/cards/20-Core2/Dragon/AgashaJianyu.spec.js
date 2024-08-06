describe('Agasha Jianyu', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['agasha-jianyu', 'miya-mystic'],
                    dynastyDiscard: ['agasha-crucible'],
                    hand: ['cloud-the-mind']
                },
                player2: {
                    inPlay: ['bayushi-manipulator']
                }
            });

            this.doomed = this.player1.findCardByName('agasha-jianyu');
            this.mystic = this.player1.findCardByName('miya-mystic');
            this.cloudTheMind = this.player1.findCardByName('cloud-the-mind');
            this.agashaCrucible = this.player1.placeCardInProvince('agasha-crucible', 'province 1');

            this.bayushiManipulator = this.player2.findCardByName('bayushi-manipulator');

            this.player1.clickCard(this.agashaCrucible);
            this.player1.clickCard(this.doomed);
            this.player1.clickPrompt('Water');

            this.player1.clickCard(this.cloudTheMind);
            this.player1.clickCard(this.bayushiManipulator);

            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.mystic],
                defenders: [this.bayushiManipulator]
            });
            this.player2.pass();
        });

        it('gives skills bonuses to a paticipating character depending on elemental trait count on characters', function () {
            const elementCount = 3;

            this.player1.clickCard(this.doomed);
            expect(this.player1).toHavePrompt('Choose a character');
            expect(this.player1).not.toBeAbleToSelect(this.doomed);
            expect(this.player1).toBeAbleToSelect(this.mystic);
            expect(this.player1).toBeAbleToSelect(this.bayushiManipulator);

            this.player1.clickCard(this.mystic);
            expect(this.mystic.getMilitarySkill()).toBe(1 + 2 * elementCount);
            expect(this.mystic.getPoliticalSkill()).toBe(1 + 1 * elementCount);
            expect(this.getChatLogs(5)).toContain(
                'player1 uses Agasha Jianyu to give Miya Mystic +6military/+3political'
            );
        });
    });
});
