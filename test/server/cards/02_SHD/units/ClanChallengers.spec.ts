describe('Clan Challengers', function() {
    integration(function() {
        describe('Clan Challengers\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'clan-challengers', upgrades: ['academy-training'] }]
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });
            });

            it('should give Overwhelm to itself when upgraded', function () {
                this.player1.clickCard(this.clanChallengers);
                this.player1.clickCard(this.wampa);

                expect(this.wampa).toBeInLocation('discard');
                expect(this.p2Base.damage).toBe(3); // 3 printed + 3 raid + 2 upgrade = 8, wampa has 5 hp
                expect(this.clanChallengers.exhausted).toBe(true);
                expect(this.clanChallengers.damage).toBe(4);
            });
        });

        describe('Clan Challengers\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['clan-challengers']
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });
            });

            it('should not give Overwhelm to itself when not upgraded', function () {
                this.player1.clickCard(this.clanChallengers);
                this.player1.clickCard(this.wampa);

                expect(this.wampa).toBeInLocation('discard');
                expect(this.p2Base.damage).toBe(0);
                expect(this.clanChallengers.exhausted).toBe(true);
                expect(this.clanChallengers.damage).toBe(4);
            });
        });
    });
});
