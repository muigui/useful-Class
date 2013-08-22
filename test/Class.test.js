suite( 'muigui/useful-Class', function() {
	var mod         = {}, // dummy module to assign classes to
// class definitions
		Class_01    = Class( {
			constructor : function LoremIpsum( greeting ) {
				this.greeting = greeting;
				this.setNum( 10 );
			},
			getNum      : function() { return this.num; },
			setNum      : function( num ) {
				this.num = num;
				return this.getNum();
			},
			statics     : {
				foo     : 'bar',
				bam     : function() { return 'bam'; }
			}
		} ),
		Class_02    = Class.define( 'path.to.Class_02', {
			constructor : function( greeting ) {
				this.parent( 'class_02: ' + greeting );
			},
			extend      : Class_01,
			module      : mod,
			getNum      : function() {
				return this.parent();
			},
			statics     : {
				foo     : 'barfly'
			}
		} ),
		Class_03    = Class.define( 'Class_03', {
			constructor : function Class_03( greeting ) {
				this.parent( 'class_03: ' + greeting );
			},
			extend      : 'path.to.Class_02',
			module      : mod,
			statics     : {
				bam     : function() { return 'bambam'; }
			}
		} ),
		Class_04    = Class( {
			constructor : function Class_04( greeting ) {
				this.parent( 'class_04: ' + greeting );
			},
			extend      : Class_03,
			getNum      : function() {
				return this.parent();
			},
			statics     : {
				foo     : 'barflyonthewall',
				bam     : function() { return 'bambambam'; }
			}
		} ),
// instances
		instance_01 = new Class_01( 'hello world!' ),
		instance_02 = Class.new( 'path.to.Class_02', 'hello world!' ),
		instance_03 = Class_03.new.call( this, 'hello world!' ),
		instance_04 = Class_04.new.apply( this, ['hello world!'] ),
// base namespace for test classes
		path        = mod;

	Class.define( 'path.to.Singleton_01', {
		constructor : function() { this.parent( 'singleton_01: hello world!' ); },
		extend      : Class_04,
		module      : mod,
		singleton   : true,
		getNum      : function() { return this.parent(); }
	} );

	suite( 'core functionality', function() {
		test( '<static> Class.is', function( done ) {
			expect( Class.is( instance_01, Class_01 ) ).to.be.true;
			expect( Class.is( instance_01, Object ) ).to.be.true;

			expect( Class.is( instance_02, Class_02 ) ).to.be.true;
			expect( Class.is( instance_02, Class_01 ) ).to.be.true;
			expect( Class.is( instance_02, Object ) ).to.be.true;

			expect( Class.is( instance_03, Class_03 ) ).to.be.true;
			expect( Class.is( instance_03, Class_02 ) ).to.be.true;
			expect( Class.is( instance_03, Class_01 ) ).to.be.true;
			expect( Class.is( instance_03, Object ) ).to.be.true;

			expect( Class.is( instance_04, Class_04 ) ).to.be.true;
			expect( Class.is( instance_04, Class_03 ) ).to.be.true;
			expect( Class.is( instance_04, Class_02 ) ).to.be.true;
			expect( Class.is( instance_04, Class_01 ) ).to.be.true;
			expect( Class.is( instance_04, Object ) ).to.be.true;

			expect( Class.is( path.to.Singleton_01, path.to.Singleton_01.constructor ) ).to.be.true;
			expect( Class.is( path.to.Singleton_01, Class_04 ) ).to.be.true;
			expect( Class.is( path.to.Singleton_01, Class_03 ) ).to.be.true;
			expect( Class.is( path.to.Singleton_01, Class_02 ) ).to.be.true;
			expect( Class.is( path.to.Singleton_01, Class_01 ) ).to.be.true;
			expect( Class.is( path.to.Singleton_01, Object ) ).to.be.true;

			done();
		} );

		test( 'instantiating with the new operator', function( done ) {
			var f, b, z, w;
			expect( ( f = new Class_01( 'hello world!' ) ) instanceof Class_01 ).to.be.true;
			expect( f.greeting ).to.eql( 'hello world!' );
			expect( ( b = new Class_02( 'hello world!' ) ) instanceof Class.get( 'path.to.Class_02' ) ).to.be.true;
			expect( b instanceof Class_01 ).to.be.true;
			expect( b.greeting ).to.eql( 'class_02: hello world!' );
			expect( ( z = new Class_03( 'hello world!' ) ) instanceof Class.get( 'Class_03' ) ).to.be.true;
			expect( z instanceof Class_02 ).to.be.true;
			expect( z instanceof Class_01 ).to.be.true;
			expect( z.greeting ).to.eql( 'class_02: class_03: hello world!' );
			expect( ( w = new Class_04( 'hello world!' ) ) instanceof Class_04 ).to.be.true;
			expect( w instanceof Class_03 ).to.be.true;
			expect( w instanceof Class_02 ).to.be.true;
			expect( w instanceof Class_01 ).to.be.true;
			expect( w.greeting ).to.eql( 'class_02: class_03: class_04: hello world!' );
			expect( path.to.Singleton_01 instanceof path.to.Singleton_01.constructor ).to.be.true;
			expect( path.to.Singleton_01 instanceof Class_04 ).to.be.true;
			expect( path.to.Singleton_01 instanceof Class_03 ).to.be.true;
			expect( path.to.Singleton_01 instanceof Class_02 ).to.be.true;
			expect( path.to.Singleton_01 instanceof Class_01 ).to.be.true;

			done();
		} );

		test( 'instantiating without the new operator', function( done ) {
			var f, b, z, w;
			expect( ( f = Class_01( 'hello world!' ) ) instanceof Class_01 ).to.be.true;
			expect( f.greeting ).to.eql( 'hello world!' );
			expect( ( b = Class_02( 'hello world!' ) ) instanceof Class_02 ).to.be.true;
			expect( b.greeting ).to.eql( 'class_02: hello world!' );
			expect( ( z = Class_03( 'hello world!' ) ) instanceof Class_03 ).to.be.true;
			expect( z.greeting ).to.eql( 'class_02: class_03: hello world!' );
			expect( ( w = Class_04( 'hello world!' ) ) instanceof Class_04 ).to.be.true;
			expect( w.greeting ).to.eql( 'class_02: class_03: class_04: hello world!' );

			done();
		} );

		test( 'instantiating a Class with its `create`/`new` factory methods', function( done ) {
			var f, b, z, w;
			expect( ( f = Class_01.create( 'hello world!' ) ) instanceof Class_01 ).to.be.true;
			expect( f.greeting ).to.eql( 'hello world!' );
			expect( ( b = Class_02.new( 'hello world!' ) ) instanceof Class_02 ).to.be.true;
			expect( b.greeting ).to.eql( 'class_02: hello world!' );
			expect( ( z = Class_03.create( 'hello world!' ) ) instanceof Class_03 ).to.be.true;
			expect( z.greeting ).to.eql( 'class_02: class_03: hello world!' );
			expect( ( w = Class_04.new( 'hello world!' ) ) instanceof Class_04 ).to.be.true;
			expect( w.greeting ).to.eql( 'class_02: class_03: class_04: hello world!' );

			done();
		} );

		test( 'instantiating a Class with the top level Class.new factory method', function( done ) {
			var f, b, z, w;
			expect( ( b = Class.new( 'path.to.Class_02', 'hello world!' ) ) instanceof Class_02 ).to.be.true;
			expect( b.greeting ).to.eql( 'class_02: hello world!' );
			expect( ( z = Class.new( 'Class_03', 'hello world!' ) ) instanceof Class_03 ).to.be.true;
			expect( z.greeting ).to.eql( 'class_02: class_03: hello world!' );
			expect( ( w = Class.new( Class_04, 'hello world!' ) ) instanceof Class_04 ).to.be.true;
			expect( w.greeting ).to.eql( 'class_02: class_03: class_04: hello world!' );

			done();
		} );

		test( 'inheritance', function( done ) {
			instance_01.setNum( 10 ); instance_02.setNum( 10 );
			instance_03.setNum( 10 ); instance_04.setNum( 10 );
			path.to.Singleton_01.setNum( 10 );

			expect( instance_01.getNum() ).to.eql( 10 );
			expect( instance_01.setNum( 100 ) ).to.eql( 100 );
			expect( instance_01.getNum() ).to.eql( 100 );

			expect( instance_02.getNum() ).to.eql( 10 );
			expect( instance_02.setNum( 200 ) ).to.eql( 200 );
			expect( instance_01.getNum() ).to.eql( 100 );

			expect( instance_03.getNum() ).to.eql( 10 );
			expect( instance_03.setNum( 400 ) ).to.eql( 400 );
			expect( instance_01.getNum() ).to.eql( 100 );
			expect( instance_02.getNum() ).to.eql( 200 );

			expect( instance_04.getNum() ).to.eql( 10 );
			expect( instance_04.setNum( 800 ) ).to.eql( 800 );
			expect( instance_01.getNum() ).to.eql( 100 );
			expect( instance_02.getNum() ).to.eql( 200 );
			expect( instance_03.getNum() ).to.eql( 400 );

			expect( path.to.Singleton_01.getNum() ).to.eql( 10 );
			expect( path.to.Singleton_01.setNum( 1000 ) ).to.eql( 1000 );
			expect( instance_01.getNum() ).to.eql( 100 );
			expect( instance_02.getNum() ).to.eql( 200 );
			expect( instance_03.getNum() ).to.eql( 400 );
			expect( instance_04.getNum() ).to.eql( 800 );

			done();
		} );

		test( 'singletons', function( done ) {
			expect( new path.to.Singleton_01.constructor() ).to.equal( path.to.Singleton_01 );
			expect( path.to.Singleton_01.constructor() ).to.equal( path.to.Singleton_01 );
			expect( path.to.Singleton_01.constructor.create() ).to.equal( path.to.Singleton_01 );
			expect( Class.new( 'path.to.Singleton_01', 1, 2, 3 ) ).to.equal( path.to.Singleton_01 );

			done();
		} );

		test( 'static properties and methods', function( done ) {
			expect( Class_01.foo ).to.equal( 'bar' );
			expect( Class_02.foo ).to.equal( 'barfly' );
			expect( Class_03.foo ).to.equal( 'barfly' );
			expect( Class_04.foo ).to.equal( 'barflyonthewall' );
			expect( path.to.Singleton_01.constructor.foo ).to.equal( 'barflyonthewall' );

			expect( Class_01.bam() ).to.equal( 'bam' );
			expect( Class_02.bam() ).to.equal( 'bam' );
			expect( Class_03.bam() ).to.equal( 'bambam' );
			expect( Class_04.bam() ).to.equal( 'bambambam' );
			expect( path.to.Singleton_01.constructor.bam() ).to.equal( 'bambambam' );

			done();
		} );

//		test( 'type checking', function( done ) {
//			expect( type( instance_01 ) ).to.eql( 'loremipsum' );
//			expect( type( instance_02 ) ).to.eql( 'path.to.Class_02' );
//			expect( type( instance_03 ) ).to.eql( 'Class_03' );
//			expect( type( path.to.Singleton_01 ) ).to.eql( 'path.to.Singleton_01' );
//			expect( type( instance_04 ) ).to.eql( 'class_04' );
//
//			done();
//		} );
	} );

	suite( 'pre/post processing', function() {
		test( 'executing functions after a Class is created', function( done ) {
			var after_define_01 = 0, after_define_02 = 0, after_define_02a = 0;
			Class.define( 'PostProcessingTest_01', {
				afterdefine    : function() {
					++after_define_01;
				},
				constructor    : function PostProcessingTest_01() {
					this.parent( arguments );
				},
				module         : mod
			} );

			expect( after_define_01 ).to.be.equal( 1 );

			Class.define( 'PostProcessingTest_02', {
				afterdefine : function() {
					++after_define_02;
				},
				extend      : mod.PostProcessingTest_01,
				module      : mod
			} );

			expect( after_define_01 ).to.be.equal( 2 );
			expect( after_define_02 ).to.be.equal( 1 );

			Class.define( 'PostProcessingTest_02a', {
				afterdefine : function() {
					++after_define_02a;
				},
				extend      : mod.PostProcessingTest_02,
				module      : mod
			} );

			expect( after_define_01 ).to.be.equal( 3 );
			expect( after_define_02 ).to.be.equal( 2 );
			expect( after_define_02a ).to.be.equal( 1 );

			done();
		} );

		test( 'executing functions before a Class is instantiated', function( done ) {
			var before_instance_01 = 0, before_instance_02 = 0, before_instance_02a = 0;

			Class.define( 'PreProcessingTest_03', {
				beforeinstance : function( Class, instance, args ) {
					expect( instance ).to.be.an.instanceof( Class );
					expect( args[0] ).to.eql( [1,2,3] );
					++before_instance_01;
				},
				constructor    : function PreProcessingTest_03() {
					this.parent( arguments );
				},
				module         : mod
			} );

			Class.new( 'PreProcessingTest_03', [1, 2, 3] );

			expect( before_instance_01 ).to.be.equal( 1 );

			Class.define( 'PreProcessingTest_04', {
				beforeinstance : function( Class, instance, args ) {
					expect( instance ).to.be.an.instanceof( Class );
					expect( args[0] ).to.eql( [1,2,3] );
					++before_instance_02;
				},
				extend         : mod.PreProcessingTest_03,
				module         : mod
			} );

			Class.new( 'PreProcessingTest_04', [1, 2, 3] );

			expect( before_instance_01 ).to.be.equal( 2 );
			expect( before_instance_02 ).to.be.equal( 1 );

			Class.define( 'PreProcessingTest_04a', {
				beforeinstance : function( Class, instance, args ) {
					expect( instance ).to.be.an.instanceof( Class );
					expect( args[0] ).to.eql( [1,2,3] );
					++before_instance_02a;
				},
				extend         : mod.PreProcessingTest_04,
				module         : mod
			} );

			Class.new( 'PreProcessingTest_04a', [1, 2, 3] );

			expect( before_instance_01 ).to.be.equal( 3 );
			expect( before_instance_02 ).to.be.equal( 2 );
			expect( before_instance_02a ).to.be.equal( 1 );

			done();
		} );
	} );

	suite( 'overriding methods', function() {
		test( 'overriding a Class\' methods', function( done ) {
			var called_getNum = false,
				called_setNum = false,
				instance;

			Class_02.override( 'getNum', function() {
				called_getNum = true;
				return this.original();
			} );

			Class_02.override( {
				setNum : function( num ) {
					called_setNum = true;
					num += 100;
					return this.original( arguments );
				}
			} );

			instance = new Class_02( 'hello' );

			expect( called_getNum ).to.be.true;
			expect( called_setNum ).to.be.true;

			expect( instance.num ).to.equal( 110 );

			called_getNum = false;

			expect( instance.getNum() ).to.equal( 110 );
			expect( called_getNum ).to.be.true;
			expect( instance.getNum() ).to.equal( instance.num );

			called_setNum = false;

			expect( instance.setNum( 100 ) ).to.equal( 200 );

			expect( called_setNum ).to.be.true;

			expect( instance.num ).to.equal( 200 );

			done();
		} );

		test( 'overriding a Class instance\'s methods', function( done ) {
			var called_getNum = false,
				called_setNum = false,
				instance = new Class_01( 'hello' );

			instance.__override__( 'getNum', function() {
				called_getNum = true;
				return this.original();
			} );
			instance.__override__( 'setNum', function( num ) {
				called_setNum = true;
				num += 100;
				return this.original( arguments );
			} );

			instance.getNum();

			expect( called_getNum ).to.be.true;

			instance.setNum( 10 );

			expect( called_setNum ).to.be.true;

			expect( instance.num ).to.equal( 110 );

			called_getNum = false;

			expect( instance.getNum() ).to.equal( 110 );
			expect( called_getNum ).to.be.true;
			expect( instance.getNum() ).to.equal( instance.num );

			called_setNum = false;

			expect( instance.setNum( 100 ) ).to.equal( 200 );

			expect( called_setNum ).to.be.true;

			expect( instance.num ).to.equal( 200 );

			called_getNum = false;
			called_setNum = false;
			instance      = new Class_01( 'howdy' );

			instance.getNum();

			expect( called_getNum ).to.be.false;
			expect( called_setNum ).to.be.false;

			called_getNum = false;

			expect( instance.getNum() ).to.equal( 10 );
			expect( called_getNum ).to.be.false;

			called_setNum = false;

			expect( instance.setNum( 100 ) ).to.equal( 100 );
			expect( called_setNum ).to.be.false;

			done();
		} );
	} );

	suite( 'mixins', function() {
		test( 'basic functionality', function( done ) {
			var expected_object      = { num : 250 },
				instance,
				mixintest_ctor_called  = false,
				mixintest_mixin_called = false;

			Class.define( 'MixinTest_01', {
				constructor   : function MixinTest_01() {
					this.mixin( 'mixintest', arguments );
				},
				mixins        : {
					mixintest : {
						constructor : function() {
							mixintest_ctor_called = true;
						},
						bar         : function() {
							mixintest_mixin_called = true;
						}
					}
				},
				module        : mod,
				bar           : function( arg1, arg2, arg3 ) {
					expect( arg1 ).to.equal( 'foo' );
					expect( arg2 ).to.equal( util.noop );
					expect( arg3 ).to.equal( expected_object );

					this.mixin( 'mixintest', arguments );
				}
			} );

			instance = Class.new( 'MixinTest_01' );

			expect( mixintest_ctor_called ).to.be.true;

			instance.bar( 'foo', util.noop, expected_object );

			expect( mixintest_mixin_called ).to.be.true;

			done();
		} );

		test( 'mixins with inheritance', function( done ) {
			var GenericMixin_01_foo_called = false,
				GenericMixin_02_bar_called = false,
				instance;

			Class.define( 'GenericMixin_01', {
				module : mod,
				foo    : function( foo ) {
					GenericMixin_01_foo_called = true;
					expect( foo ).to.equal( 'bar' );
					return foo;
				}
			} );

			mod.GenericMixin_02 = {
				bar : function( bar ) {
					GenericMixin_02_bar_called = true;
					expect( bar ).to.equal( 'foo' );
				}
			};

			Class.define( 'MixinTest_02', {
				mixins  : {
					foo : mod.GenericMixin_01,
					bar : mod.GenericMixin_02
				},
				module  : mod,
				bar     : function() {
					return this.mixin( 'foo', arguments ).mixin( 'bar', arguments );
				}
			} );

			instance = new mod.MixinTest_02();

			expect( instance.foo( 'bar' ) ).to.equal( 'bar' );
			expect( instance.bar( 'foo' ) ).to.equal( instance );

			expect( GenericMixin_01_foo_called ).to.be.true;
			expect( GenericMixin_02_bar_called ).to.be.true;

			done();
		} );
	} );
} );
