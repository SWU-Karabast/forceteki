describe('A Matsu Proves Their Worth', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['matsu-berserker', 'ikoma-prodigy'],
                    hand: ['a-matsu-proves-their-worth']
                },
                player2: {
                    inPlay: ['doji-kuwanan']
                }
            });

            this.berserker = this.player1.findCardByName('matsu-berserker');
            this.prodigy = this.player1.findCardByName('ikoma-prodigy');
            this.comingOfAge = this.player1.findCardByName('a-matsu-proves-their-worth');

            this.kuwanan = this.player2.findCardByName('doji-kuwanan');
            this.shameful = this.player2.findCardByName('shameful-display', 'province 1');

            this.noMoreActions();
        });

        it('discards the bushi on losses', function () {
            this.player1.clickRing('air');
            this.player1.clickCard(this.shameful);
            this.player1.clickCard(this.berserker);
            this.player1.clickPrompt('Initiate Conflict');
            expect(this.player1).toHavePrompt('Any reactions?');

            this.player1.clickCard(this.comingOfAge);

            this.player2.clickCard(this.kuwanan);
            this.player2.clickPrompt('Done');
            this.noMoreActions();

            expect(this.getChatLogs(5)).toContain(
                'Matsu Berserker is discarded from play due to failing at A Matsu Proves Their Worth!'
            );
        });

        it('many gains when the bushi wins', function () {
            const initialHonor = this.player1.honor;
            this.player1.clickRing('water');
            this.player1.clickCard(this.shameful);
            this.player1.clickCard(this.berserker);
            this.player1.clickPrompt('Initiate Conflict');
            expect(this.player1).toHavePrompt('Any reactions?');

            this.player1.clickCard(this.comingOfAge);

            this.player2.clickPrompt('Done');
            this.noMoreActions();

            expect(this.berserker.fate).toBe(1);
            expect(this.berserker.isHonored).toBe(true);
            expect(this.player1.honor).toBe(initialHonor + 1);
            expect(this.player1.hand.length).toBe(1);

            expect(this.getChatLogs(5)).toContain(
                'Matsu Berserker is honored and receives 1 fate, and player1 gains 1 honor and draw 1 card due to Matsu Berserker succeeding at A Matsu Proves Their Worth!'
            );
        });

        it('does nothing if the bushi is not alone ', function () {
            this.player1.clickRing('air');
            this.player1.clickCard(this.shameful);
            this.player1.clickCard(this.prodigy);
            this.player1.clickCard(this.berserker);
            this.player1.clickPrompt('Initiate Conflict');
            expect(this.player1).not.toHavePrompt('Any reactions?');
        });

        it('does nothing for non-bushi', function () {
            this.player1.clickRing('air');
            this.player1.clickCard(this.shameful);
            this.player1.clickCard(this.prodigy);
            this.player1.clickPrompt('Initiate Conflict');
            expect(this.player1).not.toHavePrompt('Any reactions?');
        });
    });
});