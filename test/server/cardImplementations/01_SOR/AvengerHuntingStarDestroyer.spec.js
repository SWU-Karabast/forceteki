describe('Avenger, Hunting Star Destroyer', function() {
    integration(function() {
        describe('Avenger\'s destroy ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['avenger#hunting-star-destroyer'],
                        groundArena: ['pyke-sentinel'],
                        spaceArena: ['imperial-interceptor'],
                        resources: ['atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst'],
                        leader: ['director-krennic#aspiring-to-authority']
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['cartel-spacer', 'avenger#hunting-star-destroyer']
                    }
                });

                this.p1Avenger = this.player1.findCardByName('avenger#hunting-star-destroyer');
                this.interceptor = this.player1.findCardByName('imperial-interceptor');
                this.pykeSentinel = this.player1.findCardByName('pyke-sentinel');

                this.wampa = this.player2.findCardByName('wampa');
                this.cartelSpacer = this.player2.findCardByName('cartel-spacer');
                this.p2Avenger = this.player2.findCardByName('avenger#hunting-star-destroyer');

                this.p1Base = this.player1.base;
                this.p2Base = this.player2.base;

                this.noMoreActions();
            });

            it('forces opponent to defeat friendly non-leader unit when Avenger is played', function () {
                // Play Avenger
                this.player1.clickCard(this.p1Avenger);

                // Player 2 must choose its own unit
                expect(this.player2).toBeAbleToSelectAllOf([this.wampa, this.cartelSpacer, this.p2Avenger]);
                expect(this.player2).toBeAbleToSelectNoneOf([this.p1Avenger, this.interceptor, this.pykeSentinel]);
                this.player2.clickCard(this.cartelSpacer);

                // Chosen unit defeated
                expect(this.cartelSpacer.location).toBe('discard');
            });

            it('forces opponent to defeat friendly non-leader unit when Avenger attacks', function () {
                this.player2.setActivePlayer();

                // Attack with Avenger, choose base as target
                this.player2.clickCard(this.p2Avenger);
                this.player2.clickCard(this.p1Base);

                // Player 1 must choose its own unit
                expect(this.player1).toBeAbleToSelectAllOf([this.interceptor, this.pykeSentinel]);
                expect(this.player1).toBeAbleToSelectNoneOf([this.wampa, this.cartelSpacer, this.p2Avenger]);
                this.player1.clickCard(this.pykeSentinel);
                expect(this.pykeSentinel.location).toBe('discard');
                expect(this.p1Base.damage).toBe(8);
            });

            it('allows the defender to be defeated and end the attack', function () {
                this.player2.setActivePlayer();

                // Attack with Avenger, choose interceptor as target
                this.player2.clickCard(this.p2Avenger);
                this.player2.clickCard(this.interceptor);

                expect(this.interceptor.location).toBe('space arena');

                // Player 1 must choose its own unit
                expect(this.player1).toBeAbleToSelectAllOf([this.interceptor, this.pykeSentinel]);
                expect(this.player1).toBeAbleToSelectNoneOf([this.wampa, this.cartelSpacer, this.p2Avenger]);

                // Choose the defender
                this.player1.clickCard(this.interceptor);
                expect(this.interceptor.location).toBe('discard');

                // Ensure no damage happened
                expect(this.p2Avenger.damage).toBe(0);
                expect(this.p1Base.damage).toBe(0);
            });

            // it('Deployed leader units may not be chosen for Avenger ability', function () {
            //     this.player1.clickCard(this.p1Avenger);
            //     expect(this.p1Avenger.location).toBe('space arena');
            // });
        });
    });
});
