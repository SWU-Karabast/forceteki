describe('Marvelous Beings', function () {
    integration(function () {
        describe('action ability', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: [
                            'wild-stallion',
                            'guardian-kami',
                            'akodo-toturi',
                            'ikoma-prodigy',
                            'ivory-kingdoms-unicorn',
                            'aranat'
                        ],
                        hand: ['marvelous-beings']
                    }
                });

                this.wildStallion = this.player1.findCardByName('wild-stallion');
                this.guardianKami = this.player1.findCardByName('guardian-kami');
                this.toturi = this.player1.findCardByName('akodo-toturi');
                this.prodigy = this.player1.findCardByName('ikoma-prodigy');
                this.ivoryKingomsUnicorn = this.player1.findCardByName('ivory-kingdoms-unicorn');
                this.aranat = this.player1.findCardByName('aranat');

                this.marvelousBeings = this.player1.findCardByName('marvelous-beings');
            });

            it('should not trigger outside a conflict', function () {
                this.player1.clickCard(this.marvelousBeings);
                expect(this.player1).toHavePrompt('Action Window');
            });

            it('should not trigger in a military a conflict', function () {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.prodigy],
                    defenders: [],
                    ring: 'air',
                    type: 'military'
                });
                this.player2.pass();
                this.player1.clickCard(this.marvelousBeings);
                expect(this.player1).toHavePrompt('Conflict Action Window');
            });

            it('should trigger in a political conflict and allow to target creature and spirit traits', function () {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.prodigy],
                    defenders: [],
                    ring: 'air',
                    type: 'political'
                });
                this.player2.pass();
                this.player1.clickCard(this.marvelousBeings);
                expect(this.player1).toHavePrompt('Select card to move to the conflict');
                expect(this.player1).toBeAbleToSelect(this.wildStallion);
                expect(this.player1).toBeAbleToSelect(this.guardianKami);
                expect(this.player1).not.toBeAbleToSelect(this.ivoryKingomsUnicorn); // cannot participate in POL conflicts
                expect(this.player1).not.toBeAbleToSelect(this.toturi);
                expect(this.player1).not.toBeAbleToSelect(this.prodigy);
            });

            it('should move the chosen card to the conflict and add printed cost to the total, not modify its skill', function () {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.prodigy],
                    defenders: [],
                    ring: 'air',
                    type: 'political'
                });
                this.player2.pass();
                this.player1.clickCard(this.marvelousBeings);
                this.player1.clickCard(this.guardianKami);

                expect(this.guardianKami.isParticipating()).toBe(true);
                expect(this.guardianKami.getPoliticalSkill()).toBe(1);

                expect(this.getChatLogs(5)).toContain(
                    'player1 plays Marvelous Beings, moving Guardian Kami into the conflict to entrance the court, giving their side an extra 2political this conflict'
                );
                expect(this.getChatLogs(5)).toContain('Political Air conflict - Attacker: 5 Defender: 0'); //2 printed cost + 2 prodigy + 1 kami itself
            });

            it('gives a max bonus of 3', function () {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.prodigy],
                    defenders: [],
                    ring: 'air',
                    type: 'political'
                });
                this.player2.pass();
                this.player1.clickCard(this.marvelousBeings);
                this.player1.clickCard(this.aranat);

                expect(this.aranat.isParticipating()).toBe(true);
                expect(this.aranat.getPoliticalSkill()).toBe(6);

                expect(this.getChatLogs(5)).toContain(
                    'player1 plays Marvelous Beings, moving Aranat into the conflict to entrance the court, giving their side an extra 3political this conflict'
                );
                expect(this.getChatLogs(5)).toContain('Political Air conflict - Attacker: 11 Defender: 0'); // 2 prodigy + 6 aranat itself + 3 bonus from Marvelous
            });
        });
    });
});
