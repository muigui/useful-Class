	var copy                = require( 'useful-copy' ),
		util                = require( 'useful-util' ),
		value               = require( 'useful-value' ),

		UNDEF,
		cache               = {
			__empty__      : { after : null, before : null, class : null, mixins : null, proto : null }
		},
		configuration_props = 'accessors afterdefine beforeinstance chain constructor extend mixins singleton statics'.split( ' ' ),
		internal_methods    = copy( Object.create( null ), {
			__override__   : { enumerable   : false, value      : override_instance_method },
			mixin          : { enumerable   : false, value      : mixin },
			original       : { configurable : true,  enumerable : false, value : util.noop, writable : true },
			parent         : { configurable : true,  enumerable : false, value : util.noop, writable : true }
		} ),
		re_invalid_chars    = /[^A-Za-z0-9_\.$<>\[\]\{\}]/g;

// expose
	Class.create   = Class.new = create;
	Class.define   = define;
	Class.get      = get;
	Class.is       = is;
	module.exports = Class;

// api
	function Class( descriptor ) {
		var Class = null, singleton;

		if ( descriptor && typeof descriptor === 'object' ) {
			singleton = descriptor.singleton; delete descriptor.singleton;

			Class = make_class( descriptor );
		}

		return singleton
			 ? make_singleton( Class, singleton )
			 : Class;
	}

	function create( classname ) {
		var Class = get( classname ), args;

		if ( !Class )
			return null;

		args = arguments.length > 1 ? Array.prototype.slice.call( arguments, 1 ) : [];

		return create_instance.apply( Class, args );
	}

	function define( classname, descriptor ) {
		if ( classname && typeof classname === 'object' ) {
			descriptor = classname;
			classname  = descriptor.__classname__ || descriptor.classname;
		}

		if ( !classname || typeof classname !== 'string' )
			classname  = cachename = null;
		else {
			classname  = classname.replace( re_invalid_chars, '' );
			cachename  = classname.toLowerCase();
		}

		if ( cachename in cache )
			throw new Error( 'class `' + classname + '` already exists.', 'cannot overwrite existing class.' );

		var ClassName, Constructor, NewClass, Package, cachename,
			module    = descriptor.module || util.global, path,
			singleton = !!descriptor.singleton;

		util.remove( descriptor, ['__classname__', 'classname', 'module'] );

		NewClass = Class( descriptor );

		if ( classname ) {
			path               = classname.split( '.' );
			ClassName          = path.pop();

			if ( module && module !== util.global )
				path.shift();

			Package            = value.bless( path, module );
			Package[ClassName] = NewClass;

			Constructor        = singleton ? NewClass.constructor : NewClass;
			cache[cachename]   = cache[Constructor.__guid__];

			Object.defineProperty( Constructor, '__classname__', {
				configurable : false,     enumerable : false,
				value        : classname, writable   : false
			} );
		}

		return NewClass;
	}

	function extend( descriptor ) {
		if ( !descriptor || typeof descriptor !== 'object' )
			descriptor = Object.create( null );

		descriptor.extend = this;

		return Class( descriptor );
	}

	function get( classname ) {
		return typeof classname === 'function' ? classname : ( cache[String( classname ).toLowerCase()] || cache.__empty__ ).class;
	}

	function is( instance, Class ) {
		if ( typeof Class === 'string' )
			Class = get( Class );

		return typeof Class === 'function'
			 ? instance instanceof Class
			 : false;
	}

// class helper methods
	function mixin_add( name, mixin ) {
		var mixins = this.__mixins__, proto;

		if ( name && typeof name === 'object' ) {
			mixin = name;
			for ( name in mixin )
				if ( Object.prototype.hasOwnProperty.call( mixin, name ) )
					mixin_add.call( this, name, mixin[name] );
		}
		else {
			if ( !( name in mixins ) ) {
				if ( typeof mixin === 'string' )
					mixin = get( mixin );

				if ( mixin ) { // noinspection FallThroughInSwitchStatementJS
					switch ( typeof mixin ) {
						case 'function' :
							mixin        = mixin.prototype;
						case 'object'   :
							mixins[name] = mixin;
							proto        = this.prototype;

							for ( name in mixin ) {
								if ( !( name in proto ) ) // noinspection JSUnfilteredForInLoop
									proto[name] = mixin[name];
							}

							break;
					}
				}
			}
		}

		return this;
	}

	function create_instance() {
		return singleton( this ) || this.apply( Object.create( this.prototype ), arguments );
	}

	function override( name, method ) {
		if ( name && typeof name === 'object' ) {
			method = name;
			for ( name in method )
				if ( Object.prototype.hasOwnProperty.call( method, name ) )
					override.call( this, name, method[name] );
		}
		else
			override_instance_method.call( this.prototype, name, method );

		return this;
	}

