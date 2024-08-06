describe('Liaison to the Ancestors', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['liaison-to-the-ancestors', 'akodo-toturi'],
                    hand: ['resourcefulness'],
                    dynastyDiscard: ['matsu-berserker', 'ikoma-prodigy']
                },
                player2: {
                    inPlay: ['bayushi-dairu'],
                    hand: ['way-of-the-scorpion']
                }
            });

            this.liaisonToTheAncestors = this.player1.findCardByName('liaison-to-the-ancestors');
            this.toturi = this.player1.findCardByName('akodo-toturi');
            this.matsuBerserker = this.player1.findCardByName('matsu-berserker');
            this.ikomaProdigy = this.player1.findCardByName('ikoma-prodigy');
            this.resourcefulness = this.player1.findCardByName('resourcefulness');

            this.scorp = this.player2.findCardByName('way-of-the-scorpion');
            this.dairu = this.player2.findCardByName('bayushi-dairu');
        });

        it('should cancel trying to dishonor an honored character', function () {
            this.toturi.honor();

            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.toturi],
                defenders: []
            });

            this.player2.clickCard(this.scorp);
            this.player2.clickCard(this.toturi);
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.liaisonToTheAncestors);

            this.player1.clickCard(this.liaisonToTheAncestors);
            expect(this.player1).toHavePrompt('Choose a character from your discard pile');
            expect(this.player1).toBeAbleToSelect(this.matsuBerserker);
            expect(this.player1).not.toBeAbleToSelect(this.ikomaProdigy);

            this.player1.clickCard(this.matsuBerserker);

            expect(this.toturi.isDishonored).toBe(false);
            expect(this.scorp.location).toBe('conflict discard pile');
            expect(this.matsuBerserker.location).toBe('dynasty deck');
            expect(this.getChatLogs(5)).toContain(
                "player1 uses Liaison to the Ancestors to protect Akodo Toturi's honor, returning their ancestor Matsu Berserker back to their deck"
            );
        });

        it('should cancel trying to dishonor a character', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.toturi],
                defenders: []
            });

            this.player2.clickCard(this.scorp);
            this.player2.clickCard(this.toturi);
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.liaisonToTheAncestors);

            this.player1.clickCard(this.liaisonToTheAncestors);
            expect(this.player1).toHavePrompt('Choose a character from your discard pile');
            expect(this.player1).toBeAbleToSelect(this.matsuBerserker);
            expect(this.player1).not.toBeAbleToSelect(this.ikomaProdigy);

            this.player1.clickCard(this.matsuBerserker);

            expect(this.toturi.isDishonored).toBe(false);
            expect(this.scorp.location).toBe('conflict discard pile');
            expect(this.matsuBerserker.location).toBe('dynasty deck');
            expect(this.getChatLogs(5)).toContain(
                "player1 uses Liaison to the Ancestors to protect Akodo Toturi's honor, returning their ancestor Matsu Berserker back to their deck"
            );
        });

        it('should cancel dishonoring via fire ring', function () {
            this.noMoreActions();
            this.player1.passConflict();
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.dairu],
                defenders: [],
                ring: 'fire'
            });

            this.noMoreActions();

            this.player2.clickCard(this.toturi);
            this.player2.clickPrompt('Dishonor Akodo Toturi');
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.liaisonToTheAncestors);

            this.player1.clickCard(this.liaisonToTheAncestors);
            this.player1.clickCard(this.matsuBerserker);
            expect(this.toturi.isDishonored).toBe(false);
            expect(this.matsuBerserker.location).toBe('dynasty deck');
            expect(this.getChatLogs(5)).toContain(
                "player1 uses Liaison to the Ancestors to protect Akodo Toturi's honor, returning their ancestor Matsu Berserker back to their deck"
            );
        });

        it('should substitute dishonoring as cost', function () {
            this.player1.clickCard(this.resourcefulness);
            this.player1.clickCard(this.liaisonToTheAncestors);
            this.player1.clickCard(this.toturi);

            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.liaisonToTheAncestors);
        });
    });
});