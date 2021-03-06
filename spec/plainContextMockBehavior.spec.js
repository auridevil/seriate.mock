var mock = require( "../src/index.js" );
var expect = require( "expect.js" );
var sql = require( "seriate" );

mock( sql );

describe( "Plain Context Mocking behavior", function() {

	beforeEach( function() {
		sql.clearMock();
	} );

	describe( "when mock is a function", function() {
		var expectedResult = [
			{ name: "brian", paramVal: "foo", superpower: "lightning from fingertips" },
			{ name: "alex", paramVal: "foo", superpower: "gaseous anomalies" },
			{ name: "jim", paramVal: "foo", superpower: "drives doug crazy" },
			{ name: "doug", paramVal: "foo", superpower: "the human linter" },
			{ name: "gunny", paramVal: "foo", superpower: "kung fu" }
		];
		beforeEach( function() {
			sql.addMock( "guise", function( stepName, stepAction ) {
				return [
					{ name: "brian", paramVal: stepAction.params.testval, superpower: "lightning from fingertips" },
					{ name: "alex", paramVal: stepAction.params.testval, superpower: "gaseous anomalies" },
					{ name: "jim", paramVal: stepAction.params.testval, superpower: "drives doug crazy" },
					{ name: "doug", paramVal: stepAction.params.testval, superpower: "the human linter" },
					{ name: "gunny", paramVal: stepAction.params.testval, superpower: "kung fu" }
				];
			} );
		} );
		it( "should produce correct mock results", function( done ) {
			sql.getPlainContext()
				.step( "guise", {
					params: {
						testval: "foo"
					}
				} )
				.end( function( sets ) {
					expect( sets.guise ).to.eql( expectedResult );
					done();
				} );
		} );
	} );
	describe( "when mock is an array of static records", function() {
		var expectedResult = [
			{ name: "brian", superpower: "lightning from fingertips" },
			{ name: "alex", superpower: "gaseous anomalies" },
			{ name: "jim", superpower: "drives doug crazy" },
			{ name: "doug", superpower: "the human linter" },
			{ name: "gunny", superpower: "kung fu" }
		];
		beforeEach( function() {
			sql.addMock( "guise", [
				{ name: "brian", superpower: "lightning from fingertips" },
				{ name: "alex", superpower: "gaseous anomalies" },
				{ name: "jim", superpower: "drives doug crazy" },
				{ name: "doug", superpower: "the human linter" },
				{ name: "gunny", superpower: "kung fu" }
			] );
		} );
		it( "should produce correct mock results", function( done ) {
			sql.getPlainContext()
				.step( "guise", {
					testval: "foo"
				} )
				.end( function( sets ) {
					expect( sets.guise ).to.eql( expectedResult );
					done();
				} );
		} );
	} );

	describe( "When mock is specified as an error", function() {
		it( "should pass results to error callback", function( done ) {
			var expectedResult = new Error( "Uh oh" );
			sql.addMock( 'someMock', {
				mockResults: expectedResult,
				isError: true
			} );
			sql.getPlainContext()
				.step( "someMock", {
					params: {
						testval: "foo"
					}
				} )
				.error( function( err ) {
					expect( err ).to.eql( expectedResult );
					done();
				} );
		} );
	} );

	describe( "When mock contains a specified timeout", function() {
		it( "should wait appropriately to execute", function( done ) {
			this.timeout( 3000 );
			var start = Date.now();

			var expectedResult = [ "thing1", "thing2" ];
			sql.addMock( 'someMock', {
				mockResults: expectedResult,
				waitTime: 1000
			} );

			sql.getPlainContext()
				.step( "someMock", {
					params: {
						testval: "foo"
					}
				} )
				.end( function( sets ) {
					var interval = Date.now() - start;
					expect( interval >= 1000 && interval < 2000 ).to.be.ok();
					expect( sets.someMock ).to.eql( expectedResult );
					done();
				} );
		} );
	} );

	describe( "'once' option", function() {
		var expectedResult = [ { name: "HereIAmRockYouLikeAHurricane" } ];

		describe( "when once is false (by default)", function() {
			it( "should keep the mock after use", function( done ) {
				sql.addMock( 'someMock', {
					mockResults: expectedResult,
					once: false
				} );
				sql.getPlainContext()
					.step( "someMock", {
						params: {
							testval: "foo"
						}
					} )
					.end( function( sets ) {
						expect( sets.someMock ).to.eql( expectedResult );
						expect( sql.mockCache.root.someMock ).to.not.be( undefined );
						done();
					} );
			} );
		} );

		describe( "when once is true", function() {
			it( "should dispose of mock after one use", function( done ) {
				sql.addMock( 'someMock', {
					mockResults: expectedResult,
					once: true
				} );
				sql.getPlainContext()
					.step( "someMock", {
						params: {
							testval: "foo"
						}
					} )
					.end( function( sets ) {
						expect( sets.someMock ).to.eql( expectedResult );
						expect( sql.mockCache.root.someMock ).to.be( undefined );
						done();
					} );
			} );
		} );
	} );

} );