// class prototype default methods
	// for instances where a class only does not need its own constructor
	// rather than assign the super class as the constructor,
	function EmptyConstructor() {
		if ( this.constructor.__super__ !== Object ) {
			var return_value = this.parent( arguments );

			return return_value === UNDEF ? this : return_value;
		}
	}

	function mixin( name, args ) {
		if ( name && typeof name === 'string') {
			var method = this.__method__,
				mixin,
				mixins = this.constructor.__mixins__,
				return_value;

			if ( mixins && typeof mixins === 'object' ) {
				switch ( arguments.length ) {
					case 2  :            break;
					case 1  : args = []; break;
					default : args = Array.prototype.slice.call( arguments, 1 );
				}

				mixin        = mixins[name];
				return_value = mixin && typeof mixin[method] === 'function' ? mixin[method].apply( this, args ) : UNDEF;
			}
		}

		return this.__chain__ !== true || return_value !== UNDEF ? return_value : this;
	}

	function override_instance_method( name, method ) {
		if ( typeof method === 'function' )
			this[name] = make_method( 'original', name, method, this[name] );

		return this;
	}

// class construction methods
	function add_statics( Class, statics ) {
		if ( statics && typeof statics === 'object' )
			copy( Class, statics, true );

		if ( Class.__super__ )
			copy( Class, Class.__super__, true );

		return Class;
	}

	function decorate( Class ) {
		Class.create   = Class.new = create_instance.bind( Class );
		Class.extend   = extend.bind( Class );
		Class.mixin    = mixin_add.bind( Class );
		Class.override = override.bind( Class );

		return Class;
	}

	function extract_defaults( descriptor ) {
		return configuration_props.reduce( function( defaults, property ) {
			defaults[property] = descriptor[property];

			delete descriptor[property];

			return defaults;
		}, Object.create( null ) );
	}

	function make_class( descriptor ) {
		function Class() {
			if ( !this || this === util.global )
				return create_instance.apply( Class, arguments );

			if ( singleton( this.constructor ) )
				return this.constructor.__singleton__;

			if ( this.__processing__ !== true ) {
				this.__processing__ = true;
				process_before( this, arguments );
			}

			var return_value = Constructor.apply( this, arguments );

			delete this.__processing__;

			return return_value === UNDEF ? this : return_value;
		}

		var Constructor,
			config        = make_config( descriptor ),
			defaults      = extract_defaults( config ),
			ctor          = defaults.constructor,
			proto         = Class.prototype = make_prototype( config, defaults );

		if ( typeof ctor !== 'function' || ( ctor === Object || ctor === defaults.extend ) )
			ctor          = EmptyConstructor;

		Class.toString    = to_string.bind( null, ctor );
		Class.valueOf     = value_of.bind( null, ctor );
		Constructor       = make_method( 'parent', 'constructor', ctor, defaults.extend );
		proto.constructor = Class;

		Object.defineProperty( Class, '__super__', {
			configurable : false,
			enumerable   : false,
			value        : defaults.extend,
			writable     : false
		} );

		register( decorate( Class ) );

		make_accessors( proto, defaults.accessors );
		make_mixinable( Class, defaults.mixins );
		make_processable( Class, defaults.afterdefine, defaults.beforeinstance );

		add_statics( Class, defaults.statics );

		process_after( Class );

		return Class;
	}

	function make_accessors( proto, accessors ) {
		if ( !accessors || typeof accessors !== 'object' )
			return;

		var default_config = { configurable : false, enumerable : false },
			accessor, name;

		for ( name in accessors ) {
			if ( Object.prototype.hasOwnProperty.call( accessors, name ) ) {
				accessor = accessors[name];
				if ( accessor && typeof accessor === 'object' ) {
					delete accessors[name].writable;
					Object.defineProperty( proto, name, copy( accessors[name], default_config, true ) );
				}
			}
		}
	}

 // we're making a new version of the descriptor to a clean "empty" Object
	function make_config( descriptor ) {
		var config      = copy.merge( Object.create( null ), descriptor ),
			super_class = config.extend;

		if ( typeof super_class === 'string' )
			super_class = get( super_class );

		if ( typeof super_class !== 'function' )
			super_class = Object;

		config.extend   = super_class;

		return config;
	}

	function make_method( super_name, method_name, method, super_method ) {
		var original_super_method;

// unfortunatley, in order to chain with "Classes" not created using the `useful-Class` factory, we need to make sure `super_method` is always wrapped.
		if ( typeof super_method === 'function' && super_method === super_method.valueOf() ) {
			original_super_method = super_method;
			super_method          = function() {
				var return_value  = original_super_method.apply( this, arguments );

				return this.__chain__ === false || return_value !== UNDEF ? return_value : this;
			};
		}

		function Class_instance_method() {
			var args,
				previous_method = this.__method__,
				previous_super  = this[super_name] || util.noop,
				return_value,
				update_method   = !( previous_method in internal_methods || method_name in internal_methods );

			this[super_name]    = super_method || util.noop;

			if ( update_method )
				this.__method__ = method_name;

			args                = get_arguments( arguments, method_name, previous_method );
			return_value        = ( method || this[super_name] ).apply( this, args );

			if ( update_method )
				this.__method__ = previous_method;

			this[super_name]    = previous_super;

			return this.__chain__ === false || return_value !== UNDEF ? return_value : this;
		}

		Class_instance_method.displayName = method_name;
		Class_instance_method.valueOf     = value_of.bind(  null, method );
		Class_instance_method.toString    = to_string.bind( null, method );

		return Class_instance_method;
	}

	function make_mixinable( Class, mixins ) {
		Class.__mixins__ = Object.create( null );

		if ( mixins && typeof mixins === 'object' )
			Class.mixin( mixins );

		mixins = Class.__super__ ? Class.__super__.__mixins__ : null;

		if ( mixins && typeof mixins === 'object' )
			Class.mixin( mixins );

		return Class;
	}

	function make_processable( Class, after, before ) {
		var after_q, before_q, cached = cache[Class.__guid__], cached_super = cache[Class.__super__.__guid__];

		after_q  = cached_super && Array.isArray( cached_super.after )  ? cached_super.after.slice()  : [];

		if ( typeof after === 'function' )
			after_q.push( after );

		if ( after_q.length )
			cached.after = after_q;

		before_q = cached_super && Array.isArray( cached_super.before ) ? cached_super.before.slice() : [];

		if ( typeof before === 'function' )
			before_q.push( before );

		if ( before_q.length )
			cached.before = before_q;

		return Class;
	}

	function make__proto__( super_class ) {
		return super_class === Error || super_class.prototype instanceof Error
			 ? new super_class
			 : Object.create( super_class.prototype );
	}

	function make_prototype( descriptor, defaults ) {
		var internals = {
				__chain__  : { configurable : true, enumerable : false, value : defaults.chain !== false, writable : true },
				__method__ : { configurable : true, enumerable : false, value : null,                     writable : true }
			},
			property,
			prototype = make__proto__( defaults.extend );


		for ( property in descriptor ) {
			if ( Object.prototype.hasOwnProperty.call( descriptor, property ) ) {
				switch ( typeof descriptor[property] ) {
					case 'function' :
						prototype[property] = make_method( 'parent', property, descriptor[property], prototype[property] );
						break;
					default         :
						prototype[property] = descriptor[property];
				}
			}
		}

		for ( property in internal_methods ) {
			if ( !( property in prototype ) ) // noinspection JSUnfilteredForInLoop
				internals[property] = internal_methods[property];
		}

		Object.defineProperties( prototype, internals );

		return prototype;
	}

	function make_singleton( Class, config ) {
		var instance = create_instance.apply( Class, config === true ? [] : [].concat( config ) );

		Object.defineProperty( Class, '__singleton__', {
			configurable : false,    enumerable : false,
			value        : instance, writable   : false
		} );

		return instance;
	}

	function register( Class ) {
		var guid    = util.guid();
		cache[guid] = { class : Class };

		Object.defineProperty( Class, '__guid__', {
			configurable : false, enumerable : false,
			value        : guid,  writable   : false
		} );

		return Class;
	}

