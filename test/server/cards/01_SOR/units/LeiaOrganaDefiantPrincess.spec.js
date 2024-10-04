describe('Leia Organa, Defiant Princess', function() {
    integration(function() {
        describe('Leia Organa, Defiant Princess\'s when played ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['leia-organa#defiant-princess'],
                        groundArena: [{ card: 'atst', exhausted: true }],
                        spaceArena: [{ card: 'cartel-spacer', exhausted: false }],
                        resources: ['han-solo#reluctant-hero', 'reinforcement-walker'],
                        leader: { card: 'jyn-erso#resisting-oppression', deployed: true, exhausted: false }
                    },
                    player2: {
                        groundArena: [{ card: 'wampa', exhausted: false }],
                        spaceArena: [{ card: 'alliance-xwing', exhausted: true }],
                        resources: ['ephant-mon#head-of-security', 'regional-governor']
                    }
                });
                this.regionalGovernor.exhausted = true; // setting a resource's exhausted state in setupTest causes an error, so doing it here
            });

            it('should be able to ready a friendly resource', function () {
                this.player1.clickCard(this.leiaOrgana);
                expect(this.hanSolo.exhausted).toBe(true);
                expect(this.reinforcementWalker.exhausted).toBe(true);
                // can select any exhausted resource or ready unit
                expect(this.player1).toBeAbleToSelectExactly([this.cartelSpacer, this.jynErso, this.hanSolo, this.reinforcementWalker, this.wampa, this.regionalGovernor]);
                this.player1.clickCard(this.hanSolo);
                expect(this.hanSolo.exhausted).toBe(false);
            });

            it('should be able to ready an enemy resource', function () {
                this.player1.clickCard(this.leiaOrgana);
                this.player1.clickCard(this.regionalGovernor);
                expect(this.regionalGovernor.exhausted).toBe(false);
            });

            it('should be able to exhaust an enemy unit', function () {
                this.player1.clickCard(this.leiaOrgana);
                this.player1.clickCard(this.wampa);
                expect(this.wampa.exhausted).toBe(true);
            });

            it('should be able to exhaust a friendly unit', function () {
                this.player1.clickCard(this.leiaOrgana);
                this.player1.clickCard(this.jynErso);
                expect(this.jynErso.exhausted).toBe(true);
            });
        });
    });
});
