describe('Feeding an Army', function() {
    integration(function() {
        describe('Feeding an Army\'s ability', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'draw',
                    player1: {
                        honor: 11,
                        fate: 5,
                        inPlay: ['ethereal-dreamer', 'doji-challenger', 'togashi-mitsu'],
                        hand: ['feeding-an-army'],
                        provinces: ['before-the-throne', 'manicured-garden', 'magistrate-station', 'public-forum']
                    },
                    player2: {
                        honor: 11,
                        inPlay: ['iuchi-shahai-2', 'ikoma-ikehata']
                    }
                });
                this.dreamer = this.player1.findCardByName('ethereal-dreamer');
                this.challenger = this.player1.findCardByName('doji-challenger');
                this.mitsu = this.player1.findCardByName('togashi-mitsu');
                this.feeding = this.player1.findCardByName('feeding-an-army');

                this.throne = this.player1.findCardByName('before-the-throne');
                this.garden = this.player1.findCardByName('manicured-garden');
                this.station = this.player1.findCardByName('magistrate-station');
                this.publicForum = this.player1.findCardByName('public-forum');

                this.throne.facedown = false;
                this.publicForum.facedown = false;
                this.garden.facedown = false;

                this.shahai = this.player2.findCardByName('iuchi-shahai-2');
                this.ikehata = this.player2.findCardByName('ikoma-ikehata');
                this.player1.clickPrompt('1');
                this.player2.clickPrompt('1');
            });

            it('should trigger when the conflict phase starts', function() {
                this.noMoreActions();
                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.feeding);
            });

            it('should ask you to break a faceup provinces', function() {
                this.noMoreActions();
                this.player1.clickCard(this.feeding);
                expect(this.player1).toHavePrompt('Select a province to break');
                expect(this.player1).toBeAbleToSelect(this.garden);
                expect(this.player1).toBeAbleToSelect(this.throne);
                expect(this.player1).not.toBeAbleToSelect(this.station);
                expect(this.player1).toBeAbleToSelect(this.publicForum);

            });

            it('should give your opponent the option to discard cards in the province you broke', function() {
                this.noMoreActions();
                this.player1.clickCard(this.feeding);
                this.player1.clickCard(this.garden);
                expect(this.player2).toHavePrompt('Break Manicured Garden');
                this.player2.clickPrompt('No');
                expect(this.garden.isBroken).toBe(true);
            });


            it('should trigger on break provinces that you break as a cost', function() {

                this.noMoreActions();
                this.player1.clickCard(this.feeding);
                this.player1.clickCard(this.throne);

                let p1Honor = this.player1.honor;
                let p2Honor = this.player2.honor;
                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.throne);
                this.player1.clickCard(this.throne);
                expect(this.player1.honor).toBe(p1Honor + 2);
                expect(this.player2.honor).toBe(p2Honor - 2);
                this.player2.clickPrompt('No');
            });

            it('should give a fate to all characters with less than 1 fate', function() {
                this.noMoreActions();
                this.player1.clickCard(this.feeding);
                this.player1.clickCard(this.garden);
                this.player2.clickPrompt('No');
                expect(this.dreamer.fate).toBe(1);
                expect(this.challenger.fate).toBe(1);
                expect(this.mitsu.fate).toBe(0);
                expect(this.shahai.fate).toBe(0);
                expect(this.getChatLogs(10)).toContain('player1 plays Feeding an Army, breaking Manicured Garden to place 1 fate on Ethereal Dreamer and Doji Challenger');

            });

            it('should allow Public Forum to replace the cost', function() {
                this.noMoreActions();
                this.player1.clickCard(this.feeding);
                this.player1.clickCard(this.publicForum);
                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.publicForum);

                this.player1.clickCard(this.publicForum);
                expect(this.getChatLogs(10)).toContain('player1 uses Public Forum to add an honor token to Public Forum instead of breaking it');

                expect(this.dreamer.fate).toBe(1);
                expect(this.challenger.fate).toBe(1);
                expect(this.mitsu.fate).toBe(0);
                expect(this.shahai.fate).toBe(0);
                expect(this.getChatLogs(10)).toContain('player1 plays Feeding an Army, breaking Public Forum to place 1 fate on Ethereal Dreamer and Doji Challenger');

            });
        });
    });
});