// internal methods
	function get_arguments( args, current_method, previous_method ) {
		if ( args.length && Object.prototype.toString.call( args[0] ) === '[object Arguments]' ) {
			if ( args.length < 2 && arguments.length > 1 ) {
				if ( current_method in internal_methods )
					return get_arguments( args[0] );

				if ( previous_method && current_method === previous_method )
					return args[0];
			}
		}

		return args;
	}

	function process_after( Class ) {
		if ( Class.__processed__ !== true ) {
			var queue = ( cache[Class.__guid__] || cache.__empty__ ).after,
				i     = -1,
				l     = Array.isArray( queue ) ? queue.length : 0;

			if ( l ) {
				while ( ++i < l )
					queue[i]( Class );

				Object.defineProperty( Class, '__processed__', {
					configurable : false, enumerable : false,
					value        : true,  writable   : false
				} );
			}
		}

		return Class;
	}

	function process_before( instance, args ) {
		if ( instance.__processing__ === true ) {
			var Class = instance.constructor,
				queue = ( cache[Class.__guid__] || cache.__empty__ ).before,
				i       = -1,
				l       = Array.isArray( queue ) ? queue.length : 0;

			if ( l ) {
				while ( ++i < l )
					queue[i]( Class, instance, args );
			}
		}

		return instance;
	}

	function singleton( Class ) {
		return !Class ? null : Class.__singleton__ || null;
	}

	function to_string( method ) {
		return method.toString();
	}

	function value_of( method ) {
		return method.valueOf();
	}
